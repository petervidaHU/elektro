import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { loadEnv } from "../env.js";

/**
 * Applies pending migrations. Runs on container start, before the server, and
 * from `npm run db:migrate` locally.
 */
async function main(): Promise<void> {
  const config = loadEnv();
  const pool = new Pool({ connectionString: config.DATABASE_URL });

  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
    });
    console.log("migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
