import { z } from "zod";
import { CALCULATOR_IDS } from "../calc/catalogue.js";
import { localeSchema, slugSchema, topicIdSchema } from "./content.js";

/**
 * Inputs of the content-management page (plan §3.3 `/teacher/content`, Q21):
 * lessons and calculators listed in detail, created, edited, ordered, removed.
 */

/** Moves a lesson to another topic (it goes to the end of that topic). */
export const updateLessonSchema = z.object({ topicId: topicIdSchema });

/** The full new order of the (not archived) lessons of one topic. */
export const reorderLessonsSchema = z.object({
  topicId: topicIdSchema,
  slugs: z.array(slugSchema).min(1).max(500),
});

export const calculatorIdSchema = z.enum(CALCULATOR_IDS);

/** Registry fields of a calculator plus its texts in one locale. */
export const calculatorInputSchema = z.object({
  topicId: topicIdSchema,
  published: z.boolean(),
  locale: localeSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
});

/** Adds a calculator implemented in code to the list. */
export const createCalculatorSchema = calculatorInputSchema.extend({ id: calculatorIdSchema });

/** The full new order of all listed calculators. */
export const reorderCalculatorsSchema = z.object({
  ids: z.array(calculatorIdSchema).min(1).max(200),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;
export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type CreateCalculatorInput = z.infer<typeof createCalculatorSchema>;
