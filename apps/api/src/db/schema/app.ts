import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  MASTERY_LEVELS,
  TOPIC_IDS,
  type PlannedTask,
  type StepState,
  type TaskOutcome,
} from "@elektro/shared";
import { user } from "./auth.js";
import { lessons, lessonVersions } from "./content.js";

/**
 * Admin settings. Whether students see unapproved drafts is a setting, never a
 * hard-coded rule - see `APP_SETTING_KEYS`.
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const APP_SETTING_KEYS = {
  /** boolean - show `ai_draft` / `in_review` content to students. */
  allowUnapprovedDrafts: "content.allow_unapproved_drafts",
} as const;

/**
 * Progress per topic, across lessons, practice and the simulator - a cache
 * recomputed from `lesson_reads` and `practice_attempts` after every write
 * (apps/api/src/lib/progress.ts), never edited directly.
 */
export const topicProgress = pgTable(
  "topic_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    lessonCompleted: boolean("lesson_completed").notNull().default(false),
    practiceSolved: boolean("practice_solved").notNull().default(false),
    measurementCompleted: boolean("measurement_completed").notNull().default(false),
    /** `none` | `started` | `practising` | `mastered` (plan §3.6). */
    masteryLevel: text("mastery_level", { enum: MASTERY_LEVELS }).notNull().default("none"),
    lessonsCompleted: integer("lessons_completed").notNull().default(0),
    lessonsTotal: integer("lessons_total").notNull().default(0),
    tasksCompleted: integer("tasks_completed").notNull().default(0),
    /** Share of unaided tasks among the last 10, or null without tasks. */
    unaidedRateLast10: real("unaided_rate_last10"),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("topic_progress_user_topic_uq").on(table.userId, table.topicId)],
);

export const PRACTICE_SESSION_STATUSES = ["active", "finished", "abandoned"] as const;

/** A practice session: N planned tasks of one topic (plan §2.5). */
export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    taskCount: integer("task_count").notNull(),
    status: text("status", { enum: PRACTICE_SESSION_STATUSES }).notNull().default("active"),
    /** Template id + version + seed per task: enough to rebuild every task. */
    tasks: jsonb("tasks").$type<PlannedTask[]>().notNull(),
    /** Topic mastery when the session began, for the summary's before/after. */
    masteryAtStart: text("mastery_at_start", { enum: MASTERY_LEVELS }).notNull().default("none"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    index("practice_sessions_user_topic_idx").on(table.userId, table.topicId, table.status),
  ],
);

/**
 * One task of a practice session: every answer, verdict, hint and revealed
 * solution, so the history can replay it. The verdicts are the API's - the
 * client never decides whether an answer is right.
 */
export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    /** Practice template id, e.g. "voltage-drop.single-phase-basic". */
    taskRef: text("task_ref").notNull(),
    /** Completed with every step answered, without a revealed solution. */
    isCorrect: boolean("is_correct").notNull(),
    /** Per-step state (`StepState[]`): answers, verdicts, hints, solutions. */
    payload: jsonb("payload").$type<StepState[]>(),
    sessionId: uuid("session_id").references(() => practiceSessions.id, { onDelete: "cascade" }),
    taskIndex: integer("task_index"),
    templateVersion: integer("template_version"),
    seed: bigint("seed", { mode: "number" }),
    difficulty: integer("difficulty"),
    outcome: text("outcome").$type<TaskOutcome>().notNull().default("in_progress"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("practice_attempts_user_topic_idx").on(table.userId, table.topicId),
    unique("practice_attempts_session_task_uq").on(table.sessionId, table.taskIndex),
  ],
);

/** Lesson reading: opened, last section (for resume), completed. */
export const lessonReads = pgTable(
  "lesson_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** The version the student last read. */
    lessonVersionId: uuid("lesson_version_id").references(() => lessonVersions.id, {
      onDelete: "set null",
    }),
    lastSection: text("last_section"),
    firstOpenedAt: timestamp("first_opened_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("lesson_reads_user_lesson_uq").on(table.userId, table.lessonId)],
);
