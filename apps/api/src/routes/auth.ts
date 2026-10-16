import type { FastifyPluginAsync } from "fastify";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

/**
 * Mounts better-auth's own handler under `/api/auth/*`.
 *
 * Registered as an encapsulated plugin that strips Fastify's body parsers:
 * better-auth reads the raw request stream itself, so the body must not be
 * consumed beforehand.
 */
export const authRoutes: FastifyPluginAsync = async (app) => {
  app.removeAllContentTypeParsers();
  app.addContentTypeParser("*", (_request, _payload, done) => done(null, undefined));

  const handler = toNodeHandler(auth());

  app.all("/*", async (request, reply) => {
    reply.hijack();
    await handler(request.raw, reply.raw);
  });
};
