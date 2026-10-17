import type { FastifyPluginAsync } from "fastify";
import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { aggregateInsights, isStrugglingRate, localeSchema, type TopicId } from "@elektro/shared";
import { db } from "../db/index.js";
import { practiceAttempts, topicProgress } from "../db/schema/app.js";
import { user as users } from "../db/schema/auth.js";
import { historyOf } from "../lib/learning.js";
import { notFound, parseBody } from "../lib/http-error.js";
import { listProgress } from "../lib/progress.js";

const userParams = z.object({ userId: z.string().min(1) });
const localeQuery = z.object({ locale: localeSchema.default("hu") });

/**
 * Teacher monitoring (plan §3.4 J7): every student's progress and history,
 * and aggregate insights. Teachers and admins only; students never see each
 * other. The register's privacy notice tells students about this.
 */
export const monitoringRoutes: FastifyPluginAsync = async (app) => {
  app.get("/teacher/students", async (request, reply) => {
    app.requireRole(request, "teacher");
    reply.header("cache-control", "no-store");

    const students = await db()
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.role, "student"));
    const rows = await db()
      .select({
        userId: topicProgress.userId,
        masteryLevel: topicProgress.masteryLevel,
        tasksCompleted: topicProgress.tasksCompleted,
        unaidedRate: topicProgress.unaidedRateLast10,
        lastActivityAt: topicProgress.lastActivityAt,
      })
      .from(topicProgress);

    return {
      students: students.map((student) => {
        const own = rows.filter((row) => row.userId === student.id);
        const lastActivityAt = own.reduce<Date | null>(
          (latest, row) =>
            row.lastActivityAt && (!latest || row.lastActivityAt > latest) ? row.lastActivityAt : latest,
          null,
        );
        return {
          ...student,
          lastActivityAt,
          topicsMastered: own.filter((row) => row.masteryLevel === "mastered").length,
          topicsPractising: own.filter((row) => row.masteryLevel === "practising").length,
          struggling: own.filter((row) => isStrugglingRate(row.unaidedRate, row.tasksCompleted)).length > 0,
        };
      }),
    };
  });

  app.get("/teacher/students/:userId", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { userId } = parseBody(userParams, request.params);
    reply.header("cache-control", "no-store");

    const [student] = await db()
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!student) {
      throw notFound();
    }

    const topics = await listProgress(userId);
    return {
      student,
      topics: topics.map((row) => ({
        ...row,
        struggling: isStrugglingRate(row.unaidedRate, row.tasksCompleted),
      })),
    };
  });

  app.get("/teacher/students/:userId/history", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { userId } = parseBody(userParams, request.params);
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");
    return { entries: await historyOf(userId, locale) };
  });

  /** Hardest steps and most common misconceptions per topic, over all students. */
  app.get("/teacher/insights", async (request, reply) => {
    app.requireRole(request, "teacher");
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        topicId: practiceAttempts.topicId,
        taskRef: practiceAttempts.taskRef,
        steps: practiceAttempts.payload,
      })
      .from(practiceAttempts)
      .where(and(isNotNull(practiceAttempts.payload), isNotNull(practiceAttempts.sessionId)));

    return {
      attempts: rows.length,
      topics: aggregateInsights(
        rows.map((row) => ({ topicId: row.topicId as TopicId, templateId: row.taskRef, steps: row.steps ?? [] })),
      ),
    };
  });
};
