import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit is a dev-time tool; it reads the same DATABASE_URL.
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
