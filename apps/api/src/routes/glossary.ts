import type { FastifyPluginAsync } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  contentActionSchema,
  createGlossaryTermSchema,
  hasAtLeastRole,
  INITIAL_CONTENT_STATUS,
  isVisibleToStudent,
  localeSchema,
  redactDeletedReviewer,
  sortGlossary,
  termKeySchema,
  upsertGlossaryTranslationSchema,
  type Locale,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { contentReviewEvents, glossaryTerms, glossaryTranslations } from "../db/schema/content.js";
import { HttpError, notFound, parseBody } from "../lib/http-error.js";
import { reviewContent, type Tx } from "../lib/review.js";
import { allowUnapprovedDrafts } from "../lib/settings.js";
import type { AuthenticatedUser } from "../plugins/auth.js";

const keyParams = z.object({ key: termKeySchema });
const localeQuery = z.object({ locale: localeSchema.default("hu") });

const approvalColumns = {
  approvedAt: glossaryTranslations.approvedAt,
  approvedBy: glossaryTranslations.approvedBy,
  approvedByName: glossaryTranslations.approvedByName,
  approvedByEmail: glossaryTranslations.approvedByEmail,
  approvedByRole: glossaryTranslations.approvedByRole,
};

/**
 * The glossary (fogalomtár, plan S5). Public to read - students see the
 * newest approved wording of each term (or drafts, if the admin setting
 * allows); teachers and admins edit and review with the same approval rules
 * as lessons, including the approver snapshot and the review log.
 */
export const glossaryRoutes: FastifyPluginAsync = async (app) => {
  /** Applies a review action to one translation row (shared by the review route and admin saves). */
  function review(tx: Tx, key: string, row: { id: string; version: number; locale: Locale; status: typeof glossaryTranslations.$inferSelect.status }, action: Parameters<typeof reviewContent>[2], reviewer: AuthenticatedUser, note?: string) {
    return reviewContent(
      tx,
      { kind: "glossary_term", slug: key, rowId: row.id, version: row.version, locale: row.locale, status: row.status },
      action,
      reviewer,
      note,
      async (columns) => {
        const [updated] = await tx
          .update(glossaryTranslations)
          .set(columns)
          .where(eq(glossaryTranslations.id, row.id))
          .returning({ id: glossaryTranslations.id, status: glossaryTranslations.status });
        return updated!;
      },
    );
  }

  /** The glossary as the requester may see it: one entry per term. */
  app.get("/glossary", async (request, reply) => {
    const { locale } = parseBody(localeQuery, request.query);
    const user = request.currentUser;
    const draftsVisible = (user !== null && hasAtLeastRole(user.role, "teacher")) || (await allowUnapprovedDrafts());
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        key: glossaryTerms.key,
        version: glossaryTranslations.version,
        term: glossaryTranslations.term,
        definition: glossaryTranslations.definition,
        status: glossaryTranslations.status,
      })
      .from(glossaryTranslations)
      .innerJoin(glossaryTerms, eq(glossaryTranslations.termId, glossaryTerms.id))
      .where(eq(glossaryTranslations.locale, locale))
      .orderBy(glossaryTerms.key, desc(glossaryTranslations.version));

    const seen = new Set<string>();
    const visible = rows.filter((row) => {
      if (seen.has(row.key) || !isVisibleToStudent(row.status, draftsVisible)) return false;
      seen.add(row.key);
      return true;
    });
    return { terms: sortGlossary(visible, locale) };
  });

  /** Every term with its newest version and the live (approved) one, for the teacher list. */
  app.get("/manage/glossary", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        key: glossaryTerms.key,
        version: glossaryTranslations.version,
        term: glossaryTranslations.term,
        status: glossaryTranslations.status,
        updatedAt: glossaryTranslations.updatedAt,
        ...approvalColumns,
      })
      .from(glossaryTranslations)
      .innerJoin(glossaryTerms, eq(glossaryTranslations.termId, glossaryTerms.id))
      .where(eq(glossaryTranslations.locale, locale))
      .orderBy(glossaryTerms.key, desc(glossaryTranslations.version));

    const byKey = new Map<string, typeof rows>();
    for (const row of rows) byKey.set(row.key, [...(byKey.get(row.key) ?? []), row]);

    const terms = [...byKey.entries()].map(([key, versions]) => {
      const live = versions.find((v) => v.status === "approved");
      const latest = versions[0]!;
      return {
        key,
        latest: { version: latest.version, term: latest.term, status: latest.status, updatedAt: latest.updatedAt },
        live: live
          ? {
              version: live.version,
              approvedAt: live.approvedAt,
              approvedByRole: live.approvedByRole,
              approvedByDeleted: live.approvedBy === null,
              approvedByName: live.approvedBy === null ? null : live.approvedByName,
            }
          : null,
      };
    });
    return { terms: sortGlossary(terms.map((t) => ({ ...t, term: t.latest.term })), locale) };
  });

  /**
   * Writes a translation: a new term starts at version 1; editing an approved
   * one creates the next version; an unapproved one is edited in place. An
   * admin's save goes live directly (Q22).
   */
  async function save(tx: Tx, editor: AuthenticatedUser, key: string, termId: string, input: { locale: Locale; term: string; definition: string }) {
    const [latest] = await tx
      .select({ id: glossaryTranslations.id, version: glossaryTranslations.version, status: glossaryTranslations.status })
      .from(glossaryTranslations)
      .where(and(eq(glossaryTranslations.termId, termId), eq(glossaryTranslations.locale, input.locale)))
      .orderBy(desc(glossaryTranslations.version))
      .limit(1);

    let row: { id: string; version: number; locale: Locale; status: typeof INITIAL_CONTENT_STATUS | "in_review" | "approved" | "changes_requested" };
    if (!latest || latest.status === "approved") {
      const [created] = await tx
        .insert(glossaryTranslations)
        .values({ termId, locale: input.locale, version: (latest?.version ?? 0) + 1, term: input.term, definition: input.definition, createdBy: editor.id })
        .returning({ id: glossaryTranslations.id, version: glossaryTranslations.version, status: glossaryTranslations.status });
      row = { ...created!, locale: input.locale };
    } else {
      const [updated] = await tx
        .update(glossaryTranslations)
        .set({
          term: input.term,
          definition: input.definition,
          // A re-edited draft goes back to the start of the review flow.
          status: INITIAL_CONTENT_STATUS,
          reviewNote: null,
          approvedBy: null,
          approvedByName: null,
          approvedByEmail: null,
          approvedByRole: null,
          approvedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(glossaryTranslations.id, latest.id))
        .returning({ id: glossaryTranslations.id, version: glossaryTranslations.version, status: glossaryTranslations.status });
      row = { ...updated!, locale: input.locale };
    }

    if (hasAtLeastRole(editor.role, "admin")) {
      const published = await review(tx, key, row, "publish_directly", editor);
      return { key, version: row.version, status: published.status };
    }
    return { key, version: row.version, status: row.status };
  }

  app.post("/glossary", async (request, reply) => {
    const editor = app.requireRole(request, "teacher");
    const input = parseBody(createGlossaryTermSchema, request.body);

    const created = await db().transaction(async (tx) => {
      const [term] = await tx
        .insert(glossaryTerms)
        .values({ key: input.key, createdBy: editor.id })
        .onConflictDoNothing({ target: glossaryTerms.key })
        .returning({ id: glossaryTerms.id });
      if (!term) {
        throw new HttpError(409, "VALIDATION_FAILED", { key: ["duplicate"] });
      }
      return save(tx, editor, input.key, term.id, input);
    });
    return reply.code(201).send({ term: created });
  });

  app.put("/glossary/:key/translations", async (request) => {
    const editor = app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    const input = parseBody(upsertGlossaryTranslationSchema, request.body);

    return db().transaction(async (tx) => {
      const [term] = await tx.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.key, key)).limit(1);
      if (!term) throw notFound();
      return { term: await save(tx, editor, key, term.id, input) };
    });
  });

  app.post("/glossary/:key/review", async (request) => {
    const reviewer = app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    const input = parseBody(contentActionSchema, request.body);

    return db().transaction(async (tx) => {
      const [current] = await tx
        .select({ id: glossaryTranslations.id, version: glossaryTranslations.version, status: glossaryTranslations.status })
        .from(glossaryTranslations)
        .innerJoin(glossaryTerms, eq(glossaryTranslations.termId, glossaryTerms.id))
        .where(and(eq(glossaryTerms.key, key), eq(glossaryTranslations.locale, input.locale)))
        .orderBy(desc(glossaryTranslations.version))
        .limit(1);
      if (!current) throw notFound();
      const updated = await review(tx, key, { ...current, locale: input.locale }, input.action, reviewer, input.note);
      return { translation: updated, version: current.version };
    });
  });

  /** The review screen's data: the version under review, the live one to diff against, and the log. */
  app.get("/manage/glossary/:key/review", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    const { locale } = parseBody(localeQuery, request.query);
    reply.header("cache-control", "no-store");

    const versions = await db()
      .select({
        version: glossaryTranslations.version,
        title: glossaryTranslations.term,
        body: glossaryTranslations.definition,
        status: glossaryTranslations.status,
        reviewNote: glossaryTranslations.reviewNote,
        updatedAt: glossaryTranslations.updatedAt,
        ...approvalColumns,
      })
      .from(glossaryTranslations)
      .innerJoin(glossaryTerms, eq(glossaryTranslations.termId, glossaryTerms.id))
      .where(and(eq(glossaryTerms.key, key), eq(glossaryTranslations.locale, locale)))
      .orderBy(desc(glossaryTranslations.version));
    return reviewScreen("glossary_term", key, locale, versions);
  });

  app.delete("/glossary/:key", async (request, reply) => {
    app.requireRole(request, "admin");
    const { key } = parseBody(keyParams, request.params);
    const deleted = await db().delete(glossaryTerms).where(eq(glossaryTerms.key, key)).returning({ id: glossaryTerms.id });
    if (deleted.length === 0) throw notFound();
    return reply.code(204).send();
  });
};

type ReviewVersion = {
  version: number;
  title: string;
  body: string;
  status: typeof glossaryTranslations.$inferSelect.status;
  reviewNote: string | null;
  updatedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  approvedByRole: "student" | "teacher" | "admin" | null;
};

/** The shape the review screen reads for glossary terms and topic intros (a deleted approver is redacted). */
export async function reviewScreen(
  kind: "glossary_term" | "topic_intro",
  slug: string,
  locale: Locale,
  versions: ReviewVersion[],
) {
  const latest = versions[0];
  if (!latest) throw notFound();
  const live = versions.find((v) => v.status === "approved");

  const approval = (row: ReviewVersion) => ({
    at: row.approvedAt,
    role: row.approvedByRole,
    deleted: row.approvedBy === null,
    name: row.approvedBy === null ? null : row.approvedByName,
    email: row.approvedBy === null ? null : row.approvedByEmail,
  });

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
    .where(and(eq(contentReviewEvents.contentKind, kind), eq(contentReviewEvents.contentSlug, slug), eq(contentReviewEvents.locale, locale)))
    .orderBy(desc(contentReviewEvents.createdAt));

  return {
    latest: {
      version: latest.version,
      title: latest.title,
      body: latest.body,
      status: latest.status,
      reviewNote: latest.reviewNote,
      approval: latest.status === "approved" ? approval(latest) : null,
    },
    live: live && live.version !== latest.version ? { version: live.version, title: live.title, body: live.body, approval: approval(live) } : null,
    reviews: reviews.map(redactDeletedReviewer),
  };
}
