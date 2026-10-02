import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
test("parcours complet : catalogue, compte, réservation et administration", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const email = `test-${Date.now()}@example.test`;
  const password = "Test-aventure-2026";
  await page.goto("/");
  await expect(page.locator(".activity-card")).toHaveCount(6);
  await page
    .getByRole("textbox", { name: "Rechercher une activité" })
    .fill("sommet");
  await expect(page.locator(".activity-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Rechercher une activité" }).fill("");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin");
  await expect(page).toHaveURL(/connexion/);
  await page.goto("/inscription");
  await page.getByLabel("Prénom", { exact: true }).fill("Camille");
  await page.getByLabel("Nom", { exact: true }).fill("Martin");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/reservations/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/erreur=/);
  await expect(page.locator(".notice.error")).toContainText("administrateurs");
  await page.goto("/activites/1");
  await page.getByRole("button", { name: "Réserver mon aventure" }).click();
  await expect(page).toHaveURL(/reservations/);
  await expect(page.locator(".status")).toHaveText("Confirmée");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Annuler la réservation" }).click();
  await expect(page.locator(".status")).toHaveText("Annulée");
  await page.goto("/profil");
  await page.getByLabel("Prénom", { exact: true }).fill("Camille Test");
  await page
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(page.getByRole("status")).toContainText("mis à jour");
  const db = new Database(".e2e-data/echappee.sqlite");
  db.prepare("UPDATE users SET role='admin' WHERE email=?").run(email);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Créer une activité" }).click();
  await page.getByLabel("Nom", { exact: true }).fill("Aventure de test");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Une activité de test pour vérifier les opérations administrateur.");
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  await page.getByLabel("Date et heure", { exact: false }).fill(future);
  await page.getByRole("button", { name: "Enregistrer l’activité" }).click();
  await expect(page).toHaveURL(/admin\?succes/);
  let row = page.getByRole("row").filter({ hasText: "Aventure de test" });
  await row.getByRole("link", { name: "Modifier" }).click();
  await page.getByLabel("Nom", { exact: true }).fill("Aventure modifiée");
  await page.getByRole("button", { name: "Enregistrer l’activité" }).click();
  await expect(page).toHaveURL(/admin\?succes/);
  row = page.getByRole("row").filter({ hasText: "Aventure modifiée" });
  await row.getByRole("button", { name: "Supprimer" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Aventure modifiée" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/reservations/);
  await page.goto("/profil");
  await page.getByText("Supprimer mon compte", { exact: true }).click();
  await page.getByLabel("Confirmez votre mot de passe").fill(password);
  await page.getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(page).toHaveURL(/succes=/);
  expect(
    db.prepare("SELECT id FROM users WHERE email=?").get(email),
  ).toBeUndefined();
  db.close();
  await page.goto("/chemin-inconnu");
  await expect(
    page.getByRole("heading", { name: "On s’est un peu égarés." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
