import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import {
  applyContentAction,
  approvalFields,
  compareTopics,
  contentActionSchema,
  createLessonSchema,
  ERROR_CODES,
  hasAtLeastRole,
  INITIAL_CONTENT_STATUS,
  isReorderOf,
  isVisibleToStudent,
  localeSchema,
  redactDeletedReviewer,
  reorderLessonsSchema,
  reviewEventFields,
  snapshotReviewer,
  topicIdSchema,
  updateLessonSchema,
  upsertLessonTranslationSchema,
  type ContentAction,
  type ContentStatus,
  type Locale,
  type TopicId,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { lessonReads, topicProgress } from "../db/schema/app.js";
import {
  contentReviewEvents,
  lessons,
  lessonTranslations,
  lessonVersions,
} from "../db/schema/content.js";
import { recomputeTopicProgress } from "../lib/progress.js";
import { forbidden, HttpError, notFound, parseBody } from "../lib/http-error.js";
import { allowUnapprovedDrafts } from "../lib/settings.js";
import type { AuthenticatedUser } from "../plugins/auth.js";

/**
 * Archiving or moving a lesson changes how many lessons a topic has, so the
 * cached progress of everyone with progress on that topic is recomputed.
 */
async function recomputeTopicForAll(topicId: TopicId) {
  const rows = await db()
    .select({ userId: topicProgress.userId })
    .from(topicProgress)
    .where(eq(topicProgress.topicId, topicId));
  for (const { userId } of rows) {
    await recomputeTopicProgress(userId, topicId);
  }
}

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

/**
 * Applies a review action to one translation and documents it (plan §2.6,
 * Q19): the approver snapshot on the row and a row in the append-only log, in
 * the caller's transaction. Used by the review route and by an admin's direct
 * publish on save (Q22), so both leave the same record.
 */
async function applyReview(
  tx: Tx,
  target: {
    slug: string;
    translationId: string;
    version: number;
    locale: Locale;
    status: ContentStatus;
  },
  action: ContentAction,
  reviewer: AuthenticatedUser,
  note?: string,
) {
  const signed = snapshotReviewer(reviewer);
  if (!signed.ok) {
    throw signed.reason === "forbidden"
      ? forbidden()
      : new HttpError(409, ERROR_CODES.REVIEWER_IDENTITY_INCOMPLETE);
  }

  const transition = applyContentAction(target.status, action, reviewer.role);
  if (!transition.ok) {
    throw transition.reason === "forbidden"
      ? forbidden()
      : new HttpError(409, ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const [updated] = await tx
    .update(lessonTranslations)
    .set({
      status: transition.status,
      reviewNote: note ?? null,
      ...approvalFields(transition, signed.snapshot),
      approvedAt: transition.recordsApproval ? sql`now()` : null,
      updatedAt: new Date(),
    })
    .where(eq(lessonTranslations.id, target.translationId))
    .returning({
      id: lessonTranslations.id,
      status: lessonTranslations.status,
      approvedBy: lessonTranslations.approvedBy,
      approvedByName: lessonTranslations.approvedByName,
      approvedByEmail: lessonTranslations.approvedByEmail,
      approvedByRole: lessonTranslations.approvedByRole,
      approvedAt: lessonTranslations.approvedAt,
    });

  // `now()` is the transaction start, so the log and approved_at agree.
  await tx.insert(contentReviewEvents).values({
    contentKind: "lesson",
    contentSlug: target.slug,
    translationId: target.translationId,
    version: target.version,
    locale: target.locale,
    ...reviewEventFields({
      action,
      fromStatus: target.status,
      transition,
      reviewer: signed.snapshot,
      note,
    }),
    createdAt: sql`now()`,
  });

  return updated;
}

const listQuerySchema = z.object({
  locale: localeSchema,
  topicId: topicIdSchema.optional(),
});

const readQuerySchema = z.object({ locale: localeSchema });

const reviewsQuerySchema = z.object({ locale: localeSchema.optional() });

const slugParamsSchema = z.object({ slug: z.string().min(1) });

/** Reading progress: opened, reached a section (for resume), or completed. */
const lessonProgressSchema = z.object({
  locale: localeSchema,
  event: z.enum(["open", "section", "complete"]),
  section: z.string().trim().min(1).max(120).optional(),
});

function parseQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  return parseBody(schema, query);
}

/**
 * Lesson content. Rows are language-neutral (`lessons` + `lesson_versions`)
 * with per-locale translations carrying their own approval state.
 *
 * Students see the newest **approved** translation, unless the admin setting
 * `content.allow_unapproved_drafts` says otherwise. Teachers and admins always
 * see drafts, because they are the ones reviewing them.
 */
export const contentRoutes: FastifyPluginAsync = async (app) => {
  app.get("/lessons", async (request) => {
    const query = parseQuery(listQuerySchema, request.query);
    const user = request.currentUser;
    const isReviewer = user !== null && user.role !== "student";
    const draftsVisible = isReviewer || (await allowUnapprovedDrafts());

    const rows = await db()
      .select({
        lessonId: lessons.id,
        slug: lessons.slug,
        topicId: lessons.topicId,
        position: lessons.position,
        version: lessonVersions.version,
        title: lessonTranslations.title,
        summary: lessonTranslations.summary,
        status: lessonTranslations.status,
      })
      .from(lessonTranslations)
      .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
      .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
      .where(
        and(
          eq(lessonTranslations.locale, query.locale),
          query.topicId ? eq(lessons.topicId, query.topicId) : undefined,
          isNull(lessons.archivedAt),
        ),
      )
      .orderBy(lessons.slug, desc(lessonVersions.version));

    // Keep the newest visible version per lesson.
    const seen = new Set<string>();
    const visible = rows.filter((row) => {
      if (seen.has(row.slug) || !isVisibleToStudent(row.status, draftsVisible)) {
        return false;
      }
      seen.add(row.slug);
      return true;
    });

    // Syllabus order: topics as in the shared syllabus, lessons by position.
    visible.sort(
      (a, b) =>
        compareTopics(a.topicId, b.topicId) ||
        a.position - b.position ||
        a.slug.localeCompare(b.slug),
    );

    const completed = new Set<string>();
    if (user && visible.length > 0) {
      const reads = await db()
        .select({ lessonId: lessonReads.lessonId, completedAt: lessonReads.completedAt })
        .from(lessonReads)
        .where(
          and(
            eq(lessonReads.userId, user.id),
            inArray(
              lessonReads.lessonId,
              visible.map((row) => row.lessonId),
            ),
          ),
        );
      for (const read of reads) {
        if (read.completedAt) completed.add(read.lessonId);
      }
    }

    return {
      lessons: visible.map((row) => ({ ...row, completed: completed.has(row.lessonId) })),
    };
  });

  /** The newest translation of a lesson the requester may see, or 404. */
  async function findVisibleLesson(request: FastifyRequest, slug: string, locale: Locale) {
    const user = request.currentUser;
    const isReviewer = user !== null && user.role !== "student";
    const draftsVisible = isReviewer || (await allowUnapprovedDrafts());

    const rows = await db()
      .select({
        id: lessonTranslations.id,
        lessonId: lessons.id,
        lessonVersionId: lessonVersions.id,
        topicId: lessons.topicId,
        version: lessonVersions.version,
        locale: lessonTranslations.locale,
        title: lessonTranslations.title,
        summary: lessonTranslations.summary,
        body: lessonTranslations.body,
        status: lessonTranslations.status,
        reviewNote: lessonTranslations.reviewNote,
        approvedAt: lessonTranslations.approvedAt,
      })
      .from(lessonTranslations)
      .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
      .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
      .where(
        and(
          eq(lessons.slug, slug),
          eq(lessonTranslations.locale, locale),
          // Archived lessons are hidden from everyone but admins (plan Q23).
          user?.role === "admin" ? undefined : isNull(lessons.archivedAt),
        ),
      )
      .orderBy(desc(lessonVersions.version));

    const lesson = rows.find((row) => isVisibleToStudent(row.status, draftsVisible));
    if (!lesson) {
      throw notFound();
    }
    return lesson;
  }

  async function readStateOf(userId: string, lessonId: string) {
    const [read] = await db()
      .select({
        lastSection: lessonReads.lastSection,
        firstOpenedAt: lessonReads.firstOpenedAt,
        completedAt: lessonReads.completedAt,
      })
      .from(lessonReads)
      .where(and(eq(lessonReads.userId, userId), eq(lessonReads.lessonId, lessonId)))
      .limit(1);
    return read ?? null;
  }

  app.get("/lessons/:slug", async (request, reply) => {
    const { slug } = parseBody(slugParamsSchema, request.params);
    const query = parseQuery(readQuerySchema, request.query);
    const { lessonVersionId: _version, ...lesson } = await findVisibleLesson(request, slug, query.locale);
    const user = request.currentUser;

    reply.header("cache-control", "no-store");
    return { lesson, read: user ? await readStateOf(user.id, lesson.lessonId) : null };
  });

  /**
   * Records reading: opening a lesson, the section reached (to resume there)
   * and completing it. Updates the topic progress on open and complete.
   */
  app.post("/lessons/:slug/progress", async (request) => {
    const user = app.requireUser(request);
    const { slug } = parseBody(slugParamsSchema, request.params);
    const input = parseBody(lessonProgressSchema, request.body);
    const lesson = await findVisibleLesson(request, slug, input.locale);
    const now = new Date();

    const changes = {
      lessonVersionId: lesson.lessonVersionId,
      updatedAt: now,
      ...(input.section ? { lastSection: input.section } : {}),
      ...(input.event === "complete" ? { completedAt: now } : {}),
    };

    await db()
      .insert(lessonReads)
      .values({ userId: user.id, lessonId: lesson.lessonId, ...changes })
      .onConflictDoUpdate({
        target: [lessonReads.userId, lessonReads.lessonId],
        // A lesson stays completed: re-opening it never clears the completion.
        set: input.event === "complete" ? changes : { ...changes, completedAt: sql`${lessonReads.completedAt}` },
      });

    if (input.event !== "section") {
      await recomputeTopicProgress(user.id, lesson.topicId);
    }

    return { read: await readStateOf(user.id, lesson.lessonId) };
  });

  /** Admin housekeeping (and e2e cleanup): removes a lesson with all versions. */
  app.delete("/lessons/:slug", async (request, reply) => {
    app.requireRole(request, "admin");
    const { slug } = parseBody(slugParamsSchema, request.params);

    const deleted = await db()
      .delete(lessons)
      .where(eq(lessons.slug, slug))
      .returning({ id: lessons.id });

    if (deleted.length === 0) {
      throw notFound();
    }
    return reply.code(204).send();
  });

  app.post("/lessons", async (request, reply) => {
    app.requireRole(request, "teacher");
    const input = parseBody(createLessonSchema, request.body);

    const [created] = await db()
      .insert(lessons)
      .values({ topicId: input.topicId, slug: input.slug, position: input.position })
      .onConflictDoNothing({ target: lessons.slug })
      .returning({
        id: lessons.id,
        slug: lessons.slug,
        topicId: lessons.topicId,
        position: lessons.position,
      });

    if (!created) {
      throw new HttpError(409, ERROR_CODES.VALIDATION_FAILED, { slug: ["duplicate"] });
    }

    return reply.code(201).send({ lesson: created });
  });

  /**
   * Writes a translation. Editing an **approved** translation never mutates it:
   * a new version is created, and the approved one stays live until the new
   * version is approved in turn.
   */
  app.put("/lessons/:slug/translations", async (request) => {
    const editor = app.requireRole(request, "teacher");
    const { slug } = parseBody(z.object({ slug: z.string().min(1) }), request.params);
    const input = parseBody(upsertLessonTranslationSchema, request.body);

    return db().transaction(async (tx) => {
      const [lesson] = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.slug, slug))
        .limit(1);

      if (!lesson) {
        throw notFound();
      }

      const [latest] = await tx
        .select({
          versionId: lessonVersions.id,
          version: lessonVersions.version,
          translationId: lessonTranslations.id,
          status: lessonTranslations.status,
        })
        .from(lessonVersions)
        .leftJoin(
          lessonTranslations,
          and(
            eq(lessonTranslations.lessonVersionId, lessonVersions.id),
            eq(lessonTranslations.locale, input.locale),
          ),
        )
        .where(eq(lessonVersions.lessonId, lesson.id))
        .orderBy(desc(lessonVersions.version))
        .limit(1);

      const mustCreateVersion = latest === undefined || latest.status === "approved";

      let versionId: string;
      let version: number;

      if (mustCreateVersion) {
        version = (latest?.version ?? 0) + 1;
        const [createdVersion] = await tx
          .insert(lessonVersions)
          .values({ lessonId: lesson.id, version, createdBy: editor.id })
          .returning({ id: lessonVersions.id });

        if (!createdVersion) {
          throw new HttpError(500, ERROR_CODES.INTERNAL_ERROR);
        }
        versionId = createdVersion.id;
      } else {
        versionId = latest.versionId;
        version = latest.version;
      }

      const [saved] = await tx
        .insert(lessonTranslations)
        .values({
          lessonVersionId: versionId,
          locale: input.locale,
          title: input.title,
          summary: input.summary ?? null,
          body: input.body,
          status: INITIAL_CONTENT_STATUS,
        })
        .onConflictDoUpdate({
          target: [lessonTranslations.lessonVersionId, lessonTranslations.locale],
          set: {
            title: input.title,
            summary: input.summary ?? null,
            body: input.body,
            // A re-edited draft goes back to the start of the review flow.
            status: INITIAL_CONTENT_STATUS,
            reviewNote: null,
            approvedBy: null,
            approvedByName: null,
            approvedByEmail: null,
            approvedByRole: null,
            approvedAt: null,
            updatedAt: new Date(),
          },
        })
        .returning({
          id: lessonTranslations.id,
          status: lessonTranslations.status,
          locale: lessonTranslations.locale,
        });

      await tx
        .update(lessons)
        .set({ updatedAt: new Date() })
        .where(eq(lessons.id, lesson.id));

      if (!saved) {
        throw new HttpError(500, ERROR_CODES.INTERNAL_ERROR);
      }

      // An admin's edit goes live directly (plan Q22), still with a full
      // approval record. A teacher's edit is a draft for review.
      if (hasAtLeastRole(editor.role, "admin")) {
        const published = await applyReview(
          tx,
          { slug, translationId: saved.id, version, locale: input.locale, status: saved.status },
          "publish_directly",
          editor,
        );
        return { translation: { ...saved, status: published?.status ?? saved.status }, version };
      }

      return { translation: saved, version };
    });
  });

  /**
   * Drives the approval state machine. The transition rules and the role check
   * live in `packages/shared`, so the API and the UI agree on them.
   *
   * Every action is documented: the approver snapshot (id, name, email, role)
   * and `approved_at` go on the translation, and one row goes to the
   * append-only `content_review_events` log, in the same transaction.
   */
  app.post("/lessons/:slug/review", async (request) => {
    const reviewer = app.requireRole(request, "teacher");
    const { slug } = parseBody(z.object({ slug: z.string().min(1) }), request.params);
    const input = parseBody(contentActionSchema, request.body);

    return db().transaction(async (tx) => {
      const [current] = await tx
        .select({
          id: lessonTranslations.id,
          status: lessonTranslations.status,
          version: lessonVersions.version,
        })
        .from(lessonTranslations)
        .innerJoin(
          lessonVersions,
          eq(lessonTranslations.lessonVersionId, lessonVersions.id),
        )
        .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
        .where(and(eq(lessons.slug, slug), eq(lessonTranslations.locale, input.locale)))
        .orderBy(desc(lessonVersions.version))
        .limit(1);

      if (!current) {
        throw notFound();
      }

      const updated = await applyReview(
        tx,
        {
          slug,
          translationId: current.id,
          version: current.version,
          locale: input.locale,
          status: current.status,
        },
        input.action,
        reviewer,
        input.note,
      );

      return { translation: updated, version: current.version };
    });
  });

  /** Every review action on a lesson, newest first, with the full reviewer snapshot. */
  async function lessonReviews(slug: string, locale: Locale | undefined) {
    return db()
      .select({
        id: contentReviewEvents.id,
        version: contentReviewEvents.version,
        locale: contentReviewEvents.locale,
        action: contentReviewEvents.action,
        fromStatus: contentReviewEvents.fromStatus,
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
          locale ? eq(contentReviewEvents.locale, locale) : undefined,
        ),
      )
      .orderBy(desc(contentReviewEvents.createdAt));
  }

  /**
   * The approval record of a lesson, as the app shows it (teacher+). A
   * reviewer whose account was deleted appears as `actorDeleted` without name
   * and email; those are only returned by the admin route below (plan Q11).
   */
  app.get("/lessons/:slug/reviews", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { slug } = parseBody(slugParamsSchema, request.params);
    const query = parseQuery(reviewsQuerySchema, request.query);

    const reviews = await lessonReviews(slug, query.locale);

    reply.header("cache-control", "no-store");
    return { reviews: reviews.map(redactDeletedReviewer) };
  });

  /**
   * The full approval record, including the name and email of deleted
   * reviewers. Admin-only and not used by the UI: it exists for audits.
   */
  app.get("/admin/lessons/:slug/reviews", async (request, reply) => {
    app.requireRole(request, "admin");
    const { slug } = parseBody(slugParamsSchema, request.params);
    const query = parseQuery(reviewsQuerySchema, request.query);

    const reviews = await lessonReviews(slug, query.locale);

    reply.header("cache-control", "no-store");
    return {
      reviews: reviews.map((review) => ({ ...review, actorDeleted: review.actorId === null })),
    };
  });

  /**
   * The detailed lesson list of the content-management page (plan §3.3
   * `/teacher/content`): per lesson the newest version in `locale` and the
   * live (approved) one with its approval record. Admins also get archived
   * lessons. A deleted approver is shown without name (plan Q11).
   */
  app.get("/manage/lessons", async (request, reply) => {
    const user = app.requireRole(request, "teacher");
    const query = parseQuery(readQuerySchema, request.query);
    const isAdmin = hasAtLeastRole(user.role, "admin");

    const lessonRows = await db()
      .select({
        lessonId: lessons.id,
        slug: lessons.slug,
        topicId: lessons.topicId,
        position: lessons.position,
        archivedAt: lessons.archivedAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(isAdmin ? undefined : isNull(lessons.archivedAt));

    const translationRows =
      lessonRows.length === 0
        ? []
        : await db()
            .select({
              lessonId: lessonVersions.lessonId,
              version: lessonVersions.version,
              title: lessonTranslations.title,
              status: lessonTranslations.status,
              updatedAt: lessonTranslations.updatedAt,
              approvedBy: lessonTranslations.approvedBy,
              approvedByName: lessonTranslations.approvedByName,
              approvedByRole: lessonTranslations.approvedByRole,
              approvedAt: lessonTranslations.approvedAt,
            })
            .from(lessonTranslations)
            .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
            .where(
              and(
                eq(lessonTranslations.locale, query.locale),
                inArray(
                  lessonVersions.lessonId,
                  lessonRows.map((row) => row.lessonId),
                ),
              ),
            )
            .orderBy(desc(lessonVersions.version));

    const result = lessonRows.map((lesson) => {
      const versions = translationRows.filter((row) => row.lessonId === lesson.lessonId);
      const latest = versions[0];
      const live = versions.find((row) => row.status === "approved");
      return {
        ...lesson,
        latest: latest
          ? {
              version: latest.version,
              title: latest.title,
              status: latest.status,
              updatedAt: latest.updatedAt,
            }
          : null,
        live: live
          ? {
              version: live.version,
              title: live.title,
              approvedAt: live.approvedAt,
              approvedByRole: live.approvedByRole,
              approvedByDeleted: live.approvedBy === null,
              approvedByName: live.approvedBy === null ? null : live.approvedByName,
            }
          : null,
      };
    });

    result.sort(
      (a, b) =>
        compareTopics(a.topicId, b.topicId) ||
        a.position - b.position ||
        a.slug.localeCompare(b.slug),
    );

    reply.header("cache-control", "no-store");
    return { lessons: result };
  });

  /** Moves a lesson to another topic, at the end of that topic. */
  app.patch("/lessons/:slug", async (request) => {
    app.requireRole(request, "teacher");
    const { slug } = parseBody(slugParamsSchema, request.params);
    const input = parseBody(updateLessonSchema, request.body);

    const [lesson] = await db()
      .select({ id: lessons.id, topicId: lessons.topicId })
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);

    if (!lesson) {
      throw notFound();
    }
    if (lesson.topicId === input.topicId) {
      return { lesson: { slug, topicId: lesson.topicId } };
    }

    await db()
      .update(lessons)
      .set({
        topicId: input.topicId,
        position: sql`(SELECT COALESCE(MAX(l.position) + 1, 0) FROM ${lessons} AS l WHERE l.topic_id = ${input.topicId})`,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, lesson.id));

    await recomputeTopicForAll(lesson.topicId);
    await recomputeTopicForAll(input.topicId);
    return { lesson: { slug, topicId: input.topicId } };
  });

  /** The full new order of the (not archived) lessons of one topic. */
  app.put("/lessons/order", async (request) => {
    app.requireRole(request, "teacher");
    const input = parseBody(reorderLessonsSchema, request.body);

    await db().transaction(async (tx) => {
      const rows = await tx
        .select({ slug: lessons.slug })
        .from(lessons)
        .where(and(eq(lessons.topicId, input.topicId), isNull(lessons.archivedAt)))
        .orderBy(asc(lessons.position));

      if (!isReorderOf(rows.map((row) => row.slug), input.slugs)) {
        throw new HttpError(409, ERROR_CODES.VALIDATION_FAILED, { slugs: ["stale_order"] });
      }
      for (const [position, slug] of input.slugs.entries()) {
        await tx.update(lessons).set({ position }).where(eq(lessons.slug, slug));
      }
    });

    return { topicId: input.topicId, slugs: input.slugs };
  });

  /** "Delete" from the content page: archive (plan Q23). Admin-only. */
  app.post("/lessons/:slug/archive", async (request) => {
    const admin = app.requireRole(request, "admin");
    const { slug } = parseBody(slugParamsSchema, request.params);

    const [archived] = await db()
      .update(lessons)
      .set({ archivedAt: sql`COALESCE(${lessons.archivedAt}, now())`, archivedBy: admin.id })
      .where(eq(lessons.slug, slug))
      .returning({ topicId: lessons.topicId, archivedAt: lessons.archivedAt });

    if (!archived) {
      throw notFound();
    }
    await recomputeTopicForAll(archived.topicId);
    return { lesson: { slug, archivedAt: archived.archivedAt } };
  });

  /** Brings an archived lesson back, at the end of its topic. Admin-only. */
  app.post("/lessons/:slug/restore", async (request) => {
    app.requireRole(request, "admin");
    const { slug } = parseBody(slugParamsSchema, request.params);

    const [restored] = await db()
      .update(lessons)
      .set({
        archivedAt: null,
        archivedBy: null,
        position: sql`(SELECT COALESCE(MAX(l.position) + 1, 0) FROM ${lessons} AS l WHERE l.topic_id = ${lessons.topicId} AND l.archived_at IS NULL)`,
        updatedAt: new Date(),
      })
      .where(eq(lessons.slug, slug))
      .returning({ topicId: lessons.topicId });

    if (!restored) {
      throw notFound();
    }
    await recomputeTopicForAll(restored.topicId);
    return { lesson: { slug, archivedAt: null } };
  });
};
