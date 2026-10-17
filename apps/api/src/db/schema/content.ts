import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  jsonb,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  CONTENT_ACTIONS} from "@elektro/shared";
import {
  CALCULATOR_IDS,
  TABLE_STATUSES,
  type ReferenceTableContent,
  type TableAction,
  CONTENT_STATUSES,
  INITIAL_CONTENT_STATUS,
  LOCALES,
  ROLES,
  TOPIC_IDS,
} from "@elektro/shared";
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
    /** Order of the lesson within its topic (ascending); topics follow the syllabus. */
    position: integer("position").notNull().default(0),
    /**
     * "Delete" archives a lesson (plan Q23): hidden from everyone but admins,
     * restorable, reading progress and the approval log stay.
     */
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("lessons_topic_id_position_idx").on(table.topicId, table.position)],
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
    /**
     * The approver. `approved_by` links to the account while it exists; the
     * `approved_by_*` columns are a snapshot taken at approval time and are
     * never updated, so the record survives renaming or deleting the account.
     */
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    approvedByName: text("approved_by_name"),
    approvedByEmail: text("approved_by_email"),
    approvedByRole: text("approved_by_role", { enum: ROLES }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("lesson_translations_version_locale_uq").on(table.lessonVersionId, table.locale),
    index("lesson_translations_status_idx").on(table.status),
    // An approval is only valid with its full record: who (snapshot) and when.
    check(
      "lesson_translations_approval_recorded",
      sql`${table.status} <> 'approved' OR (${table.approvedAt} IS NOT NULL AND ${table.approvedByName} IS NOT NULL AND ${table.approvedByEmail} IS NOT NULL AND ${table.approvedByRole} IS NOT NULL)`,
    ),
  ],
);

/**
 * Append-only log of every review action on content (submit, approve, request
 * changes): who (snapshot of id, name, email, role), when, on which content
 * version and locale, and the note. Rows are never updated or deleted (a
 * database trigger enforces it); only `actor_id` is set to null when the
 * account is deleted. There is deliberately no foreign key to the content row,
 * so the log also outlives a deleted lesson.
 */
export const contentReviewEvents = pgTable(
  "content_review_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** `lesson` and `reference_table`; glossary, topic intros and task texts reuse this log. */
    contentKind: text("content_kind", { enum: ["lesson", "reference_table", "glossary_term", "topic_intro"] }).notNull(),
    /** Lesson slug at the time of the action. */
    contentSlug: text("content_slug").notNull(),
    /** The reviewed translation row (no FK: it may be deleted later). */
    translationId: uuid("translation_id").notNull(),
    version: integer("version").notNull(),
    locale: text("locale", { enum: LOCALES }).notNull(),
    /** Lesson review actions, or the table actions `verify` / `supersede` / `create`. */
    action: text("action").$type<(typeof CONTENT_ACTIONS)[number] | TableAction | "create">().notNull(),
    fromStatus: text("from_status")
      .$type<(typeof CONTENT_STATUSES)[number] | (typeof TABLE_STATUSES)[number]>()
      .notNull(),
    toStatus: text("to_status")
      .$type<(typeof CONTENT_STATUSES)[number] | (typeof TABLE_STATUSES)[number]>()
      .notNull(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    actorEmail: text("actor_email").notNull(),
    actorRole: text("actor_role", { enum: ROLES }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("content_review_events_content_idx").on(
      table.contentKind,
      table.contentSlug,
      table.createdAt,
    ),
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

/**
 * The calculator registry (plan §2.2, Q21). The calculators themselves (engine,
 * page) are code - `CALCULATOR_IDS` in `@elektro/shared`. A row here lists one
 * of them: topic, order, whether students see it, and per-locale texts.
 * Removing a row only takes the calculator off the list.
 */
export const calculators = pgTable(
  "calculators",
  {
    id: text("id", { enum: CALCULATOR_IDS }).primaryKey(),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    position: integer("position").notNull().default(0),
    published: boolean("published").notNull().default(false),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("calculators_position_idx").on(table.position)],
);

/** Title and description of a calculator in one locale. */
export const calculatorTranslations = pgTable(
  "calculator_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    calculatorId: text("calculator_id", { enum: CALCULATOR_IDS })
      .notNull()
      .references(() => calculators.id, { onDelete: "cascade" }),
    locale: text("locale", { enum: LOCALES }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("calculator_translations_calculator_locale_uq").on(table.calculatorId, table.locale),
  ],
);

/**
 * Practice templates and their reviewable texts (plan §2.7, K12). The
 * templates are code (`@elektro/shared`); these rows prepare the DB-backed,
 * approvable texts. Unused at runtime in v1: the app still reads the i18n
 * files, and `npm run db:sync:practice-texts` mirrors them here.
 */
export const practiceTemplates = pgTable("practice_templates", {
  /** The template id, e.g. "voltage-drop.single-phase-basic". */
  id: text("id").primaryKey(),
  topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
  currentVersion: integer("current_version").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practiceTaskTexts = pgTable(
  "practice_task_texts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: text("template_id")
      .notNull()
      .references(() => practiceTemplates.id, { onDelete: "cascade" }),
    templateVersion: integer("template_version").notNull(),
    locale: text("locale", { enum: LOCALES }).notNull(),
    /** Scenario text by scenario key (`practiceScenario.<key>`), with `{{placeholders}}`. */
    scenarios: jsonb("scenarios").$type<Record<string, string>>().notNull(),
    /** Step label by step id (`calcStep.<id>`). */
    stepLabels: jsonb("step_labels").$type<Record<string, string>>().notNull(),
    /** Hint text by step id (`practiceHint.<id>`). */
    hints: jsonb("hints").$type<Record<string, string>>().notNull(),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default(INITIAL_CONTENT_STATUS),
    reviewNote: text("review_note"),
    /** Approval record, same shape as on lessons (plan §2.6, Q19). */
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    approvedByName: text("approved_by_name"),
    approvedByEmail: text("approved_by_email"),
    approvedByRole: text("approved_by_role", { enum: ROLES }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("practice_task_texts_template_version_locale_uq").on(
      table.templateId,
      table.templateVersion,
      table.locale,
    ),
    check(
      "practice_task_texts_approval_recorded",
      sql`${table.status} <> 'approved' OR (${table.approvedAt} IS NOT NULL AND ${table.approvedByName} IS NOT NULL AND ${table.approvedByEmail} IS NOT NULL AND ${table.approvedByRole} IS NOT NULL)`,
    ),
  ],
);

/**
 * Reference tables (plan §2.3, K8): standards and textbook values as data with
 * a source and a verification status. A table is the language-neutral row
 * (`key`); each edit of a verified table is a new version. Only `verified`
 * versions reach students. Verification is documented like an approval (Q19):
 * a snapshot of the verifier plus a row in `content_review_events`.
 */
export const referenceTables = pgTable("reference_tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referenceTableVersions = pgTable(
  "reference_table_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tableId: uuid("table_id")
      .notNull()
      .references(() => referenceTables.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    /** Standard or textbook, edition, table or page: shown under every excerpt. */
    source: text("source").notNull(),
    columns: jsonb("columns").$type<ReferenceTableContent["columns"]>().notNull(),
    rows: jsonb("rows").$type<ReferenceTableContent["rows"]>().notNull(),
    status: text("status", { enum: TABLE_STATUSES }).notNull().default("unverified"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    /** The verifier: `verified_by` while the account exists, the snapshot forever. */
    verifiedBy: text("verified_by").references(() => user.id, { onDelete: "set null" }),
    verifiedByName: text("verified_by_name"),
    verifiedByEmail: text("verified_by_email"),
    verifiedByRole: text("verified_by_role", { enum: ROLES }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("reference_table_versions_table_version_uq").on(table.tableId, table.version),
    index("reference_table_versions_status_idx").on(table.status),
    // Verified and superseded versions keep their full verifier record.
    check(
      "reference_table_versions_verification_recorded",
      sql`${table.status} = 'unverified' OR (${table.verifiedAt} IS NOT NULL AND ${table.verifiedByName} IS NOT NULL AND ${table.verifiedByEmail} IS NOT NULL AND ${table.verifiedByRole} IS NOT NULL)`,
    ),
  ],
);

/**
 * Glossary (fogalomtár, plan S5): a language-neutral term key plus per-locale
 * translations, versioned and approved like lessons. A translation row is one
 * (term, locale, version); editing an approved one creates the next version
 * and the approved one stays live until the new one is approved.
 */
export const glossaryTerms = pgTable("glossary_terms", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Slug used by `:term[...]{id=key}` in lesson bodies. */
  key: text("key").notNull().unique(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const glossaryTranslations = pgTable(
  "glossary_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    termId: uuid("term_id")
      .notNull()
      .references(() => glossaryTerms.id, { onDelete: "cascade" }),
    locale: text("locale", { enum: LOCALES }).notNull(),
    version: integer("version").notNull(),
    term: text("term").notNull(),
    definition: text("definition").notNull(),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default(INITIAL_CONTENT_STATUS),
    reviewNote: text("review_note"),
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    approvedByName: text("approved_by_name"),
    approvedByEmail: text("approved_by_email"),
    approvedByRole: text("approved_by_role", { enum: ROLES }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("glossary_translations_term_locale_version_uq").on(table.termId, table.locale, table.version),
    index("glossary_translations_status_idx").on(table.status),
    check(
      "glossary_translations_approval_recorded",
      sql`${table.status} <> 'approved' OR (${table.approvedAt} IS NOT NULL AND ${table.approvedByName} IS NOT NULL AND ${table.approvedByEmail} IS NOT NULL AND ${table.approvedByRole} IS NOT NULL)`,
    ),
  ],
);

/**
 * Topic intro (plan S6): a short per-locale description of a topic, shown on
 * the syllabus and the topic hub. The topic is code (`TOPIC_IDS`), so there is
 * no parent row; each row is one (topic, locale, version).
 */
export const topicIntroTranslations = pgTable(
  "topic_intro_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: text("topic_id", { enum: TOPIC_IDS }).notNull(),
    locale: text("locale", { enum: LOCALES }).notNull(),
    version: integer("version").notNull(),
    text: text("text").notNull(),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default(INITIAL_CONTENT_STATUS),
    reviewNote: text("review_note"),
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    approvedByName: text("approved_by_name"),
    approvedByEmail: text("approved_by_email"),
    approvedByRole: text("approved_by_role", { enum: ROLES }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("topic_intro_translations_topic_locale_version_uq").on(table.topicId, table.locale, table.version),
    index("topic_intro_translations_status_idx").on(table.status),
    check(
      "topic_intro_translations_approval_recorded",
      sql`${table.status} <> 'approved' OR (${table.approvedAt} IS NOT NULL AND ${table.approvedByName} IS NOT NULL AND ${table.approvedByEmail} IS NOT NULL AND ${table.approvedByRole} IS NOT NULL)`,
    ),
  ],
);
