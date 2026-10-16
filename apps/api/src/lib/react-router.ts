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

/**
 * The origin the browser sees. Behind the TLS-terminating reverse proxy the
 * socket is plain HTTP, so without this `request.url` would be `http://...`
 * while the browser sends `Origin: https://...` - and React Router rejects
 * every form action whose origin does not match `request.url` (CSRF check).
 */
export function publicRequestOrigin(publicBaseUrl: string): { protocol: string; host: string } {
  const url = new URL(publicBaseUrl);
  return { protocol: url.protocol, host: url.host };
}

export async function registerWebHandler(app: FastifyInstance): Promise<void> {
  const config = env();
  const build = await loadServerBuild();
  const handler = createRequestHandler(build, config.NODE_ENV);
  // The second argument node-fetch-server passes is the client address, not
  // a React Router load context, so it is dropped here.
  const listener = createRequestListener(
    (request: Request) => handler(request),
    publicRequestOrigin(config.BETTER_AUTH_URL),
  );

  // Anything that is not an API route and not a static asset is an app route.
  app.setNotFoundHandler((request, reply) => {
    reply.hijack();
    listener(request.raw, reply.raw);
  });
}
