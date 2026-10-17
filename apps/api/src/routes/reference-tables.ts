import type { FastifyPluginAsync } from "fastify";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  applyTableAction,
  ERROR_CODES,
  hasAtLeastRole,
  isVisibleTable,
  redactDeletedReviewer,
  referenceTableEditSchema,
  referenceTableInputSchema,
  snapshotReviewer,
  tableKeySchema,
  verifyTableSchema,
} from "@elektro/shared";
import { db } from "../db/index.js";
import {
  contentReviewEvents,
  referenceTables,
  referenceTableVersions,
} from "../db/schema/content.js";
import { forbidden, HttpError, notFound, parseBody } from "../lib/http-error.js";

const keyParams = z.object({ key: tableKeySchema });

/** The columns of a version a reader gets; the verifier's name only goes to staff. */
const versionColumns = {
  version: referenceTableVersions.version,
  title: referenceTableVersions.title,
  source: referenceTableVersions.source,
  columns: referenceTableVersions.columns,
  rows: referenceTableVersions.rows,
  status: referenceTableVersions.status,
  verifiedAt: referenceTableVersions.verifiedAt,
  verifiedBy: referenceTableVersions.verifiedBy,
  verifiedByName: referenceTableVersions.verifiedByName,
  verifiedByEmail: referenceTableVersions.verifiedByEmail,
  verifiedByRole: referenceTableVersions.verifiedByRole,
  updatedAt: referenceTableVersions.updatedAt,
};

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

/** Versions of one table, newest first. */
async function versionsOf(key: string) {
  return db()
    .select({ tableId: referenceTables.id, ...versionColumns })
    .from(referenceTableVersions)
    .innerJoin(referenceTables, eq(referenceTableVersions.tableId, referenceTables.id))
    .where(eq(referenceTables.key, key))
    .orderBy(desc(referenceTableVersions.version));
}

/** The verifier as the app shows it: a deleted account only by role (Q11). */
function verification(row: { verifiedAt: Date | null; verifiedBy: string | null; verifiedByName: string | null; verifiedByEmail: string | null; verifiedByRole: string | null }) {
  if (!row.verifiedAt) return null;
  const deleted = row.verifiedBy === null;
  return {
    at: row.verifiedAt,
    role: row.verifiedByRole,
    deleted,
    name: deleted ? null : row.verifiedByName,
    email: deleted ? null : row.verifiedByEmail,
  };
}

/**
 * Reference tables (plan §2.3, K8): standards and textbook values as data.
 * Teachers and admins create, edit and verify them; everybody else only ever
 * gets the live verified version.
 */
export const referenceTableRoutes: FastifyPluginAsync = async (app) => {
  /** Writes one row of the append-only log for a table action. */
  async function log(
    tx: Tx,
    entry: {
      key: string;
      tableVersionId: string;
      version: number;
      action: "create" | "verify" | "supersede";
      from: "unverified" | "verified";
      to: "unverified" | "verified" | "superseded";
      actor: { id: string; name: string; email: string; role: "student" | "teacher" | "admin" };
      note?: string | null;
    },
  ) {
    await tx.insert(contentReviewEvents).values({
      contentKind: "reference_table",
      contentSlug: entry.key,
      translationId: entry.tableVersionId,
      version: entry.version,
      // Tables are language-neutral; the log column needs a locale.
      locale: "hu",
      action: entry.action,
      fromStatus: entry.from,
      toStatus: entry.to,
      actorId: entry.actor.id,
      actorName: entry.actor.name,
      actorEmail: entry.actor.email,
      actorRole: entry.actor.role,
      note: entry.note ?? null,
      createdAt: sql`now()`,
    });
  }

  /** Staff list: every table with its newest version and the live verified one. */
  app.get("/reference-tables", async (request, reply) => {
    app.requireRole(request, "teacher");
    reply.header("cache-control", "no-store");

    const rows = await db()
      .select({
        key: referenceTables.key,
        version: referenceTableVersions.version,
        title: referenceTableVersions.title,
        source: referenceTableVersions.source,
        status: referenceTableVersions.status,
        verifiedAt: referenceTableVersions.verifiedAt,
        updatedAt: referenceTableVersions.updatedAt,
      })
      .from(referenceTableVersions)
      .innerJoin(referenceTables, eq(referenceTableVersions.tableId, referenceTables.id))
      .orderBy(referenceTables.key, desc(referenceTableVersions.version));

    const byKey = new Map<string, typeof rows>();
    for (const row of rows) byKey.set(row.key, [...(byKey.get(row.key) ?? []), row]);

    return {
      tables: [...byKey.entries()].map(([key, versions]) => ({
        key,
        latest: versions[0]!,
        liveVersion: versions.find((v) => v.status === "verified")?.version ?? null,
      })),
    };
  });

  app.post("/reference-tables", async (request, reply) => {
    const editor = app.requireRole(request, "teacher");
    const input = parseBody(referenceTableInputSchema, request.body);
    const signed = snapshotReviewer(editor);
    if (!signed.ok) {
      throw new HttpError(409, ERROR_CODES.REVIEWER_IDENTITY_INCOMPLETE);
    }

    const created = await db().transaction(async (tx) => {
      const [table] = await tx
        .insert(referenceTables)
        .values({ key: input.key, createdBy: editor.id })
        .onConflictDoNothing({ target: referenceTables.key })
        .returning({ id: referenceTables.id });
      if (!table) {
        throw new HttpError(409, ERROR_CODES.VALIDATION_FAILED, { key: ["duplicate"] });
      }
      const [version] = await tx
        .insert(referenceTableVersions)
        .values({
          tableId: table.id,
          version: 1,
          title: input.title,
          source: input.source,
          columns: input.columns,
          rows: input.rows,
          createdBy: editor.id,
        })
        .returning({ id: referenceTableVersions.id });
      await log(tx, {
        key: input.key,
        tableVersionId: version!.id,
        version: 1,
        action: "create",
        from: "unverified",
        to: "unverified",
        actor: { id: signed.snapshot.userId, name: signed.snapshot.name, email: signed.snapshot.email, role: signed.snapshot.role },
      });
      return { key: input.key, version: 1 };
    });

    return reply.code(201).send({ table: created });
  });

  /**
   * One table. Staff get the newest version (verified or not) and the live
   * one; everybody else gets the live verified version, or 404 while there is
   * none, so unverified values never reach a student.
   */
  app.get("/reference-tables/:key", async (request, reply) => {
    const { key } = parseBody(keyParams, request.params);
    const role = request.currentUser?.role ?? null;
    const versions = await versionsOf(key);
    reply.header("cache-control", "no-store");

    const live = versions.find((v) => v.status === "verified");
    const isStaff = role !== null && hasAtLeastRole(role, "teacher");
    const latest = versions[0];

    if (!isStaff) {
      if (!live || !isVisibleTable(live.status, role)) throw notFound();
      return {
        table: { key, version: live.version, title: live.title, source: live.source, columns: live.columns, rows: live.rows, status: live.status },
      };
    }
    if (!latest) throw notFound();

    const shape = (v: (typeof versions)[number]) => ({
      version: v.version,
      title: v.title,
      source: v.source,
      columns: v.columns,
      rows: v.rows,
      status: v.status,
      updatedAt: v.updatedAt,
      verification: verification(v),
    });
    return { table: { key, latest: shape(latest), live: live && live.version !== latest.version ? shape(live) : null } };
  });

  /**
   * Saves new content. An unverified newest version is edited in place; editing
   * a verified one creates the next version, and the verified one stays live
   * until the new version is verified.
   */
  app.put("/reference-tables/:key", async (request) => {
    const editor = app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    const input = parseBody(referenceTableEditSchema, request.body);
    const signed = snapshotReviewer(editor);
    if (!signed.ok) {
      throw new HttpError(409, ERROR_CODES.REVIEWER_IDENTITY_INCOMPLETE);
    }

    return db().transaction(async (tx) => {
      const [latest] = await tx
        .select({ tableId: referenceTables.id, id: referenceTableVersions.id, version: referenceTableVersions.version, status: referenceTableVersions.status })
        .from(referenceTableVersions)
        .innerJoin(referenceTables, eq(referenceTableVersions.tableId, referenceTables.id))
        .where(eq(referenceTables.key, key))
        .orderBy(desc(referenceTableVersions.version))
        .limit(1);
      if (!latest) throw notFound();

      const content = { title: input.title, source: input.source, columns: input.columns, rows: input.rows };

      if (latest.status === "unverified") {
        await tx
          .update(referenceTableVersions)
          .set({ ...content, updatedAt: new Date() })
          .where(eq(referenceTableVersions.id, latest.id));
        return { table: { key, version: latest.version } };
      }

      const version = latest.version + 1;
      const [created] = await tx
        .insert(referenceTableVersions)
        .values({ tableId: latest.tableId, version, ...content, createdBy: editor.id })
        .returning({ id: referenceTableVersions.id });
      await log(tx, {
        key,
        tableVersionId: created!.id,
        version,
        action: "create",
        from: "unverified",
        to: "unverified",
        actor: { id: signed.snapshot.userId, name: signed.snapshot.name, email: signed.snapshot.email, role: signed.snapshot.role },
      });
      return { table: { key, version } };
    });
  });

  /**
   * Verifies the given version after the teacher has compared it with the
   * cited source. Records who and when (snapshot + log); the previously live
   * version becomes superseded.
   */
  app.post("/reference-tables/:key/verify", async (request) => {
    const verifier = app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    const input = parseBody(verifyTableSchema, request.body);
    const signed = snapshotReviewer(verifier);
    if (!signed.ok) {
      throw signed.reason === "forbidden" ? forbidden() : new HttpError(409, ERROR_CODES.REVIEWER_IDENTITY_INCOMPLETE);
    }
    const actor = { id: signed.snapshot.userId, name: signed.snapshot.name, email: signed.snapshot.email, role: signed.snapshot.role };

    return db().transaction(async (tx) => {
      const versions = await tx
        .select({ id: referenceTableVersions.id, tableId: referenceTables.id, version: referenceTableVersions.version, status: referenceTableVersions.status })
        .from(referenceTableVersions)
        .innerJoin(referenceTables, eq(referenceTableVersions.tableId, referenceTables.id))
        .where(eq(referenceTables.key, key))
        .orderBy(desc(referenceTableVersions.version));

      const target = versions.find((v) => v.version === input.version);
      if (!target) throw notFound();

      const verify = applyTableAction(target.status, "verify", verifier.role);
      if (!verify.ok) {
        throw verify.reason === "forbidden" ? forbidden() : new HttpError(409, ERROR_CODES.INVALID_STATUS_TRANSITION);
      }

      const previous = versions.find((v) => v.status === "verified");
      if (previous) {
        const supersede = applyTableAction(previous.status, "supersede", verifier.role);
        if (supersede.ok) {
          await tx
            .update(referenceTableVersions)
            .set({ status: supersede.status, updatedAt: new Date() })
            .where(eq(referenceTableVersions.id, previous.id));
          await log(tx, { key, tableVersionId: previous.id, version: previous.version, action: "supersede", from: "verified", to: "superseded", actor });
        }
      }

      await tx
        .update(referenceTableVersions)
        .set({
          status: verify.status,
          verifiedBy: actor.id,
          verifiedByName: actor.name,
          verifiedByEmail: actor.email,
          verifiedByRole: actor.role,
          verifiedAt: sql`now()`,
          updatedAt: new Date(),
        })
        .where(and(eq(referenceTableVersions.id, target.id), eq(referenceTableVersions.status, "unverified")));
      await log(tx, { key, tableVersionId: target.id, version: target.version, action: "verify", from: "unverified", to: "verified", actor, note: input.note });

      return { table: { key, version: target.version, status: verify.status } };
    });
  });

  /** Admin housekeeping (and e2e cleanup): removes a table with all versions; the log stays. */
  app.delete("/reference-tables/:key", async (request, reply) => {
    app.requireRole(request, "admin");
    const { key } = parseBody(keyParams, request.params);
    const deleted = await db().delete(referenceTables).where(eq(referenceTables.key, key)).returning({ id: referenceTables.id });
    if (deleted.length === 0) throw notFound();
    return reply.code(204).send();
  });

  /** The verification history of a table; a deleted verifier appears by role only (Q11). */
  app.get("/reference-tables/:key/events", async (request, reply) => {
    app.requireRole(request, "teacher");
    const { key } = parseBody(keyParams, request.params);
    reply.header("cache-control", "no-store");

    const events = await db()
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
      .where(and(eq(contentReviewEvents.contentKind, "reference_table"), eq(contentReviewEvents.contentSlug, key)))
      .orderBy(desc(contentReviewEvents.createdAt));

    return { events: events.map(redactDeletedReviewer) };
  });
};
