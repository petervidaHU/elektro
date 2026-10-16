import type { TopicId } from "../syllabus/topics.js";
import { templatesForTopic } from "./registry.js";
import type { Difficulty } from "./types.js";

/** Decision Q5: the student picks the length, 5 by default. */
export const SESSION_LENGTHS = [3, 5, 10] as const;

export type SessionLength = (typeof SESSION_LENGTHS)[number];

export const DEFAULT_SESSION_LENGTH: SessionLength = 5;

export interface PlannedTask {
  templateId: string;
  templateVersion: number;
  seed: number;
  difficulty: Difficulty;
}

/**
 * Difficulty ramps up across a session: the first ~20 % of tasks at 1, up to
 * ~60 % at 2, the rest at 3.
 */
export function difficultyRamp(count: number): Difficulty[] {
  const easy = Math.ceil(count * 0.2);
  const medium = Math.ceil(count * 0.6);
  return Array.from({ length: count }, (_, index) =>
    index < easy ? 1 : index < medium ? 2 : 3,
  );
}

/**
 * Plans a session for a topic. Seeds come from `nextSeed` (random on the
 * server, fixed in tests). If a topic lacks a template for a difficulty, the
 * nearest one is used.
 */
export function planSession(
  topicId: TopicId,
  count: number,
  nextSeed: () => number,
): PlannedTask[] {
  const templates = templatesForTopic(topicId);
  if (templates.length === 0) {
    throw new Error(`Topic ${topicId} has no practice templates`);
  }

  return difficultyRamp(count).map((difficulty) => {
    const nearest = [...templates].sort(
      (a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty),
    )[0]!;
    const candidates = templates.filter((template) => template.difficulty === nearest.difficulty);
    const seed = nextSeed() >>> 0;
    const template = candidates[seed % candidates.length]!;

    return {
      templateId: template.id,
      templateVersion: template.version,
      seed,
      difficulty: template.difficulty,
    };
  });
}
