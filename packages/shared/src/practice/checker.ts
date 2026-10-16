import type { Locale } from "../locales.js";
import { TEMPLATES_BY_ID } from "./registry.js";
import { createRng } from "./rng.js";
import { allowedDeviation, compareAnswer, DEFAULT_TOLERANCES, type Tolerance, type Verdict } from "./tolerance.js";
import type {
  Hint,
  MisconceptionId,
  PriorValues,
  StepSpec,
  Task,
  TaskTemplate,
} from "./types.js";

/**
 * Checking a practice step (docs/DEVELOPMENT_PLAN.md §2.5). The API runs this
 * for every answer; the client never decides whether an answer is right.
 */

/** Hint levels: 1 concept text, 2 formula, 3 formula with the numbers in. */
export const MAX_HINT_LEVEL = 3;

/** After this many wrong tries the student may reveal the step's solution. */
export const WRONG_TRIES_BEFORE_SOLUTION = 2;

export function getTemplate(templateId: string): TaskTemplate {
  const template = TEMPLATES_BY_ID.get(templateId);
  if (!template) {
    throw new Error(`Unknown practice template: ${templateId}`);
  }
  return template;
}

/** Rebuilds a task from its template and seed - same numbers every time. */
export function buildTask(templateId: string, seed: number): Task {
  const template = getTemplate(templateId);
  return { template, params: template.generate(createRng(seed)) };
}

function stepAt(task: Task, stepIndex: number): StepSpec {
  const spec = task.template.steps[stepIndex];
  if (!spec) {
    throw new Error(`Task ${task.template.id} has no step ${stepIndex}`);
  }
  return spec;
}

export function stepTolerance(spec: StepSpec): Tolerance {
  return spec.tolerance ?? DEFAULT_TOLERANCES[spec.kind];
}

/** The right answer, built on the student's own accepted earlier answers. */
export function expectedFor(task: Task, stepIndex: number, prior: PriorValues): number {
  return stepAt(task, stepIndex).expected(task.params, prior);
}

/**
 * The known mistakes that apply to this step, with the value each produces.
 * A mistake whose value is too close to the right answer is left out - it
 * could not be told apart from a slightly-off correct answer.
 */
export function misconceptionCandidates(
  task: Task,
  stepIndex: number,
  prior: PriorValues,
): { id: MisconceptionId; value: number }[] {
  const spec = stepAt(task, stepIndex);
  const expected = spec.expected(task.params, prior);
  const distinctBeyond = 3 * allowedDeviation(expected, stepTolerance(spec));

  return (spec.misconceptions ?? []).flatMap((misconception) => {
    const value = misconception.value(task.params, prior);
    return value !== null && Number.isFinite(value) && Math.abs(value - expected) > distinctBeyond
      ? [{ id: misconception.id, value }]
      : [];
  });
}

export function evaluateStep(
  task: Task,
  stepIndex: number,
  prior: PriorValues,
  answer: number,
): { verdict: Verdict; misconceptionId?: MisconceptionId } {
  const spec = stepAt(task, stepIndex);
  const tolerance = stepTolerance(spec);
  const verdict = compareAnswer(expectedFor(task, stepIndex, prior), answer, tolerance);

  if (verdict !== "incorrect") {
    return { verdict };
  }

  const match = misconceptionCandidates(task, stepIndex, prior).find(
    ({ value }) => compareAnswer(value, answer, tolerance) === "correct",
  );
  return match ? { verdict, misconceptionId: match.id } : { verdict };
}

export function hintFor(
  task: Task,
  stepIndex: number,
  level: number,
  prior: PriorValues,
  locale: Locale,
): Hint {
  const spec = stepAt(task, stepIndex);
  switch (Math.min(Math.max(level, 1), MAX_HINT_LEVEL)) {
    case 1:
      return { type: "text", stepId: spec.id };
    case 2:
      return { type: "formula", formulaId: spec.formulaId(task.params) };
    default:
      return { type: "substitution", text: spec.substitution(task.params, prior, locale) };
  }
}
