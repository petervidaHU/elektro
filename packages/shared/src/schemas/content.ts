import { z } from "zod";
import { CONTENT_ACTIONS } from "../content/status.js";
import { LOCALES } from "../locales.js";
import { TOPIC_IDS } from "../syllabus/topics.js";

export const localeSchema = z.enum(LOCALES);
export const topicIdSchema = z.enum(TOPIC_IDS);

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug");

/** Language-neutral lesson row. */
export const createLessonSchema = z.object({
  topicId: topicIdSchema,
  slug: slugSchema,
  /** Order of the lesson within its topic (ascending). */
  position: z.number().int().min(0).max(10_000).default(0),
});

/**
 * Per-locale translation of one lesson version. Editing an approved
 * translation creates a new version server-side; the client never sets a
 * version or a status directly.
 */
export const upsertLessonTranslationSchema = z.object({
  locale: localeSchema,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).optional(),
  body: z.string().min(1),
});

export const contentActionSchema = z.object({
  action: z.enum(CONTENT_ACTIONS),
  locale: localeSchema,
  /** Reviewer note, shown with `changes_requested`. */
  note: z.string().trim().max(2000).optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpsertLessonTranslationInput = z.infer<typeof upsertLessonTranslationSchema>;
export type ContentActionInput = z.infer<typeof contentActionSchema>;
