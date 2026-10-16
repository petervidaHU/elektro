import type { FastifyPluginAsync } from "fastify";
import { MODULES, TOPICS } from "@elektro/shared";

/**
 * The shared syllabus (docs/DEVELOPMENT_PLAN.md §1.2). Only IDs and metadata
 * are returned - display names are i18next keys (`module.<id>`, `topic.<id>`)
 * resolved by the frontend.
 */
export const topicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/topics", async () => ({
    modules: MODULES,
    topics: TOPICS,
  }));
};
