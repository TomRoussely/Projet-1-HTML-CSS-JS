import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  Leaf,
  ShieldCheck,
  Smile,
  MoveUpRight,
} from "lucide-react";
import { Catalog } from "@/components/catalog";
import { Notice } from "@/components/notice";
import { activities } from "@/lib/db";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ succes?: string; erreur?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <div className="home-notice">
        <Notice params={params} />
      </div>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span /> LE GRAND AIR, LES GRANDS SOUVENIRS
          </p>
          <h1>
            Moins d’écrans.
            <br />
            Plus de <em>vivant.</em>
          </h1>
          <p>
            Une parenthèse au vert, des aventures à partager.
            <br />
            Trouvez votre prochaine échappée, tout simplement.
          </p>
          <Link href="#activites" className="button lime">
            Explorer les activités <ArrowUpRight size={20} />
          </Link>
          <div className="hero-social">
            <div className="avatars">
              <span>ML</span>
              <span>JD</span>
              <span>AC</span>
            </div>
            <div>
              <span className="stars">★★★★★</span>
              <small>Des aventures qui nous rapprochent</small>
            </div>
          </div>
        </div>
        <div className="hero-side">DÉCONNECTER. RESPIRER. PROFITER.</div>
        <div className="hero-caption">
          <span>
            <i /> AU CŒUR DE LA NATURE
          </span>
          <a href="#activites" aria-label="Découvrir les activités">
            <ArrowDown size={22} />
          </a>
        </div>
        <div className="hero-stamp">
          <Leaf size={25} />
          <span>
            100 %<br />
            <small>grand air</small>
          </span>
        </div>
      </section>
      <section className="benefits" aria-label="Nos engagements">
        <div>
          <Leaf />
          <span>La nature comme terrain de jeu</span>
        </div>
        <div>
          <ShieldCheck />
          <span>Des aventures bien encadrées</span>
        </div>
        <div>
          <Smile />
          <span>Des moments pour tout le monde</span>
        </div>
      </section>
      <Catalog
        activities={activities().filter(
          (a) => new Date(a.datetime_debut) > new Date(),
        )}
      />
      <section className="spirit section" id="esprit">
        <div>
          <p className="eyebrow">L’ESPRIT ÉCHAPPÉE</p>
          <h2>
            Les meilleurs souvenirs
            <br />
            n’ont pas de Wi-Fi.
          </h2>
          <p>
            Un sentier, un éclat de rire, un premier saut dans le vide. On croit
            aux choses simples, à celles qui font du bien. Ici, chacun trouve sa
            façon de profiter du dehors.
          </p>
          <Link href="/inscription" className="button">
            Rejoindre l’aventure <MoveUpRight size={18} />
          </Link>
        </div>
        <div className="spirit-image">
          <span>
            Le bonheur est
            <br />
            <em>juste dehors.</em>
          </span>
        </div>
      </section>
      <section className="cta section">
        <div>
          <p className="eyebrow">ON Y VA ?</p>
          <h2>Votre prochaine bouffée d’air frais.</h2>
          <p>Choisissez une activité. On s’occupe du reste.</p>
        </div>
        <Link href="#activites" className="button lime">
          Trouver mon aventure <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
