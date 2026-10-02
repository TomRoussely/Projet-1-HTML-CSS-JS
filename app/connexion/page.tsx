import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AccountForm } from "@/components/forms";
export const metadata = { title: "Connexion" };
export default async function Page() {
  if (await currentUser()) redirect("/reservations");
  return (
    <div className="auth-shell">
      <div className="auth-image">
        <span>
          Ça fait du bien
          <br />
          de se <em>retrouver.</em>
        </span>
      </div>
      <div className="auth-content">
        <p className="eyebrow">HEUREUX DE VOUS REVOIR</p>
        <h1>Le grand air vous attend.</h1>
        <p>Connectez-vous pour retrouver vos aventures.</p>
        <AccountForm mode="login" />
        <p className="auth-switch">
          Pas encore de compte ?{" "}
          <Link href="/inscription">Rejoignez l’aventure</Link>
        </p>
      </div>
    </div>
  );
}
