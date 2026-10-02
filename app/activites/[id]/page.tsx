import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock3,
  Users,
  ShieldCheck,
  ArrowLeft,
  CalendarDays,
  Mountain,
} from "lucide-react";
import { activity, db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { dateLabel, duration, photo } from "@/lib/format";
import { reserve } from "@/app/actions";
import { Submit } from "@/components/forms";
import { Notice } from "@/components/notice";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = activity(Number((await params).id));
  return {
    title: a?.nom || "Activité introuvable",
    description: a?.description,
  };
}
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  const a = activity(Number((await params).id));
  if (!a) notFound();
  const user = await currentUser();
  const booked =
    user &&
    db
      .prepare(
        "SELECT id FROM reservations WHERE user_id=? AND activite_id=? AND etat=1",
      )
      .get(user.id, a.id);
  const past = new Date(a.datetime_debut) <= new Date();
  return (
    <div className="section detail-page">
      <Link className="back" href="/#activites">
        <ArrowLeft size={16} /> Toutes les activités
      </Link>
      <Notice params={await searchParams} />
      <div
        className="detail-cover"
        style={{ backgroundImage: `url(${photo(a.image)})` }}
      >
        <span className="category-badge">{a.type}</span>
      </div>
      <div className="detail-grid">
        <div>
          <p className="eyebrow">VOTRE PROCHAINE ÉCHAPPÉE</p>
          <h1>{a.nom}</h1>
          <div className="detail-features">
            <span>
              <Clock3 />
              {duration(a.duree)}
            </span>
            <span>
              <Mountain />
              {a.niveau}
            </span>
            <span>
              <Users />
              {a.places_disponibles} personnes maximum
            </span>
          </div>
          <h2>L’aventure en quelques mots</h2>
          <p className="description">{a.description}</p>
          <div className="tip">
            <ShieldCheck />
            <div>
              <strong>Venez l’esprit léger</strong>
              <p>
                Prévoyez une tenue adaptée, une gourde et arrivez 15 minutes
                avant le départ. Le matériel de sécurité est fourni.
              </p>
            </div>
          </div>
        </div>
        <aside className="booking-box">
          <span className="price">
            {a.prix} € <small>/ personne</small>
          </span>
          <hr />
          <p>
            <CalendarDays size={18} />
            {dateLabel(a.datetime_debut)}
          </p>
          <p>
            <Clock3 size={18} />
            {duration(a.duree)} d’évasion
          </p>
          <p>
            <Users size={18} />
            {a.restantes} place{a.restantes !== 1 ? "s" : ""} disponible
            {a.restantes !== 1 ? "s" : ""}
          </p>
          {booked ? (
            <Link href="/reservations" className="button">
              Voir ma réservation
            </Link>
          ) : past ? (
            <p className="notice">Cette activité est terminée.</p>
          ) : a.restantes <= 0 ? (
            <button className="button" disabled>
              Activité complète
            </button>
          ) : user ? (
            <form action={reserve}>
              <input type="hidden" name="id" value={a.id} />
              <Submit>Réserver mon aventure</Submit>
            </form>
          ) : (
            <Link href="/connexion" className="button">
              Se connecter pour réserver
            </Link>
          )}
          <small>
            Réservation immédiate · Paiement sur place
            <br />
            Annulation depuis votre espace personnel
          </small>
        </aside>
      </div>
    </div>
  );
}
