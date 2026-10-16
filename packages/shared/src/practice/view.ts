import type { FormulaId } from "../calc/formulas.js";
import type { Unit } from "../calc/types.js";
import type { Locale } from "../locales.js";
import type { TopicId } from "../syllabus/topics.js";
import { currentStepIndex, initialSteps, priorValues, wrongTries } from "./attempt.js";
import { buildTask, hintFor, stepTolerance, WRONG_TRIES_BEFORE_SOLUTION } from "./checker.js";
import { taskOutcome, type MasteryLevel } from "./mastery.js";
import type { PlannedTask } from "./session.js";
import type { StepKind, Tolerance } from "./tolerance.js";
import type {
  Difficulty,
  Given,
  Hint,
  MisconceptionId,
  StepOption,
  StepState,
  TaskOutcome,
  TaskParams,
} from "./types.js";

/**
 * What the API returns for a practice session and its summary, built from the
 * stored records. The web renders these; it never computes a verdict itself.
 */
export type SessionStatus = "active" | "finished" | "abandoned";

export interface SessionRecord {
  id: string;
  topicId: TopicId;
  taskCount: number;
  status: SessionStatus;
  tasks: PlannedTask[];
  masteryAtStart: MasteryLevel;
}

export interface AttemptRecord {
  taskIndex: number;
  steps: StepState[];
}

export interface StepView {
  id: string;
  unit: Unit;
  kind: StepKind;
  formulaId: FormulaId;
  tolerance: Tolerance;
  options: StepOption[] | null;
  state: StepState;
  /** Hints taken so far, in order (level 1..hintsUsed). */
  hints: Hint[];
  /** The revealed answer, once the student asked for it. */
  solution: number | null;
  canRevealSolution: boolean;
  /** An earlier step is not done yet. */
  locked: boolean;
}

export interface TaskView {
  index: number;
  templateId: string;
  templateVersion: number;
  seed: number;
  difficulty: Difficulty;
  scenarioKey: string;
  params: TaskParams;
  givens: Given[];
  steps: StepView[];
  outcome: TaskOutcome;
}

export interface SessionView {
  id: string;
  topicId: TopicId;
  status: SessionStatus;
  taskCount: number;
  /** First unfinished task, or -1 when every task is done. */
  currentTaskIndex: number;
  tasks: { index: number; difficulty: Difficulty; outcome: TaskOutcome }[];
  current: TaskView | null;
}

function stepsOf(planned: PlannedTask, attempt: AttemptRecord | undefined): StepState[] {
  return attempt?.steps ?? initialSteps(buildTask(planned.templateId, planned.seed).template);
}

export function buildTaskView(
  planned: PlannedTask,
  index: number,
  attempt: AttemptRecord | undefined,
  locale: Locale,
): TaskView {
  const task = buildTask(planned.templateId, planned.seed);
  const states = stepsOf(planned, attempt);
  const current = currentStepIndex(states);

  return {
    index,
    templateId: planned.templateId,
    templateVersion: planned.templateVersion,
    seed: planned.seed,
    difficulty: planned.difficulty,
    scenarioKey: task.template.scenarioKey(task.params),
    params: task.params,
    givens: task.template.givens(task.params),
    outcome: taskOutcome(states, task.template.steps.length),
    steps: task.template.steps.map((spec, stepIndex) => {
      const state = states[stepIndex]!;
      const prior = priorValues(states.slice(0, stepIndex));
      return {
        id: spec.id,
        unit: spec.unit,
        kind: spec.kind,
        formulaId: spec.formulaId(task.params),
        tolerance: stepTolerance(spec),
        options: spec.options?.(task.params) ?? null,
        state,
        hints: Array.from({ length: state.hintsUsed }, (_, level) =>
          hintFor(task, stepIndex, level + 1, prior, locale),
        ),
        solution: state.solutionShown ? state.accepted : null,
        canRevealSolution:
          state.accepted === null && wrongTries(state) >= WRONG_TRIES_BEFORE_SOLUTION,
        locked: current !== -1 && stepIndex > current,
      };
    }),
  };
}

export function buildSessionView(
  session: SessionRecord,
  attempts: readonly AttemptRecord[],
  locale: Locale,
): SessionView {
  const byIndex = new Map(attempts.map((attempt) => [attempt.taskIndex, attempt]));
  const tasks = session.tasks.map((planned, index) => {
    const template = buildTask(planned.templateId, planned.seed).template;
    return {
      index,
      difficulty: planned.difficulty,
      outcome: taskOutcome(stepsOf(planned, byIndex.get(index)), template.steps.length),
    };
  });
  const currentTaskIndex = tasks.findIndex((task) => task.outcome === "in_progress");
  const currentPlanned = currentTaskIndex === -1 ? undefined : session.tasks[currentTaskIndex];

  return {
    id: session.id,
    topicId: session.topicId,
    status: session.status,
    taskCount: session.taskCount,
    currentTaskIndex,
    tasks,
    current: currentPlanned
      ? buildTaskView(currentPlanned, currentTaskIndex, byIndex.get(currentTaskIndex), locale)
      : null,
  };
}

export interface SessionSummary {
  id: string;
  topicId: TopicId;
  status: SessionStatus;
  taskCount: number;
  unaided: number;
  withHelp: number;
  solutionShown: number;
  tasks: {
    index: number;
    templateId: string;
    difficulty: Difficulty;
    outcome: TaskOutcome;
    wrongTries: number;
    hintsUsed: number;
  }[];
  /** Known mistakes seen in this session, most frequent first. */
  misconceptions: { id: MisconceptionId; count: number }[];
  masteryBefore: MasteryLevel;
  masteryAfter: MasteryLevel;
}

export function summarizeSession(
  session: SessionRecord,
  attempts: readonly AttemptRecord[],
  masteryAfter: MasteryLevel,
): SessionSummary {
  const byIndex = new Map(attempts.map((attempt) => [attempt.taskIndex, attempt]));
  const counts = new Map<MisconceptionId, number>();

  const tasks = session.tasks.map((planned, index) => {
    const steps = stepsOf(planned, byIndex.get(index));
    for (const step of steps) {
      for (const id of step.misconceptions) {
        if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return {
      index,
      templateId: planned.templateId,
      difficulty: planned.difficulty,
      outcome: taskOutcome(steps, buildTask(planned.templateId, planned.seed).template.steps.length),
      wrongTries: steps.reduce((sum, step) => sum + wrongTries(step), 0),
      hintsUsed: steps.reduce((sum, step) => sum + step.hintsUsed, 0),
    };
  });

  const count = (outcome: TaskOutcome) => tasks.filter((task) => task.outcome === outcome).length;

  return {
    id: session.id,
    topicId: session.topicId,
    status: session.status,
    taskCount: session.taskCount,
    unaided: count("unaided"),
    withHelp: count("with_help"),
    solutionShown: count("solution_shown"),
    tasks,
    misconceptions: [...counts.entries()]
      .map(([id, n]) => ({ id, count: n }))
      .sort((a, b) => b.count - a.count),
    masteryBefore: session.masteryAtStart,
    masteryAfter,
  };
}
