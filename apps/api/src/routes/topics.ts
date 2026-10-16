import type { FastifyPluginAsync } from "fastify";
import { TOPIC_GROUPS, TOPICS } from "@elektro/shared";

/**
 * The shared topic map. Only IDs and groups are returned - display names are
 * i18next keys (`topic.<id>`) resolved by the frontend.
 */
export const topicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/topics", async () => ({
    groups: TOPIC_GROUPS,
    topics: TOPICS,
  }));
};
