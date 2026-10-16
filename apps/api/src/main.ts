import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { buildApp } from "./app.js";
import { env } from "./env.js";
import { registerWebHandler } from "./lib/react-router.js";

/**
 * Production entry point: one Node process that serves the API under `/api/*`,
 * the client build as static files, and the React Router SSR handler for every
 * other route.
 */
async function main(): Promise<void> {
  const config = env();
  const app = await buildApp();

  const clientBuild = fileURLToPath(new URL("../../web/build/client", import.meta.url));

  await app.register(fastifyStatic, {
    root: clientBuild,
    // Register a route per built file so unknown paths fall through to the
    // SSR handler instead of being swallowed by a wildcard.
    wildcard: false,
    setHeaders(reply, path) {
      // Everything under /assets carries a content hash in its name.
      if (path.includes("/assets/")) {
        reply.header("cache-control", "public, max-age=31536000, immutable");
      }
    },
  });

  await registerWebHandler(app);

  await app.listen({ port: config.PORT, host: config.HOST });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
