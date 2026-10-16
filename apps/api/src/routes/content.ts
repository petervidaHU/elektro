import type { FastifyPluginAsync } from "fastify";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  applyContentAction,
  contentActionSchema,
  createLessonSchema,
  ERROR_CODES,
  INITIAL_CONTENT_STATUS,
  isVisibleToStudent,
  localeSchema,
  topicIdSchema,
  upsertLessonTranslationSchema,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import { forbidden, HttpError, notFound, parseBody } from "../lib/http-error.js";
import { allowUnapprovedDrafts } from "../lib/settings.js";

const listQuerySchema = z.object({
  locale: localeSchema,
  topicId: topicIdSchema.optional(),
});

const readQuerySchema = z.object({ locale: localeSchema });

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
        slug: lessons.slug,
        topicId: lessons.topicId,
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

    return { lessons: visible };
  });

  app.get("/lessons/:slug", async (request) => {
    const { slug } = parseBody(z.object({ slug: z.string().min(1) }), request.params);
    const query = parseQuery(readQuerySchema, request.query);
    const user = request.currentUser;
    const isReviewer = user !== null && user.role !== "student";
    const draftsVisible = isReviewer || (await allowUnapprovedDrafts());

    const rows = await db()
      .select({
        id: lessonTranslations.id,
        topicId: lessons.topicId,
        version: lessonVersions.version,
        locale: lessonTranslations.locale,
        title: lessonTranslations.title,
        summary: lessonTranslations.summary,
        body: lessonTranslations.body,
        status: lessonTranslations.status,
        approvedAt: lessonTranslations.approvedAt,
      })
      .from(lessonTranslations)
      .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
      .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
      .where(and(eq(lessons.slug, slug), eq(lessonTranslations.locale, query.locale)))
      .orderBy(desc(lessonVersions.version));

    const lesson = rows.find((row) => isVisibleToStudent(row.status, draftsVisible));

    if (!lesson) {
      throw notFound();
    }

    return { lesson };
  });

  app.post("/lessons", async (request, reply) => {
    app.requireRole(request, "teacher");
    const input = parseBody(createLessonSchema, request.body);

    const [created] = await db()
      .insert(lessons)
      .values({ topicId: input.topicId, slug: input.slug })
      .onConflictDoNothing({ target: lessons.slug })
      .returning({ id: lessons.id, slug: lessons.slug, topicId: lessons.topicId });

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
