import { z } from "zod";
import { DEFAULT_SESSION_LENGTH, SESSION_LENGTHS } from "../practice/session.js";
import { localeSchema, topicIdSchema } from "./content.js";

/** Starts a practice session for a topic (plan decision Q5: 3, 5 or 10 tasks). */
export const startPracticeSessionSchema = z.object({
  topicId: topicIdSchema,
  taskCount: z
    .union(SESSION_LENGTHS.map((length) => z.literal(length)) as [z.ZodLiteral<3>, z.ZodLiteral<5>, z.ZodLiteral<10>])
    .default(DEFAULT_SESSION_LENGTH),
});

/** Addresses one step of one task in a session. */
export const practiceStepSchema = z.object({
  taskIndex: z.number().int().min(0).max(100),
  stepId: z.string().min(1).max(80),
  locale: localeSchema.default("hu"),
});

/** The student's answer: a plain number in the step's unit (never a verdict). */
export const practiceAnswerSchema = practiceStepSchema.extend({
  answer: z.number().finite().gt(-1e9).lt(1e9),
});

export type StartPracticeSessionInput = z.infer<typeof startPracticeSessionSchema>;
export type PracticeStepInput = z.infer<typeof practiceStepSchema>;
export type PracticeAnswerInput = z.infer<typeof practiceAnswerSchema>;
