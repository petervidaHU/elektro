import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { TOPIC_IDS } from "@elektro/shared";
import { user } from "./auth.js";

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

/** Progress is tracked per topic, across lessons, practice and the simulator. */
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
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("topic_progress_user_topic_uq").on(table.userId, table.topicId)],
);

/** One attempt at a calculation practice task, for step-checked feedback. */
export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    /** Identifier of the task definition the attempt belongs to. */
    taskRef: text("task_ref").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    /** Submitted inputs and per-step results, for review and statistics. */
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("practice_attempts_user_topic_idx").on(table.userId, table.topicId)],
);
