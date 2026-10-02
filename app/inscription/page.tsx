import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AccountForm } from "@/components/forms";
export const metadata = { title: "Créer un compte" };
export default async function Page() {
  if (await currentUser()) redirect("/reservations");
  return (
    <div className="auth-shell">
      <div className="auth-image">
        <span>
          Le premier pas
          <br />
          vers le <em>dehors.</em>
        </span>
      </div>
      <div className="auth-content">
        <p className="eyebrow">BIENVENUE CHEZ ÉCHAPPÉE</p>
        <h1>On prend l’air ensemble ?</h1>
        <p>Créez votre compte et réservez votre prochaine aventure.</p>
        <AccountForm mode="register" />
        <p className="auth-switch">
          Déjà inscrit ? <Link href="/connexion">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}
