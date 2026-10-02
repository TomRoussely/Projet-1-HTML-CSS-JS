import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: "user" | "admin";
}
export interface Activity {
  id: number;
  nom: string;
  type_id: number;
  type: string;
  places_disponibles: number;
  description: string;
  datetime_debut: string;
  duree: number;
  prix: number;
  image: string;
  niveau: string;
  restantes: number;
}
export interface Reservation extends Activity {
  reservation_id: number;
  date_reservation: string;
  etat: number;
}
const folder = process.env.DATA_DIR || path.join(process.cwd(), "data");
mkdirSync(folder, { recursive: true });
export const db = new Database(path.join(folder, "echappee.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, contenu BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, prenom TEXT NOT NULL, nom TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, motdepasse TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS type_activite (id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS activites (id INTEGER PRIMARY KEY, nom TEXT NOT NULL, type_id INTEGER NOT NULL REFERENCES type_activite(id), places_disponibles INTEGER NOT NULL CHECK(places_disponibles > 0), description TEXT NOT NULL, datetime_debut TEXT NOT NULL, duree INTEGER NOT NULL CHECK(duree > 0), prix INTEGER NOT NULL DEFAULT 0 CHECK(prix >= 0), image TEXT NOT NULL, niveau TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reservations (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, activite_id INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE, date_reservation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, etat INTEGER NOT NULL DEFAULT 1 CHECK(etat IN (0,1)));
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking ON reservations(user_id, activite_id) WHERE etat = 1;
CREATE INDEX IF NOT EXISTS activity_bookings ON reservations(activite_id, etat);
CREATE TABLE IF NOT EXISTS login_attempts (email TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL);
`);
if (!db.prepare("SELECT id FROM type_activite LIMIT 1").get()) {
  db.transaction(() => {
    // Another build worker may have initialized the database while we waited.
    if (db.prepare("SELECT id FROM type_activite LIMIT 1").get()) return;
    ["Accrobranche", "Sports nautiques", "Aventure", "Détente"].forEach((n) =>
      db.prepare("INSERT INTO type_activite(nom) VALUES (?)").run(n),
    );
    const rows = [
      [
        "La forêt vue d’en haut",
        1,
        12,
        "Prenez de la hauteur et explorez nos parcours suspendus au cœur des chênes. Ponts de singe, passerelles et tyroliennes : une aventure accompagnée par nos moniteurs. Équipement et briefing de sécurité inclus.",
        120,
        28,
        "photo-1511497584788-876760111969",
        "Tous niveaux",
      ],
      [
        "Au fil de l’eau",
        2,
        8,
        "Pagayez en kayak sur une rivière paisible, entre falaises et forêt. Notre guide vous accompagne à la découverte de la faune locale. Gilet et matériel fournis ; savoir nager est indispensable.",
        90,
        24,
        "photo-1500534623283-312aade485b7",
        "Débutant",
      ],
      [
        "L’appel du sommet",
        3,
        6,
        "Initiez-vous à l’escalade sur notre site naturel avec un moniteur. Apprenez à assurer, trouvez vos prises et profitez de la vue. Casque, baudrier et chaussons inclus.",
        120,
        35,
        "photo-1522163182402-834f871fd851",
        "Intermédiaire",
      ],
      [
        "Une pause en pleine nature",
        4,
        16,
        "Retrouvez votre équilibre lors d’une séance de yoga en plein air, dans une clairière calme. Respiration, mobilité et relaxation : un moment pour vous. Tapis fournis.",
        60,
        18,
        "photo-1441974231531-c6227db76b6e",
        "Tous niveaux",
      ],
      [
        "L’aventure hors des sentiers",
        3,
        10,
        "Découvrez les chemins du parc à VTT avec un guide passionné. Un parcours varié entre sous-bois et points de vue, adapté au groupe. Vélo et casque inclus.",
        150,
        32,
        "photo-1472396961693-142e6e269027",
        "Intermédiaire",
      ],
      [
        "Cap sur la tranquillité",
        2,
        8,
        "Glissez sur le lac en paddle et découvrez ses rives préservées. Une initiation conviviale pour prendre confiance sur l’eau. Matériel et gilet inclus ; savoir nager est indispensable.",
        60,
        22,
        "photo-1473448912268-2022ce9509d8",
        "Débutant",
      ],
    ];
    const insert = db.prepare(
      "INSERT INTO activites(nom,type_id,places_disponibles,description,datetime_debut,duree,prix,image,niveau) VALUES(?,?,?,?,?,?,?,?,?)",
    );
    rows.forEach((r, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 2);
      date.setHours(10 + (i % 3), 0, 0, 0);
      insert.run(
        r[0],
        r[1],
        r[2],
        r[3],
        date.toISOString(),
        r[4],
        r[5],
        r[6],
        r[7],
      );
    });
  }).immediate();
}
const selection = `SELECT a.*, t.nom AS type, a.places_disponibles - (SELECT COUNT(*) FROM reservations r WHERE r.activite_id=a.id AND r.etat=1) AS restantes FROM activites a JOIN type_activite t ON a.type_id=t.id`;
export function activities() {
  return db
    .prepare(selection + " ORDER BY a.datetime_debut")
    .all() as Activity[];
}
export function activity(id: number) {
  return db.prepare(selection + " WHERE a.id=?").get(id) as
    Activity | undefined;
}
export function types() {
  return db.prepare("SELECT * FROM type_activite").all() as {
    id: number;
    nom: string;
  }[];
}
// BEGIN IMMEDIATE serializes capacity checks and inserts, preventing overbooking.
export function book(userId: number, activityId: number) {
  return db
    .transaction(() => {
      const a = activity(activityId);
      if (!a || new Date(a.datetime_debut) <= new Date())
        throw new Error("Cette activité n’est plus disponible.");
      if (
        db
          .prepare(
            "SELECT id FROM reservations WHERE user_id=? AND activite_id=? AND etat=1",
          )
          .get(userId, activityId)
      )
        throw new Error("Vous avez déjà réservé cette activité.");
      if (a.restantes <= 0) throw new Error("Cette activité est complète.");
      db.prepare(
        "INSERT INTO reservations(user_id,activite_id) VALUES (?,?)",
      ).run(userId, activityId);
    })
    .immediate();
}
export function cancel(userId: number, reservationId: number) {
  const result = db
    .prepare(
      "UPDATE reservations SET etat=0 WHERE id=? AND user_id=? AND etat=1",
    )
    .run(reservationId, userId);
  if (!result.changes)
    throw new Error("Réservation introuvable ou déjà annulée.");
}
export function reservations(userId: number) {
  return db
    .prepare(
      `SELECT a.*, t.nom AS type, r.id AS reservation_id, r.date_reservation, r.etat, 0 AS restantes FROM reservations r JOIN activites a ON a.id=r.activite_id JOIN type_activite t ON t.id=a.type_id WHERE r.user_id=? ORDER BY r.date_reservation DESC`,
    )
    .all(userId) as Reservation[];
}
