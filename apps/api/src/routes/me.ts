import type { FastifyPluginAsync } from "fastify";

/**
 * The signed-in user, or `null` for guests. Guests may browse approved
 * lessons and calculators, so this is not a 401: the frontend uses it to pick
 * the navigation and to send guests to the login page from practice-only
 * areas. It grants nothing - every other route still checks the role itself.
 */
export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (request, reply) => {
    reply.header("cache-control", "no-store");
    return { user: request.currentUser };
  });
};
