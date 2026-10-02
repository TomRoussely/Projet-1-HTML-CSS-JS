import Link from "next/link";
import { Trees, ArrowUpRight } from "lucide-react";
export const metadata = { title: "Page introuvable" };
export default function NotFound() {
  return (
    <div className="empty not-found">
      <Trees size={65} />
      <p className="eyebrow">ERREUR 404 · HORS DES SENTIERS</p>
      <h1>On s’est un peu égarés.</h1>
      <p>
        Ce chemin ne mène nulle part. Retrouvons ensemble la prochaine aventure.
      </p>
      <Link href="/" className="button">
        Retour au grand air <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
