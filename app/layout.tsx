import type { Metadata } from "next";
import Link from "next/link";
import { Trees, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/header";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Échappée — L’aventure commence dehors",
    template: "%s | Échappée",
  },
  description:
    "Prenez l’air, vivez l’aventure. Découvrez et réservez les activités nature du parc Échappée.",
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer>
          <div>
            <Link href="/" className="brand">
              <Trees size={27} />
              <span>échappée.</span>
            </Link>
            <p>Dehors, on se retrouve.</p>
          </div>
          <span>Un peu de nature. Beaucoup de souvenirs.</span>
          <Link href="/#activites">
            Prêt à prendre l’air ? <ArrowUpRight size={17} />
          </Link>
          <div className="footer-bottom">
            © {new Date().getFullYear()} Échappée · Projet pédagogique
            <span>Fait pour les esprits libres.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
