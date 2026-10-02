import { requireUser } from "@/lib/auth";
import { AccountForm, DeleteProfile } from "@/components/forms";
import { Notice } from "@/components/notice";
export const metadata = { title: "Mon profil" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ succes?: string }>;
}) {
  const user = await requireUser();
  return (
    <div className="section narrow">
      <p className="eyebrow">MON ESPACE</p>
      <h1>Mon profil</h1>
      <p>Les présentations, c’est par ici.</p>
      <Notice params={await searchParams} />
      <div className="panel">
        <AccountForm mode="profile" user={user} />
      </div>
      <DeleteProfile />
    </div>
  );
}
