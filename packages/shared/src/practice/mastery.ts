import type { Difficulty, StepState, TaskOutcome } from "./types.js";

/**
 * Progress rules (docs/DEVELOPMENT_PLAN.md §3.6). Thresholds are constants so
 * they can later become admin settings.
 */
export const MASTERY_LEVELS = ["none", "started", "practising", "mastered"] as const;

export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

/** Mastered: at least this many unaided among the last `MASTERY_WINDOW` harder tasks. */
export const MASTERY_REQUIRED_UNAIDED = 3;
export const MASTERY_WINDOW = 5;
export const MASTERY_MIN_DIFFICULTY: Difficulty = 2;

/** Struggling: under this unaided share over the last 10 tasks, with enough tasks. */
export const STRUGGLING_RATE = 0.4;
export const STRUGGLING_MIN_TASKS = 5;
export const RATE_WINDOW = 10;

export interface CompletedTask {
  difficulty: Difficulty;
  outcome: Exclude<TaskOutcome, "in_progress">;
}

/**
 * The result of one task: unaided (no hints, no revealed solution - wrong
 * tries are fine), with help, or with a revealed solution.
 */
export function taskOutcome(steps: readonly StepState[], totalSteps: number): TaskOutcome {
  if (steps.length < totalSteps || steps.some((step) => step.accepted === null)) {
    return "in_progress";
  }
  if (steps.some((step) => step.solutionShown)) {
    return "solution_shown";
  }
  if (steps.some((step) => step.hintsUsed > 0)) {
    return "with_help";
  }
  return "unaided";
}

export interface TopicActivity {
  /** Lessons of the topic a student can read (approved). */
  lessonsTotal: number;
  lessonsOpened: number;
  lessonsCompleted: number;
  hasPractice: boolean;
  tasksStarted: number;
  /** Completed tasks, oldest first. */
  completedTasks: readonly CompletedTask[];
}

export function computeMastery(activity: TopicActivity): MasteryLevel {
  const allLessonsDone = activity.lessonsCompleted >= activity.lessonsTotal;
  const practiceMastered =
    !activity.hasPractice ||
    activity.completedTasks
      .filter((task) => task.difficulty >= MASTERY_MIN_DIFFICULTY)
      .slice(-MASTERY_WINDOW)
      .filter((task) => task.outcome === "unaided").length >= MASTERY_REQUIRED_UNAIDED;

  const anyProgress = activity.lessonsCompleted > 0 || activity.completedTasks.length > 0;

  if (anyProgress && allLessonsDone && practiceMastered) {
    return "mastered";
  }
  if (anyProgress) {
    return "practising";
  }
  if (activity.lessonsOpened > 0 || activity.tasksStarted > 0) {
    return "started";
  }
  return "none";
}

/** Share of unaided tasks among the last 10, or null without tasks. */
export function unaidedRate(tasks: readonly CompletedTask[]): number | null {
  const recent = tasks.slice(-RATE_WINDOW);
  if (recent.length === 0) {
    return null;
  }
  return recent.filter((task) => task.outcome === "unaided").length / recent.length;
}

/** Teacher flag: below 40 % unaided over the last 10 tasks, with at least 5. */
export function isStruggling(tasks: readonly CompletedTask[]): boolean {
  const recent = tasks.slice(-RATE_WINDOW);
  const rate = unaidedRate(recent);
  return recent.length >= STRUGGLING_MIN_TASKS && rate !== null && rate < STRUGGLING_RATE;
}
