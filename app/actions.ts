"use server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prepareImage } from "@/lib/uploads";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, book, cancel } from "@/lib/db";
import {
  createSession,
  destroySession,
  requireUser,
  requireAdmin,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
export interface FormState {
  error?: string;
}
const identity = z.object({
  prenom: z.string().trim().min(2, "Prénom : 2 caractères minimum.").max(60),
  nom: z.string().trim().min(2, "Nom : 2 caractères minimum.").max(60),
  email: z.email("Adresse email invalide.").toLowerCase().max(200),
});
const password = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(128);
const values = (form: FormData) => Object.fromEntries(form.entries());
export async function register(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = identity
    .extend({ motdepasse: password })
    .safeParse(values(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;
  if (db.prepare("SELECT id FROM users WHERE email=?").get(p.email))
    return { error: "Cette adresse email est déjà utilisée." };
  const result = db
    .prepare("INSERT INTO users(prenom,nom,email,motdepasse) VALUES(?,?,?,?)")
    .run(p.prenom, p.nom, p.email, hashPassword(p.motdepasse));
  await createSession(Number(result.lastInsertRowid));
  redirect("/reservations?succes=Bienvenue ! Votre compte est prêt.");
}
export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const pass = String(form.get("motdepasse") || "");
  if (email.length > 200 || pass.length > 128)
    return { error: "Identifiants invalides." };
  const attempts = db
    .prepare("SELECT * FROM login_attempts WHERE email=?")
    .get(email) as { attempts: number; reset_at: number } | undefined;
  if (attempts && attempts.reset_at > Date.now() && attempts.attempts >= 8)
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const user = db
    .prepare("SELECT id,motdepasse FROM users WHERE email=?")
    .get(email) as { id: number; motdepasse: string } | undefined;
  if (!user || !verifyPassword(pass, user.motdepasse)) {
    db.prepare(
      "INSERT INTO login_attempts VALUES(?,1,?) ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END",
    ).run(email, Date.now() + 900000, Date.now(), Date.now());
    return { error: "Email ou mot de passe incorrect." };
  }
  db.prepare("DELETE FROM login_attempts WHERE email=?").run(email);
  await createSession(user.id);
  redirect("/reservations");
}
export async function logout() {
  await destroySession();
  redirect("/");
}
export async function updateProfile(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = identity.safeParse(values(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;
  if (
    db
      .prepare("SELECT id FROM users WHERE email=? AND id<>?")
      .get(p.email, user.id)
  )
    return { error: "Cette adresse email est déjà utilisée." };
  db.prepare("UPDATE users SET prenom=?,nom=?,email=? WHERE id=?").run(
    p.prenom,
    p.nom,
    p.email,
    user.id,
  );
  revalidatePath("/", "layout");
  redirect("/profil?succes=Votre profil a été mis à jour.");
}
export async function deleteProfile(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const stored = db
    .prepare("SELECT motdepasse FROM users WHERE id=?")
    .get(user.id) as { motdepasse: string };
  const pass = String(form.get("motdepasse") || "");
  if (pass.length > 128 || !verifyPassword(pass, stored.motdepasse))
    return { error: "Mot de passe incorrect." };
  await destroySession();
  db.prepare("DELETE FROM users WHERE id=?").run(user.id);
  revalidatePath("/");
  redirect("/?succes=Votre compte a été supprimé.");
}
export async function reserve(form: FormData) {
  const user = await requireUser();
  const id = Number(form.get("id"));
  try {
    book(user.id, id);
  } catch (e) {
    redirect(
      `/activites/${id}?erreur=${encodeURIComponent(e instanceof Error ? e.message : "Réservation impossible.")}`,
    );
  }
  revalidatePath("/", "layout");
  redirect("/reservations?succes=Votre aventure est réservée !");
}
export async function cancelBooking(form: FormData) {
  const user = await requireUser();
  try {
    cancel(user.id, Number(form.get("id")));
  } catch (e) {
    redirect(
      "/reservations?erreur=" +
        encodeURIComponent(
          e instanceof Error ? e.message : "Annulation impossible.",
        ),
    );
  }
  revalidatePath("/", "layout");
  redirect("/reservations?succes=Votre réservation a été annulée.");
}
const activitySchema = z.object({
  nom: z.string().trim().min(3).max(100),
  type_id: z.coerce.number().int().positive(),
  places_disponibles: z.coerce.number().int().min(1).max(500),
  description: z.string().trim().min(20).max(4000),
  datetime_debut: z.string().datetime({ offset: true }),
  duree: z.coerce.number().int().min(15).max(1440),
  prix: z.coerce.number().int().min(0).max(1000),
  niveau: z.enum(["Débutant", "Tous niveaux", "Intermédiaire", "Confirmé"]),
});
export async function saveActivity(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const p = activitySchema.safeParse(values(form));
  if (!p.success)
    return { error: "Vérifiez les champs : " + p.error.issues[0].message };
  const a = p.data;
  const id = Number(form.get("id"));
  if (new Date(a.datetime_debut) <= new Date())
    return { error: "Choisissez une date future." };
  if (!db.prepare("SELECT id FROM type_activite WHERE id=?").get(a.type_id))
    return { error: "Type invalide." };
  const previous = id
    ? (db.prepare("SELECT image FROM activites WHERE id=?").get(id) as
        { image: string } | undefined)
    : undefined;
  if (id && !previous) return { error: "Activité introuvable." };
  const file = form.get("photo");
  let uploaded: Buffer | undefined;
  if (file instanceof File && file.size > 0) {
    try {
      uploaded = await prepareImage(file);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Import impossible." };
    }
  }
  const photoId = uploaded ? randomUUID() : undefined;
  const image = photoId
    ? `/photos/${photoId}`
    : previous?.image || "photo-1441974231531-c6227db76b6e";
  const args = [
    a.nom,
    a.type_id,
    a.places_disponibles,
    a.description,
    a.datetime_debut,
    a.duree,
    a.prix,
    image,
    a.niveau,
  ];
  try {
    db.transaction(() => {
      // Photo and activity are committed together, avoiding orphaned uploads on failure.
      if (uploaded && photoId)
        db.prepare("INSERT INTO photos(id,contenu) VALUES(?,?)").run(
          photoId,
          uploaded,
        );
      if (id) {
        const count = db
          .prepare(
            "SELECT COUNT(*) AS n FROM reservations WHERE activite_id=? AND etat=1",
          )
          .get(id) as { n: number };
        if (a.places_disponibles < count.n)
          throw new Error(
            "La capacité ne peut pas être inférieure au nombre de réservations.",
          );
        const result = db
          .prepare(
            "UPDATE activites SET nom=?,type_id=?,places_disponibles=?,description=?,datetime_debut=?,duree=?,prix=?,image=?,niveau=? WHERE id=?",
          )
          .run(...args, id);
        if (!result.changes) throw new Error("Activité introuvable.");
      } else
        db.prepare(
          "INSERT INTO activites(nom,type_id,places_disponibles,description,datetime_debut,duree,prix,image,niveau) VALUES(?,?,?,?,?,?,?,?,?)",
        ).run(...args);
      if (uploaded && previous?.image.startsWith("/photos/"))
        db.prepare("DELETE FROM photos WHERE id=?").run(
          previous.image.slice(8),
        );
    }).immediate();
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Enregistrement impossible.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/admin?succes=Activité enregistrée.");
}
export async function deleteActivity(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  db.transaction(() => {
    const previous = db
      .prepare("SELECT image FROM activites WHERE id=?")
      .get(id) as { image: string } | undefined;
    db.prepare("DELETE FROM activites WHERE id=?").run(id);
    if (previous?.image.startsWith("/photos/"))
      db.prepare("DELETE FROM photos WHERE id=?").run(previous.image.slice(8));
  }).immediate();
  revalidatePath("/", "layout");
  redirect("/admin?succes=Activité supprimée.");
}
