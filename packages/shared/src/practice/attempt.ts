import { ERROR_CODES } from "../errors.js";
import { evaluateStep, expectedFor, MAX_HINT_LEVEL, WRONG_TRIES_BEFORE_SOLUTION } from "./checker.js";
import type { MisconceptionId, PriorValues, StepState, Task, TaskTemplate } from "./types.js";
import type { Verdict } from "./tolerance.js";

/**
 * The state of one task attempt and its transitions (plan §2.5, guided and
 * forgiving): steps are answered in order, retries are unlimited, up to three
 * hints per step, and the solution can be revealed after two wrong tries.
 * Pure functions - the API persists what they return.
 */
export type AttemptError =
  | typeof ERROR_CODES.PRACTICE_STEP_LOCKED
  | typeof ERROR_CODES.PRACTICE_STEP_DONE
  | typeof ERROR_CODES.PRACTICE_SOLUTION_LOCKED
  | typeof ERROR_CODES.PRACTICE_NO_MORE_HINTS
  | typeof ERROR_CODES.VALIDATION_FAILED;

type Transition<T = object> = ({ ok: true; steps: StepState[] } & T) | { ok: false; error: AttemptError };

export function initialSteps(template: TaskTemplate): StepState[] {
  return template.steps.map((spec) => ({
    stepId: spec.id,
    answers: [],
    verdicts: [],
    misconceptions: [],
    hintsUsed: 0,
    solutionShown: false,
    accepted: null,
  }));
}

/** The accepted values of resolved steps - what later steps build on. */
export function priorValues(steps: readonly StepState[]): Record<string, number> {
  const values: Record<string, number> = {};
  for (const step of steps) {
    if (step.accepted !== null) {
      values[step.stepId] = step.accepted;
    }
  }
  return values;
}

/** Index of the first unresolved step, or -1 when the task is done. */
export function currentStepIndex(steps: readonly StepState[]): number {
  return steps.findIndex((step) => step.accepted === null);
}

export function wrongTries(step: StepState): number {
  return step.verdicts.filter((verdict) => verdict === "incorrect").length;
}

/** Finds the step and checks it is the one to work on now. */
function openStep(
  steps: readonly StepState[],
  stepId: string,
): { index: number; prior: PriorValues } | { error: AttemptError } {
  const index = steps.findIndex((step) => step.stepId === stepId);
  if (index === -1) {
    return { error: ERROR_CODES.VALIDATION_FAILED };
  }
  if (steps[index]!.accepted !== null) {
    return { error: ERROR_CODES.PRACTICE_STEP_DONE };
  }
  if (index !== currentStepIndex(steps)) {
    return { error: ERROR_CODES.PRACTICE_STEP_LOCKED };
  }
  return { index, prior: priorValues(steps.slice(0, index)) };
}

function replaceStep(steps: readonly StepState[], index: number, next: StepState): StepState[] {
  return steps.map((step, i) => (i === index ? next : step));
}

export function submitAnswer(
  task: Task,
  steps: readonly StepState[],
  stepId: string,
  answer: number,
): Transition<{ result: { verdict: Verdict; misconceptionId?: MisconceptionId } }> {
  const open = openStep(steps, stepId);
  if ("error" in open) {
    return { ok: false, error: open.error };
  }

  const spec = task.template.steps[open.index]!;
  if (spec.options && !spec.options(task.params).some((option) => option.value === answer)) {
    return { ok: false, error: ERROR_CODES.VALIDATION_FAILED };
  }

  const result = evaluateStep(task, open.index, open.prior, answer);
  const step = steps[open.index]!;

  return {
    ok: true,
    result,
    steps: replaceStep(steps, open.index, {
      ...step,
      answers: [...step.answers, answer],
      verdicts: [...step.verdicts, result.verdict],
      misconceptions: [...step.misconceptions, result.misconceptionId ?? null],
      accepted: result.verdict === "correct" ? answer : null,
    }),
  };
}

export function takeHint(_task: Task, steps: readonly StepState[], stepId: string): Transition {
  const open = openStep(steps, stepId);
  if ("error" in open) {
    return { ok: false, error: open.error };
  }
  const step = steps[open.index]!;
  if (step.hintsUsed >= MAX_HINT_LEVEL) {
    return { ok: false, error: ERROR_CODES.PRACTICE_NO_MORE_HINTS };
  }
  return { ok: true, steps: replaceStep(steps, open.index, { ...step, hintsUsed: step.hintsUsed + 1 }) };
}

/** Reveals the step's answer after two wrong tries; later steps build on it. */
export function revealSolution(task: Task, steps: readonly StepState[], stepId: string): Transition {
  const open = openStep(steps, stepId);
  if ("error" in open) {
    return { ok: false, error: open.error };
  }
  const step = steps[open.index]!;
  if (wrongTries(step) < WRONG_TRIES_BEFORE_SOLUTION) {
    return { ok: false, error: ERROR_CODES.PRACTICE_SOLUTION_LOCKED };
  }
  return {
    ok: true,
    steps: replaceStep(steps, open.index, {
      ...step,
      solutionShown: true,
      accepted: expectedFor(task, open.index, open.prior),
    }),
  };
}
