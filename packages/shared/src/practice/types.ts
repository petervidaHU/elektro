import type { FormulaId } from "../calc/formulas.js";
import type { Unit } from "../calc/types.js";
import type { Locale } from "../locales.js";
import type { TopicId } from "../syllabus/topics.js";
import type { Rng } from "./rng.js";
import type { StepKind, Tolerance, Verdict } from "./tolerance.js";

/**
 * Known mistakes a wrong answer can be traced to. Each has an i18n message
 * (`misconception.<id>`) that tells the student what went wrong and why.
 */
export const MISCONCEPTION_IDS = [
  "resistance-inverted",
  "length-doubled-in-resistance",
  "phase-factor-missing",
  "phase-factor-wrong-system",
  "power-factor-ignored",
  "percent-as-fraction",
  "percent-not-divided",
  "wrong-reference-voltage",
  "limit-percent-used-as-volts",
  "chose-below-minimum",
] as const;

export type MisconceptionId = (typeof MISCONCEPTION_IDS)[number];

/** Task parameters: plain JSON, so they can be shown, stored and replayed. */
export type TaskParams = Record<string, number | string>;

/** The student's accepted values of earlier steps, by step id. */
export type PriorValues = Readonly<Record<string, number>>;

export type Difficulty = 1 | 2 | 3;

/** A value given in the task statement, e.g. I = 16 A. */
export interface Given {
  /** i18n `given.<id>`, and the interpolation name in the scenario text. */
  id: string;
  value: number;
  unit: Unit;
}

export interface StepOption {
  value: number;
  /** Language-neutral label, e.g. "√3"; defaults to the formatted value. */
  label?: string;
}

export interface MisconceptionCheck {
  id: MisconceptionId;
  /** The value this mistake produces, or null when it does not apply. */
  value: (params: TaskParams, prior: PriorValues) => number | null;
}

export interface StepSpec {
  /** Matches the engine's step id; i18n `calcStep.<id>`, `practiceHint.<id>`. */
  id: string;
  unit: Unit;
  kind: StepKind;
  formulaId: (params: TaskParams) => FormulaId;
  /** Overrides `DEFAULT_TOLERANCES[kind]` for this step. */
  tolerance?: Tolerance;
  /** Selection steps: the values to choose from. */
  options?: (params: TaskParams) => StepOption[];
  /**
   * The right answer, from the task and the student's own accepted earlier
   * answers (error carried forward). Must call the engine, never re-derive it.
   */
  expected: (params: TaskParams, prior: PriorValues) => number;
  /** Hint level 3: the formula with the numbers put in (language-neutral). */
  substitution: (params: TaskParams, prior: PriorValues, locale: Locale) => string;
  misconceptions?: MisconceptionCheck[];
}

export interface TaskTemplate {
  /** Stable id, e.g. "voltage-drop.single-phase-basic". */
  id: string;
  /** Bump when generate/steps change; attempts store it for replay. */
  version: number;
  topicId: TopicId;
  difficulty: Difficulty;
  /** i18n `practiceScenario.<key>`, interpolated with the formatted givens. */
  scenarioKey: (params: TaskParams) => string;
  generate: (rng: Rng) => TaskParams;
  givens: (params: TaskParams) => Given[];
  steps: StepSpec[];
}

export interface Task {
  template: TaskTemplate;
  params: TaskParams;
}

/** What the student did on one step; stored per attempt. */
export interface StepState {
  stepId: string;
  answers: number[];
  verdicts: Verdict[];
  misconceptions: (MisconceptionId | null)[];
  hintsUsed: number;
  solutionShown: boolean;
  /** The value later steps build on: the accepted answer or the revealed solution. */
  accepted: number | null;
}

export type TaskOutcome = "in_progress" | "unaided" | "with_help" | "solution_shown";

export type Hint =
  | { type: "text"; stepId: string }
  | { type: "formula"; formulaId: FormulaId }
  | { type: "substitution"; text: string };
