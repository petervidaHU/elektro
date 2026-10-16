import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { CONTENT_STATUSES, INITIAL_CONTENT_STATUS, LOCALES, TOPIC_IDS } from "@elektro/shared";
import { user } from "./auth.js";

/**
 * Content is stored as language-neutral rows (`lessons`, `lesson_versions`)
 * plus per-locale translation rows (`lesson_translations`). Approval lives on
 * the translation, because it is per locale *and* version.
 */
/** Language-neutral lesson. */
export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("lessons_topic_id_idx").on(table.topicId)],
);

/**
 * An immutable snapshot of a lesson. Editing an approved translation creates
 * the next version; the previously approved version stays live until the new
 * one is approved.
 */
export const lessonVersions = pgTable(
  "lesson_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("lesson_versions_lesson_version_uq").on(table.lessonId, table.version)],
);

/** One locale of one lesson version, with its own approval state. */
export const lessonTranslations = pgTable(
  "lesson_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonVersionId: uuid("lesson_version_id")
      .notNull()
      .references(() => lessonVersions.id, { onDelete: "cascade" }),
    locale: text("locale", { enum: LOCALES }).notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body").notNull(),
    status: text("status", { enum: CONTENT_STATUSES })
      .notNull()
      .default(INITIAL_CONTENT_STATUS),
    /** Reviewer note that accompanies `changes_requested`. */
    reviewNote: text("review_note"),
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("lesson_translations_version_locale_uq").on(table.lessonVersionId, table.locale),
    index("lesson_translations_status_idx").on(table.status),
  ],
);

export const lessonsRelations = relations(lessons, ({ many }) => ({
  versions: many(lessonVersions),
}));

export const lessonVersionsRelations = relations(lessonVersions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lessonVersions.lessonId],
    references: [lessons.id],
  }),
  translations: many(lessonTranslations),
}));

export const lessonTranslationsRelations = relations(lessonTranslations, ({ one }) => ({
  version: one(lessonVersions, {
    fields: [lessonTranslations.lessonVersionId],
    references: [lessonVersions.id],
  }),
  approver: one(user, {
    fields: [lessonTranslations.approvedBy],
    references: [user.id],
  }),
}));
