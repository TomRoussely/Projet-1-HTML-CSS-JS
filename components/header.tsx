import Link from "next/link";
import { Trees, ArrowUpRight, UserRound } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
export async function Header() {
  const user = await currentUser();
  return (
    <header className="header">
      <Link href="/" className="brand">
        <Trees size={31} strokeWidth={1.7} />
        <span>
          échappée<span className="brand-dot">.</span>
        </span>
      </Link>
      <nav aria-label="Navigation principale">
        <Link href="/#activites">Les activités</Link>
        <Link href="/#esprit">L’esprit du parc</Link>
        <Link href="/reservations">Mes réservations</Link>
        {user?.role === "admin" && <Link href="/admin">Administration</Link>}
      </nav>
      <div className="account">
        {user ? (
          <>
            <Link href="/profil" className="profile-link">
              <UserRound size={17} />
              {user.prenom}
            </Link>
            <form action={logout}>
              <button className="text-button">Déconnexion</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/connexion" className="login-link">
              Connexion
            </Link>
            <Link className="button small" href="/inscription">
              Créer un compte <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
