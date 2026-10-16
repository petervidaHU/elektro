import { and, asc, eq, inArray } from "drizzle-orm";
import {
  computeMastery,
  hasPractice,
  isVisibleToStudent,
  unaidedRate,
  type CompletedTask,
  type Difficulty,
  type MasteryLevel,
  type TopicId,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { lessonReads, practiceAttempts, topicProgress } from "../db/schema/app.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import type { ProgressService } from "../practice/repository.js";
import { allowUnapprovedDrafts } from "./settings.js";

/**
 * Topic progress (plan §3.6): `topic_progress` is a cache, recomputed from
 * `lesson_reads` and `practice_attempts` after each activity. The rules live
 * in `computeMastery` (packages/shared).
 */
export const drizzleProgress: ProgressService = {
  async current(userId, topicId) {
    const [row] = await db()
      .select({ level: topicProgress.masteryLevel })
      .from(topicProgress)
      .where(and(eq(topicProgress.userId, userId), eq(topicProgress.topicId, topicId)))
      .limit(1);
    return row?.level ?? "none";
  },

  async recompute(userId, topicId) {
    return recomputeTopicProgress(userId, topicId);
  },
};

export async function recomputeTopicProgress(userId: string, topicId: TopicId): Promise<MasteryLevel> {
  const draftsVisible = await allowUnapprovedDrafts();

  // Lessons a student can read: those with a visible translation.
  const translations = await db()
    .select({ lessonId: lessons.id, status: lessonTranslations.status })
    .from(lessonTranslations)
    .innerJoin(lessonVersions, eq(lessonTranslations.lessonVersionId, lessonVersions.id))
    .innerJoin(lessons, eq(lessonVersions.lessonId, lessons.id))
    .where(eq(lessons.topicId, topicId));
  const visible = new Set(
    translations
      .filter((row) => isVisibleToStudent(row.status, draftsVisible))
      .map((row) => row.lessonId),
  );
  const topicLessonIds = [...new Set(translations.map((row) => row.lessonId))];

  const reads =
    topicLessonIds.length === 0
      ? []
      : await db()
          .select({ lessonId: lessonReads.lessonId, completedAt: lessonReads.completedAt })
          .from(lessonReads)
          .where(and(eq(lessonReads.userId, userId), inArray(lessonReads.lessonId, topicLessonIds)));

  const attempts = await db()
    .select({ difficulty: practiceAttempts.difficulty, outcome: practiceAttempts.outcome })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.userId, userId), eq(practiceAttempts.topicId, topicId)))
    .orderBy(asc(practiceAttempts.completedAt));

  const completedTasks: CompletedTask[] = attempts.flatMap((attempt) =>
    attempt.outcome === "in_progress"
      ? []
      : [{ difficulty: (attempt.difficulty ?? 1) as Difficulty, outcome: attempt.outcome }],
  );
  const lessonsCompleted = reads.filter(
    (read) => read.completedAt !== null && visible.has(read.lessonId),
  ).length;

  const level = computeMastery({
    lessonsTotal: visible.size,
    lessonsOpened: reads.length,
    lessonsCompleted,
    hasPractice: hasPractice(topicId),
    tasksStarted: attempts.length,
    completedTasks,
  });

  const values = {
    masteryLevel: level,
    lessonsCompleted,
    lessonsTotal: visible.size,
    tasksCompleted: completedTasks.length,
    unaidedRateLast10: unaidedRate(completedTasks),
    lessonCompleted: visible.size > 0 && lessonsCompleted >= visible.size,
    practiceSolved: completedTasks.length > 0,
    lastActivityAt: new Date(),
    updatedAt: new Date(),
  };

  await db()
    .insert(topicProgress)
    .values({ userId, topicId, ...values })
    .onConflictDoUpdate({ target: [topicProgress.userId, topicProgress.topicId], set: values });

  return level;
}

/** A student's progress rows, for the progress page and the syllabus. */
export async function listProgress(userId: string) {
  return db()
    .select({
      topicId: topicProgress.topicId,
      masteryLevel: topicProgress.masteryLevel,
      lessonsCompleted: topicProgress.lessonsCompleted,
      lessonsTotal: topicProgress.lessonsTotal,
      tasksCompleted: topicProgress.tasksCompleted,
      unaidedRate: topicProgress.unaidedRateLast10,
      lastActivityAt: topicProgress.lastActivityAt,
    })
    .from(topicProgress)
    .where(eq(topicProgress.userId, userId));
}
