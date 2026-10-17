import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  CALCULATOR_IDS,
  calculatorInputSchema,
  createCalculatorSchema,
  ERROR_CODES,
  getCalculatorDefinition,
  hasAtLeastRole,
  isCalculatorId,
  isReorderOf,
  localeSchema,
  reorderCalculatorsSchema,
  topicIdSchema,
  type CalculatorId,
  type CalculatorInput,
  type Locale,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { calculators, calculatorTranslations } from "../db/schema/content.js";
import { HttpError, notFound, parseBody } from "../lib/http-error.js";

const listQuerySchema = z.object({ locale: localeSchema, topicId: topicIdSchema.optional() });
const localeQuerySchema = z.object({ locale: localeSchema });
const idParamsSchema = z.object({ id: z.string().min(1) });

/** A calculator id from the URL, or 404 when no such calculator is implemented. */
function calculatorIdParam(params: unknown): CalculatorId {
  const { id } = parseBody(idParamsSchema, params);
  if (!isCalculatorId(id)) {
    throw notFound();
  }
  return id;
}

function isManager(request: FastifyRequest): boolean {
  const user = request.currentUser;
  return user !== null && hasAtLeastRole(user.role, "teacher");
}

/** Registry rows with their texts in `locale`, in list order. */
async function listCalculators(locale: Locale) {
  const rows = await db()
    .select({
      id: calculators.id,
      topicId: calculators.topicId,
      position: calculators.position,
      published: calculators.published,
      updatedAt: calculators.updatedAt,
      title: calculatorTranslations.title,
      description: calculatorTranslations.description,
    })
    .from(calculators)
    .leftJoin(
      calculatorTranslations,
      and(
        eq(calculatorTranslations.calculatorId, calculators.id),
        eq(calculatorTranslations.locale, locale),
      ),
    )
    .orderBy(asc(calculators.position), asc(calculators.id));

  return rows.map((row) => ({ ...row, path: getCalculatorDefinition(row.id).path }));
}

/**
 * The calculator registry (plan §2.2, Q21). Calculators are code; this lists
 * them. Students and guests see published calculators that have a text in
 * their locale. Teachers and admins manage the list; removing a calculator
 * from it is admin-only.
 */
export const calculatorRoutes: FastifyPluginAsync = async (app) => {
  app.get("/calculators", async (request) => {
    const query = parseBody(listQuerySchema, request.query);
    const rows = await listCalculators(query.locale);

    return {
      calculators: rows.filter(
        (row) =>
          row.published &&
          row.title !== null &&
          (query.topicId === undefined || row.topicId === query.topicId),
      ),
    };
  });

  /** One calculator; unpublished ones only for teachers and admins (preview). */
  app.get("/calculators/:id", async (request) => {
    const id = calculatorIdParam(request.params);
    const query = parseBody(localeQuerySchema, request.query);
    const row = (await listCalculators(query.locale)).find((item) => item.id === id);

    if (!row || ((!row.published || row.title === null) && !isManager(request))) {
      throw notFound();
    }
    return { calculator: row };
  });

  /** The full list for the content-management page, plus what can still be added. */
  app.get("/manage/calculators", async (request) => {
    app.requireRole(request, "teacher");
    const query = parseBody(localeQuerySchema, request.query);
    const rows = await listCalculators(query.locale);
    const listed = new Set(rows.map((row) => row.id));

    return {
      calculators: rows,
      available: CALCULATOR_IDS.filter((id) => !listed.has(id)).map((id) =>
        getCalculatorDefinition(id),
      ),
    };
  });

  async function saveTranslation(
    tx: Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0],
    id: CalculatorId,
    input: CalculatorInput,
  ) {
    await tx
      .insert(calculatorTranslations)
      .values({
        calculatorId: id,
        locale: input.locale,
        title: input.title,
        description: input.description,
      })
      .onConflictDoUpdate({
        target: [calculatorTranslations.calculatorId, calculatorTranslations.locale],
        set: { title: input.title, description: input.description, updatedAt: new Date() },
      });
  }

  /** Adds a calculator implemented in code to the end of the list. */
  app.post("/calculators", async (request, reply) => {
    const editor = app.requireRole(request, "teacher");
    const input = parseBody(createCalculatorSchema, request.body);

    await db().transaction(async (tx) => {
      const [created] = await tx
        .insert(calculators)
        .values({
          id: input.id,
          topicId: input.topicId,
          published: input.published,
          position: sql`(SELECT COALESCE(MAX(${calculators.position}) + 1, 0) FROM ${calculators})`,
          updatedBy: editor.id,
        })
        .onConflictDoNothing({ target: calculators.id })
        .returning({ id: calculators.id });

      if (!created) {
        throw new HttpError(409, ERROR_CODES.VALIDATION_FAILED, { id: ["duplicate"] });
      }
      await saveTranslation(tx, input.id, input);
    });

    return reply.code(201).send({ calculator: { id: input.id } });
  });

  /** The full new order of all listed calculators. */
  app.put("/calculators/order", async (request) => {
    app.requireRole(request, "teacher");
    const input = parseBody(reorderCalculatorsSchema, request.body);

    await db().transaction(async (tx) => {
      const rows = await tx.select({ id: calculators.id }).from(calculators);
      if (!isReorderOf(rows.map((row) => row.id), input.ids)) {
        throw new HttpError(409, ERROR_CODES.VALIDATION_FAILED, { ids: ["stale_order"] });
      }
      for (const [position, id] of input.ids.entries()) {
        await tx.update(calculators).set({ position }).where(eq(calculators.id, id));
      }
    });

    return { ids: input.ids };
  });

  app.put("/calculators/:id", async (request) => {
    const editor = app.requireRole(request, "teacher");
    const id = calculatorIdParam(request.params);
    const input = parseBody(calculatorInputSchema, request.body);

    await db().transaction(async (tx) => {
      const [updated] = await tx
        .update(calculators)
        .set({
          topicId: input.topicId,
          published: input.published,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(calculators.id, id))
        .returning({ id: calculators.id });

      if (!updated) {
        throw notFound();
      }
      await saveTranslation(tx, id, input);
    });

    return { calculator: { id } };
  });

  /** Takes a calculator off the list (the code stays; it can be added again). */
  app.delete("/calculators/:id", async (request, reply) => {
    app.requireRole(request, "admin");
    const id = calculatorIdParam(request.params);

    const deleted = await db()
      .delete(calculators)
      .where(eq(calculators.id, id))
      .returning({ id: calculators.id });

    if (deleted.length === 0) {
      throw notFound();
    }
    return reply.code(204).send();
  });
};
