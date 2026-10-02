import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { db, type User } from "./db";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get("echappee_session")?.value;
  if (!token) return null;
  return (
    (db
      .prepare(
        "SELECT u.id,u.prenom,u.nom,u.email,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?",
      )
      .get(digest(token), Date.now()) as User) || null
  );
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin")
    redirect("/?erreur=Accès réservé aux administrateurs.");
  return user;
}
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
    digest(token),
    userId,
    Date.now() + 7 * 86400000,
  );
  (await cookies()).set("echappee_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get("echappee_session")?.value;
  if (token)
    db.prepare("DELETE FROM sessions WHERE token=?").run(digest(token));
  jar.delete("echappee_session");
}
