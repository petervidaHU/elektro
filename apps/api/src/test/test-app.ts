import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { isRole } from "@elektro/shared";
import { installErrorHandler } from "../lib/error-handler.js";
import { registerGuards } from "../plugins/auth.js";

/**
 * A bare instance with the real guards and error handler, for route tests
 * without a database or better-auth. The signed-in user comes from the
 * `x-test-user` header as "id:role" (no header = guest).
 */
export async function buildTestApp<Options extends Record<string, unknown>>(
  routes: FastifyPluginAsync<Options>,
  options: Options,
): Promise<FastifyInstance> {
  const app = fastify({ logger: false });
  app.decorateRequest("currentUser", null);
  app.addHook("onRequest", async (request) => {
    const header = request.headers["x-test-user"];
    const [id, role] = typeof header === "string" ? header.split(":") : [];
    request.currentUser =
      id && isRole(role) ? { id, role, name: id, email: `${id}@example.com` } : null;
  });
  registerGuards(app);
  installErrorHandler(app);
  await app.register(routes, options);
  return app;
}

export const as = (id: string, role: "student" | "teacher" | "admin") => ({
  "x-test-user": `${id}:${role}`,
});
