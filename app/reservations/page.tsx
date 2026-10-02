import Link from "next/link";
import { Compass, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { reservations } from "@/lib/db";
import { dateLabel, photo } from "@/lib/format";
import { cancelBooking } from "@/app/actions";
import { ConfirmForm } from "@/components/forms";
import { Notice } from "@/components/notice";
export const metadata = { title: "Mes réservations" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ succes?: string; erreur?: string }>;
}) {
  const user = await requireUser();
  const rows = reservations(user.id);
  return (
    <div className="section page-space">
      <p className="eyebrow">MON CARNET D’AVENTURES</p>
      <h1>Vos prochaines échappées, {user.prenom}.</h1>
      <p>Tout ce qu’il faut pour préparer vos bons moments.</p>
      <Notice params={await searchParams} />
      {rows.length ? (
        <div className="reservation-list">
          {rows.map((r) => (
            <article key={r.reservation_id} className="reservation">
              <div
                className="reservation-image"
                style={{ backgroundImage: `url(${photo(r.image)})` }}
              />
              <div>
                <span className={`status ${r.etat ? "" : "cancelled"}`}>
                  {!r.etat
                    ? "Annulée"
                    : new Date(r.datetime_debut) < new Date()
                      ? "Terminée"
                      : "Confirmée"}
                </span>
                <h2>
                  <Link href={`/activites/${r.id}`}>{r.nom}</Link>
                </h2>
                <p>
                  {dateLabel(r.datetime_debut)} · {r.prix} € / personne
                </p>
                <small>
                  Réservation n° {r.reservation_id} · Paiement sur place
                </small>
              </div>
              {!!r.etat && (
                <ConfirmForm
                  action={cancelBooking}
                  id={r.reservation_id}
                  message="Annuler cette réservation et libérer votre place ?"
                >
                  Annuler la réservation
                </ConfirmForm>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Compass size={44} />
          <h2>Tout commence par une envie de sortir.</h2>
          <p>
            Vous n’avez pas encore de réservation. Votre prochaine aventure vous
            attend.
          </p>
          <Link href="/#activites" className="button">
            Explorer les activités <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
    </div>
  );
}
