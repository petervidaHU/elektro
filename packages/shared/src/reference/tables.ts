import { z } from "zod";
import { UNITS } from "../calc/types.js";
import { hasAtLeastRole, type Role } from "../roles.js";

/**
 * Reference tables (plan §2.3, K8): values from standards or textbooks are
 * data with a source and a verification status, never code constants. The
 * engine receives table values as explicit inputs; students only ever see
 * `verified` tables, and only the excerpt a task needs.
 */
export const TABLE_STATUSES = ["unverified", "verified", "superseded"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];

export const TABLE_ACTIONS = ["verify", "supersede"] as const;
export type TableAction = (typeof TABLE_ACTIONS)[number];

/** Any teacher may verify (Q15). */
export const TABLE_VERIFIER_MIN_ROLE: Role = "teacher";

export type TableCell = number | string;

export const tableColumnSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-zA-Z0-9]*$/, "column id"),
  label: z.string().trim().min(1).max(120),
  unit: z.enum(UNITS).optional(),
});

const cellSchema = z.union([z.number().refine(Number.isFinite, "finite"), z.string().trim().max(200)]);

const MAX_COLUMNS = 12;
const MAX_ROWS = 200;

export const tableKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "key");

/** The versioned content of a table: its columns and rows. */
export const referenceTableContentSchema = z
  .object({
    columns: z.array(tableColumnSchema).min(1).max(MAX_COLUMNS),
    rows: z.array(z.array(cellSchema)).min(1).max(MAX_ROWS),
  })
  .superRefine((value, ctx) => {
    const ids = value.columns.map((column) => column.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: ["columns"], message: "duplicate_column" });
    }
    value.rows.forEach((row, index) => {
      if (row.length !== value.columns.length) {
        ctx.addIssue({ code: "custom", path: ["rows", index], message: "row_length" });
      }
    });
  });

/** Body of create / edit: a source is mandatory, so no value is stored without one. */
export const referenceTableInputSchema = z
  .object({
    key: tableKeySchema,
    title: z.string().trim().min(1).max(200),
    /** The standard or textbook, edition, table or page. */
    source: z.string().trim().min(1).max(500),
  })
  .and(referenceTableContentSchema);

export const referenceTableEditSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    source: z.string().trim().min(1).max(500),
  })
  .and(referenceTableContentSchema);

export const verifyTableSchema = z.object({
  /** The version being verified; stops a verify of text that changed meanwhile. */
  version: z.number().int().min(1),
  note: z.string().trim().max(1000).optional(),
});

export type ReferenceTableContent = z.infer<typeof referenceTableContentSchema>;
export type ReferenceTableInput = z.infer<typeof referenceTableInputSchema>;

export type TableTransition =
  | { ok: true; status: TableStatus }
  | { ok: false; reason: "invalid_transition" | "forbidden" };

const TRANSITIONS: Record<TableAction, { from: TableStatus; to: TableStatus }> = {
  verify: { from: "unverified", to: "verified" },
  supersede: { from: "verified", to: "superseded" },
};

/** Pure state-machine step; the API persists the result and the verifier snapshot. */
export function applyTableAction(status: TableStatus, action: TableAction, role: Role): TableTransition {
  if (!hasAtLeastRole(role, TABLE_VERIFIER_MIN_ROLE)) {
    return { ok: false, reason: "forbidden" };
  }
  const rule = TRANSITIONS[action];
  return rule.from === status ? { ok: true, status: rule.to } : { ok: false, reason: "invalid_transition" };
}

/**
 * Students (and guests) only get verified tables; teachers and admins also see
 * unverified ones, to check and preview them. A superseded version is nobody's.
 */
export function isVisibleTable(status: TableStatus, role: Role | null): boolean {
  if (status === "verified") return true;
  return status === "unverified" && role !== null && hasAtLeastRole(role, TABLE_VERIFIER_MIN_ROLE);
}

/** The few rows a task shows ("Kivonat a táblázatból"), in table order; never the whole table by default. */
export function excerptRows(
  content: ReferenceTableContent,
  rowIndexes: readonly number[],
): ReferenceTableContent {
  const wanted = new Set(rowIndexes);
  return { columns: content.columns, rows: content.rows.filter((_row, index) => wanted.has(index)) };
}
