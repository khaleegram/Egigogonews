import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Prefer node-postgres for Neon pooler + local Postgres.
  // Neon HTTP (`neon-http`) was flaky here (fetch failed / cold starts).
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });

  return drizzlePg(pool, { schema });
}

export type Db = ReturnType<typeof createDb>;

let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) _db = createDb();
  return _db;
}

/** Neon free compute goes idle; first queries often fail until it wakes. */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        /fetch failed|ETIMEDOUT|ENETUNREACH|ECONNRESET|connecting to database|Failed query|timeout|Connection terminated/i.test(
          msg,
        );
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
    }
  }
  throw last;
}
