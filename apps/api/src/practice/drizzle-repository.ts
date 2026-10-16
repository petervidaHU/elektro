import { and, desc, eq } from "drizzle-orm";
import type { MasteryLevel, TopicId } from "@elektro/shared";
import { db } from "../db/index.js";
import { practiceAttempts, practiceSessions } from "../db/schema/app.js";
import type { PracticeRepository, StoredSession } from "./repository.js";

type SessionRow = typeof practiceSessions.$inferSelect;

function toSession(row: SessionRow): StoredSession {
  return {
    id: row.id,
    userId: row.userId,
    topicId: row.topicId,
    taskCount: row.taskCount,
    status: row.status,
    tasks: row.tasks,
    masteryAtStart: row.masteryAtStart as MasteryLevel,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
  };
}

/** Practice storage in PostgreSQL (`practice_sessions`, `practice_attempts`). */
export const drizzlePracticeRepository: PracticeRepository = {
  async createSession({ userId, topicId, tasks, masteryAtStart }) {
    return db().transaction(async (tx) => {
      await tx
        .update(practiceSessions)
        .set({ status: "abandoned" })
        .where(
          and(
            eq(practiceSessions.userId, userId),
            eq(practiceSessions.topicId, topicId),
            eq(practiceSessions.status, "active"),
          ),
        );

      const [row] = await tx
        .insert(practiceSessions)
        .values({ userId, topicId, taskCount: tasks.length, tasks, masteryAtStart })
        .returning();
      return toSession(row!);
    });
  },

  async findSession(id) {
    const [row] = await db().select().from(practiceSessions).where(eq(practiceSessions.id, id)).limit(1);
    return row ? toSession(row) : null;
  },

  async findActiveSession(userId: string, topicId: TopicId) {
    const [row] = await db()
      .select()
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.topicId, topicId),
          eq(practiceSessions.status, "active"),
        ),
      )
      .orderBy(desc(practiceSessions.startedAt))
      .limit(1);
    return row ? toSession(row) : null;
  },

  async listAttempts(sessionId) {
    const rows = await db()
      .select({ taskIndex: practiceAttempts.taskIndex, steps: practiceAttempts.payload })
      .from(practiceAttempts)
      .where(eq(practiceAttempts.sessionId, sessionId));
    return rows.map((row) => ({ taskIndex: row.taskIndex ?? 0, steps: row.steps ?? [] }));
  },

  async saveAttempt(session, taskIndex, steps, outcome) {
    const planned = session.tasks[taskIndex]!;
    const done = outcome !== "in_progress";
    const values = {
      payload: steps,
      outcome,
      isCorrect: outcome === "unaided" || outcome === "with_help",
      completedAt: done ? new Date() : null,
    };

    await db()
      .insert(practiceAttempts)
      .values({
        userId: session.userId,
        topicId: session.topicId,
        taskRef: planned.templateId,
        sessionId: session.id,
        taskIndex,
        templateVersion: planned.templateVersion,
        seed: planned.seed,
        difficulty: planned.difficulty,
        ...values,
      })
      .onConflictDoUpdate({
        target: [practiceAttempts.sessionId, practiceAttempts.taskIndex],
        set: values,
      });
  },

  async finishSession(id) {
    await db()
      .update(practiceSessions)
      .set({ status: "finished", finishedAt: new Date() })
      .where(eq(practiceSessions.id, id));
  },
};
