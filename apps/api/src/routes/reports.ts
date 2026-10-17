import type { FastifyPluginAsync } from "fastify";
import { desc, eq } from "drizzle-orm";
import { createReportSchema } from "@elektro/shared";
import { db } from "../db/index.js";
import { contentReports } from "../db/schema/app.js";
import { user as users } from "../db/schema/auth.js";
import { parseBody } from "../lib/http-error.js";

/**
 * "Hibát találtam" (plan §3.4 J9). Any signed-in user can report; teachers get
 * a read-only list. No workflow or notifications in v1.
 */
export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.post("/reports", async (request, reply) => {
    const reporter = app.requireUser(request);
    const input = parseBody(createReportSchema, request.body);

    const [report] = await db()
      .insert(contentReports)
      .values({
        reporterId: reporter.id,
        targetKind: input.targetKind,
        targetId: input.targetId,
        targetVersion: input.targetVersion ?? null,
        locale: input.locale,
        category: input.category,
        note: input.note || null,
      })
      .returning({ id: contentReports.id });

    return reply.code(201).send({ report });
  });

  app.get("/teacher/reports", async (request, reply) => {
    app.requireRole(request, "teacher");
    reply.header("cache-control", "no-store");

    const reports = await db()
      .select({
        id: contentReports.id,
        targetKind: contentReports.targetKind,
        targetId: contentReports.targetId,
        targetVersion: contentReports.targetVersion,
        locale: contentReports.locale,
        category: contentReports.category,
        note: contentReports.note,
        status: contentReports.status,
        createdAt: contentReports.createdAt,
        reporterName: users.name,
      })
      .from(contentReports)
      .leftJoin(users, eq(contentReports.reporterId, users.id))
      .orderBy(desc(contentReports.createdAt))
      .limit(500);

    return { reports };
  });
};
