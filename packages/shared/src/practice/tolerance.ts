/**
 * How close an answer must be (docs/DEVELOPMENT_PLAN.md §2.5, decision Q4).
 * One module, so the defaults can later come from an admin setting without
 * touching the templates. The UI shows the tolerance under every answer.
 */
export type StepKind = "intermediate" | "final" | "percent" | "selection";

export interface Tolerance {
  /** Fraction of the expected value, e.g. 0.01 = ±1 %. */
  relative?: number;
  /** In the step's own unit, e.g. 0.05 percentage points. */
  absolute?: number;
}

export const DEFAULT_TOLERANCES: Record<StepKind, Tolerance> = {
  // 3 significant figures of a hand calculation.
  final: { relative: 0.01 },
  // Absorbs the student's own rounding of earlier steps.
  intermediate: { relative: 0.02 },
  // A relative tolerance on a small percentage would be too strict.
  percent: { absolute: 0.05 },
  // A choice from a list, not a number.
  selection: { absolute: 0 },
};

export type Verdict = "correct" | "close" | "incorrect";

/** Answers within this many tolerances count as "close": round more precisely. */
const CLOSE_FACTOR = 3;

/** Float noise allowance for exact comparisons (selections). */
const EPSILON = 1e-9;

export function allowedDeviation(expected: number, tolerance: Tolerance): number {
  return Math.max(
    (tolerance.relative ?? 0) * Math.abs(expected),
    tolerance.absolute ?? 0,
  );
}

export function compareAnswer(expected: number, answer: number, tolerance: Tolerance): Verdict {
  if (!Number.isFinite(answer)) {
    return "incorrect";
  }
  const deviation = Math.abs(answer - expected);
  const allowed = allowedDeviation(expected, tolerance);

  if (deviation <= allowed + EPSILON) {
    return "correct";
  }
  if (allowed > 0 && deviation <= CLOSE_FACTOR * allowed) {
    return "close";
  }
  return "incorrect";
}
