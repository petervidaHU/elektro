import type { FastifyPluginAsync } from "fastify";
import { listProgress } from "../lib/progress.js";

/** The signed-in user's progress per topic (plan §3.3 `/progress`). */
export const progressRoutes: FastifyPluginAsync = async (app) => {
  app.get("/progress", async (request, reply) => {
    const user = app.requireUser(request);
    reply.header("cache-control", "no-store");
    return { topics: await listProgress(user.id) };
  });
};
