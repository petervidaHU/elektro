import type { FastifyPluginAsync } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  contentActionSchema,
  hasAtLeastRole,
  INITIAL_CONTENT_STATUS,
  isVisibleToStudent,
  localeSchema,
  TOPIC_IDS,
  topicIdSchema,
  upsertTopicIntroSchema,
  type Locale,
  type TopicId,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { topicIntroTranslations } from "../db/schema/content.js";
import { notFound, parseBody } from "../lib/http-error.js";
import { reviewContent, type Tx } from "../lib/review.js";
import { allowUnapprovedDrafts } from "../lib/settings.js";
import type { AuthenticatedUser } from "../plugins/auth.js";
import { reviewScreen } from "./glossary.js";

const topicParams = z.object({ topicId: topicIdSchema });
const localeQuery = z.object({ locale: localeSchema.default("hu") });

/**
 * Topic intros (plan S6): a short text per topic and locale for the syllabus
 * and the topic hub, with the same versioning, approval, approver snapshot
 * and review log as lessons.
 */
export const topicIntroRoutes: FastifyPluginAsync = async (app) => {
  function review(tx: Tx, topicId: TopicId, row: { id: string; version: number; locale: Locale; status: typeof topicIntroTranslations.$inferSelect.status }, action: Parameters<typeof reviewContent>[2], reviewer: AuthenticatedUser, note?: string) {
    return reviewContent(
      tx,
      { kind: "topic_intro", slug: topicId, rowId: row.id, version: row.version, locale: row.locale, status: row.status },
      action,
      reviewer,
      note,
      async (columns) => {
        const [updated] = await tx
          .update(topicIntroTranslations)
          .set(columns)
          .where(eq(topicIntroTranslations.id, row.id))
          .returning({ id: topicIntroTranslations.id, status: topicIntroTranslations.status });
        return updated!;
      },
    );
  }

  /** The intros the requester may see, by topic (one request for the whole syllabus). */
  app.get("/topic-intros", async (request, reply) => {
    const { locale } = parseBody(localeQuery, request.query);
    const user = request.currentUser;
    const draftsVisible = (user !== null && hasAtLeastRole(user.role, "teacher")) || (await allowUnapprovedDrafts());
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({ topicId: topicIntroTranslations.topicId, text: topicIntroTranslations.text, status: topicIntroTranslations.status })
      .from(topicIntroTranslations)
      .where(eq(topicIntroTranslations.locale, locale))
      .orderBy(topicIntroTranslations.topicId, desc(topicIntroTranslations.version));

    const intros: Partial<Record<TopicId, { text: string; status: string }>> = {};
    for (const row of rows) {
      if (!intros[row.topicId] && isVisibleToStudent(row.status, draftsVisible)) {
        intros[row.topicId] = { text: row.text, status: row.status };
      }
    }
    return { intros };
  });

  /** Every topic with the status of its newest intro and the live one. */
  app.get("/manage/intros", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        topicId: topicIntroTranslations.topicId,
        version: topicIntroTranslations.version,
        status: topicIntroTranslations.status,
        updatedAt: topicIntroTranslations.updatedAt,
      })
      .from(topicIntroTranslations)
      .where(eq(topicIntroTranslations.locale, locale))
      .orderBy(topicIntroTranslations.topicId, desc(topicIntroTranslations.version));

    return {
      intros: TOPIC_IDS.flatMap((topicId) => {
        const versions = rows.filter((row) => row.topicId === topicId);
        const latest = versions[0];
        return latest
          ? [{ topicId, latest: { version: latest.version, status: latest.status, updatedAt: latest.updatedAt }, liveVersion: versions.find((v) => v.status === "approved")?.version ?? null }]
          : [];
      }),
    };
  });

  /** The newest wording of one intro for the editor (staff), including drafts. */
  app.get("/topic-intros/:topicId", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { topicId } = parseBody(topicParams, request.params);
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");

    const [latest] = await db()
      .select({ version: topicIntroTranslations.version, text: topicIntroTranslations.text, status: topicIntroTranslations.status })
      .from(topicIntroTranslations)
      .where(and(eq(topicIntroTranslations.topicId, topicId), eq(topicIntroTranslations.locale, locale)))
      .orderBy(desc(topicIntroTranslations.version))
      .limit(1);
    return { intro: latest ?? null };
  });

  /** Saves the intro: edits an unapproved version in place, or creates the next version of an approved one. */
  app.put("/topic-intros/:topicId", async (request) => {
    const editor = app.requireRole(request, "teacher");
    const { topicId } = parseBody(topicParams, request.params);
    const input = parseBody(upsertTopicIntroSchema, request.body);

    return db().transaction(async (tx) => {
      const [latest] = await tx
        .select({ id: topicIntroTranslations.id, version: topicIntroTranslations.version, status: topicIntroTranslations.status })
        .from(topicIntroTranslations)
        .where(and(eq(topicIntroTranslations.topicId, topicId), eq(topicIntroTranslations.locale, input.locale)))
        .orderBy(desc(topicIntroTranslations.version))
        .limit(1);

      let row: { id: string; version: number; status: typeof topicIntroTranslations.$inferSelect.status };
      if (!latest || latest.status === "approved") {
        const [created] = await tx
          .insert(topicIntroTranslations)
          .values({ topicId, locale: input.locale, version: (latest?.version ?? 0) + 1, text: input.text, createdBy: editor.id })
          .returning({ id: topicIntroTranslations.id, version: topicIntroTranslations.version, status: topicIntroTranslations.status });
        row = created!;
      } else {
        const [updated] = await tx
          .update(topicIntroTranslations)
          .set({
            text: input.text,
            status: INITIAL_CONTENT_STATUS,
            reviewNote: null,
            approvedBy: null,
            approvedByName: null,
            approvedByEmail: null,
            approvedByRole: null,
            approvedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(topicIntroTranslations.id, latest.id))
          .returning({ id: topicIntroTranslations.id, version: topicIntroTranslations.version, status: topicIntroTranslations.status });
        row = updated!;
      }

      // An admin's save goes live directly (Q22).
      if (hasAtLeastRole(editor.role, "admin")) {
        const published = await review(tx, topicId, { ...row, locale: input.locale }, "publish_directly", editor);
        return { intro: { topicId, version: row.version, status: published.status } };
      }
      return { intro: { topicId, version: row.version, status: row.status } };
    });
  });

  app.post("/topic-intros/:topicId/review", async (request) => {
    const reviewer = app.requireRole(request, "teacher");
    const { topicId } = parseBody(topicParams, request.params);
    const input = parseBody(contentActionSchema, request.body);

    return db().transaction(async (tx) => {
      const [current] = await tx
        .select({ id: topicIntroTranslations.id, version: topicIntroTranslations.version, status: topicIntroTranslations.status })
        .from(topicIntroTranslations)
        .where(and(eq(topicIntroTranslations.topicId, topicId), eq(topicIntroTranslations.locale, input.locale)))
        .orderBy(desc(topicIntroTranslations.version))
        .limit(1);
      if (!current) throw notFound();
      const updated = await review(tx, topicId, { ...current, locale: input.locale }, input.action, reviewer, input.note);
      return { translation: updated, version: current.version };
    });
  });

  /** Admin housekeeping (and e2e cleanup): removes every version of a topic's intro. */
  app.delete("/topic-intros/:topicId", async (request, reply) => {
    app.requireRole(request, "admin");
    const { topicId } = parseBody(topicParams, request.params);
    const deleted = await db().delete(topicIntroTranslations).where(eq(topicIntroTranslations.topicId, topicId)).returning({ id: topicIntroTranslations.id });
    if (deleted.length === 0) throw notFound();
    return reply.code(204).send();
  });

  app.get("/manage/intros/:topicId/review", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { topicId } = parseBody(topicParams, request.params);
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");

    const versions = await db()
      .select({
        version: topicIntroTranslations.version,
        title: topicIntroTranslations.topicId,
        body: topicIntroTranslations.text,
        status: topicIntroTranslations.status,
        reviewNote: topicIntroTranslations.reviewNote,
        updatedAt: topicIntroTranslations.updatedAt,
        approvedAt: topicIntroTranslations.approvedAt,
        approvedBy: topicIntroTranslations.approvedBy,
        approvedByName: topicIntroTranslations.approvedByName,
        approvedByEmail: topicIntroTranslations.approvedByEmail,
        approvedByRole: topicIntroTranslations.approvedByRole,
      })
      .from(topicIntroTranslations)
      .where(and(eq(topicIntroTranslations.topicId, topicId), eq(topicIntroTranslations.locale, locale)))
      .orderBy(desc(topicIntroTranslations.version));
    return reviewScreen("topic_intro", topicId, locale, versions);
  });
};
