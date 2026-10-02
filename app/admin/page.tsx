import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { activities, db } from "@/lib/db";
import { dateLabel } from "@/lib/format";
import { deleteActivity } from "@/app/actions";
import { ConfirmForm } from "@/components/forms";
import { Notice } from "@/components/notice";
export const metadata = { title: "Administration" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ succes?: string }>;
}) {
  await requireAdmin();
  const rows = activities();
  const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return (
    <div className="section page-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LE PARC EN UN COUP D’ŒIL</p>
          <h1>Tableau de bord</h1>
        </div>
        <Link href="/admin/nouveau" className="button">
          <Plus size={18} />
          Créer une activité
        </Link>
      </div>
      <Notice params={await searchParams} />
      <div className="stats">
        <div>
          <span>Activités</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Utilisateurs inscrits</span>
          <strong>{count("SELECT COUNT(*) AS n FROM users")}</strong>
        </div>
        <div>
          <span>Réservations actives</span>
          <strong>
            {count("SELECT COUNT(*) AS n FROM reservations WHERE etat=1")}
          </strong>
        </div>
        <div>
          <span>Réservations annulées</span>
          <strong>
            {count("SELECT COUNT(*) AS n FROM reservations WHERE etat=0")}
          </strong>
        </div>
      </div>
      <h2>Gérer les activités</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Activité</th>
              <th>Prochain départ</th>
              <th>Réservées / capacité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/activites/${a.id}`}>
                    {a.nom} <ArrowUpRight size={13} />
                  </Link>
                  <small>{a.type}</small>
                </td>
                <td>{dateLabel(a.datetime_debut)}</td>
                <td>
                  {a.places_disponibles - a.restantes} / {a.places_disponibles}
                </td>
                <td>
                  <div className="table-actions">
                    <Link href={`/admin/${a.id}`}>Modifier</Link>
                    <ConfirmForm
                      action={deleteActivity}
                      id={a.id}
                      message="Supprimer cette activité et toutes ses réservations ? Cette action est définitive."
                    >
                      Supprimer
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
