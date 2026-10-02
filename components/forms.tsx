"use client";
import { useActionState, useEffect, useState } from "react";
import { photo } from "@/lib/format";
import { useFormStatus } from "react-dom";
import {
  register,
  login,
  updateProfile,
  deleteProfile,
  saveActivity,
  type FormState,
} from "@/app/actions";
import type { User, Activity } from "@/lib/db";
export function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="button" disabled={pending}>
      {pending ? "Un instant…" : children}
    </button>
  );
}
function ErrorMessage({ state }: { state: FormState }) {
  return state.error ? (
    <p className="notice error" role="alert">
      {state.error}
    </p>
  ) : null;
}
export function AccountForm({
  mode,
  user,
}: {
  mode: "login" | "register" | "profile";
  user?: User;
}) {
  const [state, action] = useActionState(
    mode === "login" ? login : mode === "register" ? register : updateProfile,
    {},
  );
  return (
    <form action={action} className="form">
      <ErrorMessage state={state} />
      {mode !== "login" && (
        <div className="form-row">
          <label>
            Prénom
            <input
              name="prenom"
              autoComplete="given-name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={user?.prenom}
            />
          </label>
          <label>
            Nom
            <input
              name="nom"
              autoComplete="family-name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={user?.nom}
            />
          </label>
        </div>
      )}
      <label>
        Adresse email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={user?.email}
        />
      </label>
      {mode !== "profile" && (
        <label>
          Mot de passe
          <input
            name="motdepasse"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={mode === "register" ? 10 : 1}
            maxLength={128}
            required
          />
          {mode === "register" && <small>Au moins 10 caractères.</small>}
        </label>
      )}
      <Submit>
        {mode === "login"
          ? "Se connecter"
          : mode === "register"
            ? "Créer mon compte"
            : "Enregistrer les modifications"}
      </Submit>
    </form>
  );
}
export function DeleteProfile() {
  const [state, action] = useActionState(deleteProfile, {});
  return (
    <details className="danger">
      <summary>Supprimer mon compte</summary>
      <p>
        Cette action est définitive. Vos réservations seront également
        supprimées.
      </p>
      <form
        action={action}
        className="form"
        onSubmit={(e) => {
          if (!confirm("Supprimer définitivement votre compte ?"))
            e.preventDefault();
        }}
      >
        <ErrorMessage state={state} />
        <label>
          Confirmez votre mot de passe
          <input
            type="password"
            name="motdepasse"
            required
            maxLength={128}
            autoComplete="current-password"
          />
        </label>
        <Submit>Supprimer définitivement</Submit>
      </form>
    </details>
  );
}
export function ConfirmForm({
  action,
  id,
  message,
  children,
}: {
  action: (data: FormData) => Promise<void>;
  id: number;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-button">{children}</button>
    </form>
  );
}
export function ActivityForm({
  activity,
  types,
}: {
  activity?: Activity;
  types: { id: number; nom: string }[];
}) {
  const [state, action] = useActionState(saveActivity, {});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <form
      className="form"
      action={(data) => {
        if (file) data.set("photo", file);
        const raw = String(data.get("datetime_debut"));
        if (raw) data.set("datetime_debut", new Date(raw).toISOString());
        action(data);
      }}
    >
      <ErrorMessage state={state} />
      <input type="hidden" name="id" value={activity?.id || ""} />
      <label>
        Nom
        <input
          name="nom"
          required
          minLength={3}
          maxLength={100}
          defaultValue={activity?.nom}
        />
      </label>
      <div className="form-row">
        <label>
          Catégorie
          <select name="type_id" defaultValue={activity?.type_id}>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom}
              </option>
            ))}
          </select>
        </label>
        <label>
          Niveau
          <select name="niveau" defaultValue={activity?.niveau}>
            {["Débutant", "Tous niveaux", "Intermédiaire", "Confirmé"].map(
              (n) => (
                <option key={n}>{n}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={4000}
          rows={5}
          defaultValue={activity?.description}
        />
      </label>
      <div className="form-row">
        <label>
          Date et heure (heure de votre appareil)
          <input
            name="datetime_debut"
            type="datetime-local"
            required
            defaultValue={activity ? localDate(activity.datetime_debut) : ""}
          />
        </label>
        <label>
          Durée en minutes
          <input
            name="duree"
            type="number"
            min={15}
            max={1440}
            required
            defaultValue={activity?.duree || 60}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Capacité totale
          <input
            name="places_disponibles"
            type="number"
            min={1}
            max={500}
            required
            defaultValue={activity?.places_disponibles || 10}
          />
        </label>
        <label>
          Prix en euros
          <input
            name="prix"
            type="number"
            min={0}
            max={1000}
            required
            defaultValue={activity?.prix || 0}
          />
        </label>
      </div>
      <label>
        Photo de l’activité
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="photo-help"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (
              selected &&
              (selected.size > 5 * 1024 * 1024 ||
                !["image/jpeg", "image/png", "image/webp"].includes(
                  selected.type,
                ))
            ) {
              setPhotoError(
                "Choisissez une photo JPEG, PNG ou WebP de 5 Mo maximum.",
              );
              event.target.value = "";
              setFile(null);
              return;
            }
            setPhotoError("");
            setFile(selected || null);
          }}
        />
        <small id="photo-help">
          JPEG, PNG ou WebP · 5 Mo maximum.{" "}
          {activity
            ? "Sans nouvelle photo, la photo actuelle est conservée."
            : "Sans photo, une image de nature sera utilisée."}
        </small>
      </label>
      {photoError && (
        <p className="notice error" role="alert">
          {photoError}
        </p>
      )}
      <img
        src={
          preview ||
          photo(activity?.image || "photo-1441974231531-c6227db76b6e")
        }
        alt="Aperçu de la photo de l’activité"
        style={{
          width: "100%",
          maxHeight: 260,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
      <Submit>Enregistrer l’activité</Submit>
    </form>
  );
}
function localDate(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
