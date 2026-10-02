import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { activity, types } from "@/lib/db";
import { ActivityForm } from "@/components/forms";
export const metadata = { title: "Éditer une activité" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const a = id === "nouveau" ? undefined : activity(Number(id));
  if (id !== "nouveau" && !a) notFound();
  return (
    <div className="section narrow">
      <Link className="back" href="/admin">
        ← Tableau de bord
      </Link>
      <p className="eyebrow">ADMINISTRATION</p>
      <h1>{a ? "Modifier l’activité" : "Une nouvelle aventure"}</h1>
      <div className="panel">
        <ActivityForm activity={a} types={types()} />
      </div>
    </div>
  );
}
