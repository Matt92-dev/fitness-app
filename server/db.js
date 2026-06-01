import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_DATABASE_PATH = resolve("data", "fitness.sqlite");
const DATABASE_PATH = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : DEFAULT_DATABASE_PATH;

mkdirSync(dirname(DATABASE_PATH), { recursive: true });

const database = new DatabaseSync(DATABASE_PATH);

database.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const getStateQuery = database.prepare("SELECT value FROM app_state WHERE key = ?");
const upsertStateQuery = database.prepare(`
  INSERT INTO app_state (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);

export function getState(key, fallbackValue = null) {
  const row = getStateQuery.get(key);

  if (!row) {
    return fallbackValue;
  }

  try {
    return JSON.parse(row.value);
  } catch {
    return fallbackValue;
  }
}

export function setState(key, value) {
  upsertStateQuery.run(key, JSON.stringify(value));
}
