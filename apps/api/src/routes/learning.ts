import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { localeSchema } from "@elektro/shared";
import { parseBody } from "../lib/http-error.js";
import { activeSessionOf, availableTopics, historyOf, unfinishedLesson } from "../lib/learning.js";
import { listProgress } from "../lib/progress.js";

const querySchema = z.object({ locale: localeSchema.default("hu") });

/**
 * The signed-in user's own learning data: the dashboard (plan §3.4 J2) and
 * the history feed (J6). The privacy notice on the history page tells the
 * user that teachers can see the same data.
 */
export const learningRoutes: FastifyPluginAsync = async (app) => {
  app.get("/history", async (request, reply) => {
    const user = app.requireUser(request);
    const { locale } = parseBody(querySchema, request.query);
    reply.header("cache-control", "no-store");
    return { entries: await historyOf(user.id, locale) };
  });

  app.get("/dashboard", async (request, reply) => {
    const user = app.requireUser(request);
    const { locale } = parseBody(querySchema, request.query);
    reply.header("cache-control", "no-store");

    const [activeSession, lesson, topics, available, history] = await Promise.all([
      activeSessionOf(user.id),
      unfinishedLesson(user.id, locale),
      listProgress(user.id),
      availableTopics(),
      historyOf(user.id, locale, 3),
    ]);
    return { activeSession, unfinishedLesson: lesson, topics, availableTopics: available, recent: history };
  });
};
