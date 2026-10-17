import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  hasPractice,
  isVisibleToStudent,
  TOPIC_IDS,
  type HistoryEntry,
  type Locale,
  type TopicId,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { lessonReads, practiceAttempts, practiceSessions } from "../db/schema/app.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import { allowUnapprovedDrafts } from "./settings.js";

/**
 * A user's activity as one feed (plan §3.4 J6): lessons opened or completed
 * and practice sessions, newest first. Archived lessons are left out (Q23).
 */
export async function historyOf(userId: string, locale: Locale, limit = 200): Promise<HistoryEntry[]> {
  const reads = await db()
    .select({
      slug: lessons.slug,
      topicId: lessons.topicId,
      completedAt: lessonReads.completedAt,
      updatedAt: lessonReads.updatedAt,
      title: lessonTranslations.title,
    })
    .from(lessonReads)
    .innerJoin(lessons, eq(lessonReads.lessonId, lessons.id))
    .leftJoin(
      lessonTranslations,
      and(
        eq(lessonTranslations.lessonVersionId, lessonReads.lessonVersionId),
        eq(lessonTranslations.locale, locale),
      ),
    )
    .where(and(eq(lessonReads.userId, userId), isNull(lessons.archivedAt)))
    .orderBy(desc(lessonReads.updatedAt))
    .limit(limit);

  const sessions = await db()
    .select({
      id: practiceSessions.id,
      topicId: practiceSessions.topicId,
      taskCount: practiceSessions.taskCount,
      status: practiceSessions.status,
      startedAt: practiceSessions.startedAt,
      finishedAt: practiceSessions.finishedAt,
      started: sql<number>`count(${practiceAttempts.id})::int`,
      unaided: sql<number>`count(${practiceAttempts.id}) filter (where ${practiceAttempts.outcome} = 'unaided')::int`,
    })
    .from(practiceSessions)
    .leftJoin(practiceAttempts, eq(practiceAttempts.sessionId, practiceSessions.id))
    .where(eq(practiceSessions.userId, userId))
    .groupBy(practiceSessions.id)
    .orderBy(desc(practiceSessions.startedAt))
    .limit(limit);

  const entries: HistoryEntry[] = [
    ...reads.map(
      (read): HistoryEntry => ({
        kind: "lesson",
        at: (read.completedAt ?? read.updatedAt).toISOString(),
        topicId: read.topicId,
        slug: read.slug,
        title: read.title ?? read.slug,
        completed: read.completedAt !== null,
      }),
    ),
    // An abandoned session nobody worked in is noise.
    ...sessions
      .filter((session) => session.status !== "abandoned" || session.started > 0)
      .map(
        (session): HistoryEntry => ({
          kind: "practice",
          at: (session.finishedAt ?? session.startedAt).toISOString(),
          topicId: session.topicId,
          sessionId: session.id,
          taskCount: session.taskCount,
          unaided: session.unaided,
          status: session.status,
        }),
      ),
  ];
  return entries.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}

/**
 * Topics a student can learn from right now: those with a visible lesson or
 * with practice tasks. Feeds "recommended next".
 */
export async function availableTopics(): Promise<TopicId[]> {
  const draftsVisible = await allowUnapprovedDrafts();
  const rows = await db()
    .select({ topicId: lessons.topicId, status: lessonTranslations.status })
    .from(lessonTranslations)
    .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
    .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
    .where(isNull(lessons.archivedAt));

  const withLessons = new Set(
    rows.filter((row) => isVisibleToStudent(row.status, draftsVisible)).map((row) => row.topicId),
  );
  return TOPIC_IDS.filter((id) => withLessons.has(id) || hasPractice(id));
}

/** The lesson the user opened last and has not completed, if it is still readable. */
export async function unfinishedLesson(userId: string, locale: Locale) {
  const rows = await db()
    .select({
      slug: lessons.slug,
      topicId: lessons.topicId,
      title: lessonTranslations.title,
      status: lessonTranslations.status,
    })
    .from(lessonReads)
    .innerJoin(lessons, eq(lessonReads.lessonId, lessons.id))
    .innerJoin(lessonVersions, eq(lessonVersions.lessonId, lessons.id))
    .innerJoin(
      lessonTranslations,
      and(eq(lessonTranslations.lessonVersionId, lessonVersions.id), eq(lessonTranslations.locale, locale)),
    )
    .where(and(eq(lessonReads.userId, userId), isNull(lessonReads.completedAt), isNull(lessons.archivedAt)))
    .orderBy(desc(lessonReads.updatedAt), desc(lessonVersions.version));

  const draftsVisible = await allowUnapprovedDrafts();
  const row = rows.find((item) => isVisibleToStudent(item.status, draftsVisible));
  return row ? { slug: row.slug, topicId: row.topicId, title: row.title } : null;
}

/** The newest active practice session of the user, with how many tasks are done. */
export async function activeSessionOf(userId: string) {
  const [session] = await db()
    .select({
      id: practiceSessions.id,
      topicId: practiceSessions.topicId,
      taskCount: practiceSessions.taskCount,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "active")))
    .orderBy(desc(practiceSessions.startedAt))
    .limit(1);
  if (!session) {
    return null;
  }
  const done = await db()
    .select({ id: practiceAttempts.id })
    .from(practiceAttempts)
    .where(
      and(
        eq(practiceAttempts.sessionId, session.id),
        inArray(practiceAttempts.outcome, ["unaided", "with_help", "solution_shown"]),
      ),
    );
  return { ...session, done: done.length };
}
