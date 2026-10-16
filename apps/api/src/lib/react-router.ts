import { createRequestListener } from "@mjackson/node-fetch-server";
import type { FastifyInstance } from "fastify";
import { createRequestHandler, type ServerBuild } from "react-router";
import { env } from "../env.js";

/**
 * Mounts the React Router SSR request handler on the Fastify instance, so a
 * single Node process serves both `/api/*` and the app itself.
 *
 * The server build is produced by `apps/web` (`npm run build -w @elektro/web`)
 * and loaded at runtime: the path is resolved, not statically
 * imported, because the build artifact does not exist at typecheck time.
 */
async function loadServerBuild(): Promise<ServerBuild> {
  const specifier =
    process.env.WEB_SERVER_BUILD ??
    new URL("../../../web/build/server/index.js", import.meta.url).href;

  const build = (await import(specifier)) as { default?: ServerBuild } & ServerBuild;

  return build.default ?? build;
}

export async function registerWebHandler(app: FastifyInstance): Promise<void> {
  const build = await loadServerBuild();
  const handler = createRequestHandler(build, env().NODE_ENV);
  // The second argument node-fetch-server passes is the client address, not
  // a React Router load context, so it is dropped here.
  const listener = createRequestListener((request: Request) => handler(request));

  // Anything that is not an API route and not a static asset is an app route.
  app.setNotFoundHandler((request, reply) => {
    reply.hijack();
    listener(request.raw, reply.raw);
  });
}
