import { z } from "zod";
import { localeSchema } from "./content.js";

/** "Hibát találtam" (plan §3.4 J9): what the reader can report on. */
export const REPORT_TARGET_KINDS = ["lesson", "calculator", "practice_task"] as const;
export const REPORT_CATEGORIES = ["wrong_value", "unclear_text", "typo", "other"] as const;
export const REPORT_STATUSES = ["open"] as const;

export type ReportTargetKind = (typeof REPORT_TARGET_KINDS)[number];
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const createReportSchema = z.object({
  targetKind: z.enum(REPORT_TARGET_KINDS),
  /** Lesson slug, calculator id, or practice template id. */
  targetId: z.string().trim().min(1).max(200),
  /** Lesson version or template version the reader saw. */
  targetVersion: z.number().int().min(0).max(100_000).optional(),
  category: z.enum(REPORT_CATEGORIES),
  note: z.string().trim().max(1000).optional(),
  locale: localeSchema,
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
