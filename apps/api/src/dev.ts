import { buildApp } from "./app.js";
import { env } from "./env.js";

/**
 * Development entry point: the API only.
 *
 * In development the React Router dev server (`apps/web`) serves the frontend
 * and proxies `/api` here, so HMR works. Production uses `main.ts`, where one
 * process serves both.
 */
async function main(): Promise<void> {
  const config = env();
  const app = await buildApp();

  await app.listen({ port: config.PORT, host: config.HOST });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
