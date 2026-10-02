import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword, verifyPassword } from "../lib/password";
const directory = mkdtempSync(join(tmpdir(), "echappee-test-"));
process.env.DATA_DIR = directory;
const database = import("../lib/db");
after(async () => {
  (await database).db.close();
  rmSync(directory, { recursive: true, force: true });
});
test("passwords use salted hashes and reject invalid passwords", () => {
  const a = hashPassword("a-secure-password");
  assert.notEqual(a, hashPassword("a-secure-password"));
  assert.ok(verifyPassword("a-secure-password", a));
  assert.ok(!verifyPassword("incorrect", a));
});
test("booking capacity, ownership, duplicate prevention and cancellation", async () => {
  const { db, book, cancel, activity } = await database;
  const insert = db.prepare(
    "INSERT INTO users(prenom,nom,email,motdepasse) VALUES(?,?,?,?)",
  );
  const u1 = Number(
    insert.run("Alice", "Test", "alice@example.test", "unused").lastInsertRowid,
  );
  const u2 = Number(
    insert.run("Bob", "Test", "bob@example.test", "unused").lastInsertRowid,
  );
  const id = 1;
  db.prepare("UPDATE activites SET places_disponibles=1 WHERE id=?").run(id);
  book(u1, id);
  assert.equal(activity(id)?.restantes, 0);
  assert.throws(() => book(u1, id), /déjà/);
  assert.throws(() => book(u2, id), /complète/);
  const r = db
    .prepare("SELECT id FROM reservations WHERE user_id=?")
    .get(u1) as { id: number };
  assert.throws(() => cancel(u2, r.id), /introuvable/);
  assert.equal(activity(id)?.restantes, 0);
  cancel(u1, r.id);
  assert.equal(activity(id)?.restantes, 1);
  book(u2, id);
  assert.equal(activity(id)?.restantes, 0);
  db.prepare("DELETE FROM users WHERE id=?").run(u2);
  assert.equal(activity(id)?.restantes, 1);
  db.prepare("UPDATE activites SET datetime_debut=? WHERE id=?").run(
    "2020-01-01T10:00:00.000Z",
    id,
  );
  assert.throws(() => book(u1, id), /plus disponible/);
});
