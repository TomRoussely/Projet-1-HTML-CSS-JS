"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  Clock3,
  SlidersHorizontal,
  Trees,
  Waves,
  Mountain,
  Flower2,
  LayoutGrid,
  Users,
} from "lucide-react";
import type { Activity } from "@/lib/db";
import { dateLabel, duration, photo } from "@/lib/format";
const categories = [
  { label: "Tout explorer", icon: LayoutGrid },
  { label: "Accrobranche", icon: Trees },
  { label: "Sports nautiques", icon: Waves },
  { label: "Aventure", icon: Mountain },
  { label: "Détente", icon: Flower2 },
];
export function Catalog({ activities }: { activities: Activity[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout explorer");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("date");
  const filtered = activities
    .filter(
      (a) =>
        a.nom
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(
            query
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase(),
          ) &&
        (category === "Tout explorer" || a.type === category) &&
        (!available || a.restantes > 0),
    )
    .sort((a, b) =>
      sort === "prix"
        ? a.prix - b.prix
        : a.datetime_debut.localeCompare(b.datetime_debut),
    );
  return (
    <section className="catalog section" id="activites">
      <div className="section-heading">
        <div>
          <p className="eyebrow">À CHACUN SON AVENTURE</p>
          <h2>Et si on sortait un peu ?</h2>
          <p>Pour se dépasser, se détendre ou simplement se retrouver.</p>
        </div>
        <div className="season">
          <span /> La nature vous attend
        </div>
      </div>
      <div className="catalog-tools">
        <div className="category-tabs" aria-label="Catégories">
          {categories.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={category === label ? "selected" : ""}
              onClick={() => setCategory(label)}
              aria-pressed={category === label}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Rechercher une activité"
            placeholder="Rechercher une activité…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="results-line">
        <span aria-live="polite">
          <strong>{filtered.length}</strong> activité
          {filtered.length !== 1 ? "s" : ""} à découvrir
        </span>
        <div>
          <label className="available">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />{" "}
            Places disponibles
          </label>
          <label className="sort">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Trier les activités"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date">Les prochaines dates</option>
              <option value="prix">Prix croissant</option>
            </select>
          </label>
        </div>
      </div>
      <div className="activity-grid">
        {filtered.map((a, i) => (
          <Link
            href={`/activites/${a.id}`}
            className="activity-card"
            key={a.id}
          >
            <div
              className="card-image"
              style={{ backgroundImage: `url(${photo(a.image)})` }}
            >
              <span className="category-badge">{a.type}</span>
              {a.restantes <= 6 && (
                <span className="scarcity">
                  {a.restantes > 0
                    ? `Plus que ${a.restantes} places`
                    : "Complet"}
                </span>
              )}
              <span className="image-number">0{i + 1}</span>
            </div>
            <div className="card-body">
              <div className="card-meta">
                <span>
                  <Clock3 size={14} />
                  {duration(a.duree)}
                </span>
                <span>·</span>
                <span>{a.niveau}</span>
              </div>
              <h3>{a.nom}</h3>
              <p className="card-description">{a.description.split(".")[0]}.</p>
              <div className="card-date">
                <Users size={14} />
                {dateLabel(a.datetime_debut)}
              </div>
              <div className="card-bottom">
                <span>
                  <strong>{a.prix} €</strong> <small>/ personne</small>
                </span>
                <span className="circle-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search size={30} />
          <h3>Aucune aventure trouvée</h3>
          <p>Essayez un autre nom ou une autre catégorie.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("Tout explorer");
              setAvailable(false);
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </section>
  );
}
