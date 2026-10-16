import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env.js";
import * as schema from "./schema/index.js";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(connectionString: string = env().DATABASE_URL) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

let cached: Database | undefined;

/** Process-wide pool. The database is a separate, already existing server. */
export function db(): Database {
  cached ??= createDatabase();
  return cached;
}

export { schema };
