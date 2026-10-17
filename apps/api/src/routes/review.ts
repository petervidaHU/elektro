import type { FastifyPluginAsync } from "fastify";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { localeSchema, redactDeletedReviewer } from "@elektro/shared";
import { db } from "../db/index.js";
import {
  contentReviewEvents,
  lessons,
  lessonTranslations,
  lessonVersions,
} from "../db/schema/content.js";
import { notFound, parseBody } from "../lib/http-error.js";

const querySchema = z.object({ locale: localeSchema.default("hu") });
const slugParams = z.object({ slug: z.string().min(1) });

/**
 * The review queue and the review screen (plan §3.3 `/teacher/review`):
 * teachers and admins only. Approving or requesting changes goes through
 * `POST /lessons/:slug/review` (documented, S8).
 */
export const reviewRoutes: FastifyPluginAsync = async (app) => {
  /** Lessons whose newest version waits for review (`ai_draft` / `in_review`). */
  app.get("/manage/review", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { locale } = parseBody(querySchema, request.query);
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        slug: lessons.slug,
        topicId: lessons.topicId,
        lessonId: lessons.id,
        version: lessonVersions.version,
        title: lessonTranslations.title,
        status: lessonTranslations.status,
        updatedAt: lessonTranslations.updatedAt,
      })
      .from(lessonTranslations)
      .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
      .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
      .where(and(eq(lessonTranslations.locale, locale), isNull(lessons.archivedAt)))
      .orderBy(desc(lessonVersions.version));

    // Newest version of each lesson; it is queued only while awaiting review.
    const newest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!newest.has(row.slug)) newest.set(row.slug, row);
    }
    const queued = [...newest.values()].filter((row) => row.status === "ai_draft" || row.status === "in_review");

    const hasLive =
      queued.length === 0
        ? new Set<string>()
        : new Set(
            rows
              .filter((row) => row.status === "approved" && queued.some((item) => item.lessonId === row.lessonId))
              .map((row) => row.slug),
          );

    return {
      items: queued
        .map(({ lessonId: _lessonId, ...row }) => ({ ...row, hasLive: hasLive.has(row.slug) }))
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()),
    };
  });

  /**
   * Everything the review screen shows for one lesson: the version under
   * review, the live approved version to diff against, and the review
   * history. Deleted reviewers appear without name and email (Q11).
   */
  app.get("/manage/lessons/:slug/review", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { slug } = parseBody(slugParams, request.params);
    const { locale } = parseBody(querySchema, request.query);
    reply.header("cache-control", "no-store");

    const versions = await db()
      .select({
        version: lessonVersions.version,
        topicId: lessons.topicId,
        title: lessonTranslations.title,
        summary: lessonTranslations.summary,
        body: lessonTranslations.body,
        status: lessonTranslations.status,
        reviewNote: lessonTranslations.reviewNote,
        updatedAt: lessonTranslations.updatedAt,
        approvedAt: lessonTranslations.approvedAt,
        approvedBy: lessonTranslations.approvedBy,
        approvedByName: lessonTranslations.approvedByName,
        approvedByEmail: lessonTranslations.approvedByEmail,
        approvedByRole: lessonTranslations.approvedByRole,
      })
      .from(lessonTranslations)
      .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
      .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
      .where(and(eq(lessons.slug, slug), eq(lessonTranslations.locale, locale), isNull(lessons.archivedAt)))
      .orderBy(desc(lessonVersions.version));

    const latest = versions[0];
    if (!latest) {
      throw notFound();
    }
    const live = versions.find((row) => row.status === "approved");

    const reviews = await db()
      .select({
        id: contentReviewEvents.id,
        version: contentReviewEvents.version,
        action: contentReviewEvents.action,
        toStatus: contentReviewEvents.toStatus,
        actorId: contentReviewEvents.actorId,
        actorName: contentReviewEvents.actorName,
        actorEmail: contentReviewEvents.actorEmail,
        actorRole: contentReviewEvents.actorRole,
        note: contentReviewEvents.note,
        createdAt: contentReviewEvents.createdAt,
      })
      .from(contentReviewEvents)
      .where(
        and(
          eq(contentReviewEvents.contentKind, "lesson"),
          eq(contentReviewEvents.contentSlug, slug),
          eq(contentReviewEvents.locale, locale),
        ),
      )
      .orderBy(desc(contentReviewEvents.createdAt));

    const approval = (row: typeof latest) => ({
      at: row.approvedAt,
      role: row.approvedByRole,
      deleted: row.approvedBy === null,
      // A deleted approver's name and email never leave the admin routes.
      name: row.approvedBy === null ? null : row.approvedByName,
      email: row.approvedBy === null ? null : row.approvedByEmail,
    });

    return {
      latest: {
        version: latest.version,
        topicId: latest.topicId,
        title: latest.title,
        summary: latest.summary,
        body: latest.body,
        status: latest.status,
        reviewNote: latest.reviewNote,
        updatedAt: latest.updatedAt,
        approval: latest.status === "approved" ? approval(latest) : null,
      },
      live:
        live && live.version !== latest.version
          ? { version: live.version, title: live.title, body: live.body, approval: approval(live) }
          : null,
      reviews: reviews.map(redactDeletedReviewer),
    };
  });
};

