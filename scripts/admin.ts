import { db } from "../lib/db";
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error(
    "Usage : npm run admin -- votre@email.fr (créez d’abord ce compte via l’application)",
  );
  process.exit(1);
}
const result = db
  .prepare("UPDATE users SET role='admin' WHERE email=?")
  .run(email);
if (!result.changes) {
  console.error("Compte introuvable. Inscrivez-vous d’abord.");
  process.exit(1);
}
console.log("Le compte dispose désormais du rôle administrateur.");
db.close();
