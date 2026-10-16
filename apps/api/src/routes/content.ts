import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  applyContentAction,
  compareTopics,
  contentActionSchema,
  createLessonSchema,
  ERROR_CODES,
  INITIAL_CONTENT_STATUS,
  isVisibleToStudent,
  localeSchema,
  topicIdSchema,
  upsertLessonTranslationSchema,
  type Locale,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { lessonReads } from "../db/schema/app.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import { recomputeTopicProgress } from "../lib/progress.js";
import { forbidden, HttpError, notFound, parseBody } from "../lib/http-error.js";
import { allowUnapprovedDrafts } from "../lib/settings.js";

const listQuerySchema = z.object({
  locale: localeSchema,
  topicId: topicIdSchema.optional(),
});

const readQuerySchema = z.object({ locale: localeSchema });

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
      .where(and(eq(lessons.slug, slug), eq(lessonTranslations.locale, locale)))
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

      return { translation: saved, version };
    });
  });

  /**
   * Drives the approval state machine. The transition rules and the role check
   * live in `packages/shared`, so the API and the UI agree on them.
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

      const transition = applyContentAction(current.status, input.action, reviewer.role);

      if (!transition.ok) {
        throw transition.reason === "forbidden"
          ? forbidden()
          : new HttpError(409, ERROR_CODES.INVALID_STATUS_TRANSITION);
      }

      const [updated] = await tx
        .update(lessonTranslations)
        .set({
          status: transition.status,
          reviewNote: input.note ?? null,
          approvedBy: transition.recordsApproval ? reviewer.id : null,
          approvedAt: transition.recordsApproval ? sql`now()` : null,
          updatedAt: new Date(),
        })
        .where(eq(lessonTranslations.id, current.id))
        .returning({
          id: lessonTranslations.id,
          status: lessonTranslations.status,
          approvedBy: lessonTranslations.approvedBy,
          approvedAt: lessonTranslations.approvedAt,
        });

      return { translation: updated, version: current.version };
    });
  });
};
