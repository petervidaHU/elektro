import type { FastifyPluginAsync } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  /** Liveness: the process answers. */
  app.get("/health", async () => ({ status: "ok" }));

  /** Readiness: the separate database server is reachable. */
  app.get("/ready", async (_request, reply) => {
    try {
      await db().execute(sql`select 1`);
      return { status: "ok", database: "ok" };
    } catch (error) {
      app.log.error({ err: error }, "readiness check failed");
      return reply.code(503).send({ status: "unavailable", database: "unavailable" });
    }
  });
};
