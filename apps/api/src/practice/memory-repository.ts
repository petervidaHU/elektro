import { randomUUID } from "node:crypto";
import type { AttemptRecord, MasteryLevel, TopicId } from "@elektro/shared";
import type { PracticeRepository, ProgressService, StoredSession } from "./repository.js";

/** In-memory practice storage for tests. */
export function createMemoryPracticeRepository(): PracticeRepository & {
  attempts: Map<string, AttemptRecord[]>;
} {
  const sessions = new Map<string, StoredSession>();
  const attempts = new Map<string, AttemptRecord[]>();

  return {
    attempts,
    async createSession({ userId, topicId, tasks, masteryAtStart }) {
      for (const session of sessions.values()) {
        if (session.userId === userId && session.topicId === topicId && session.status === "active") {
          session.status = "abandoned";
        }
      }
      const session: StoredSession = {
        id: randomUUID(),
        userId,
        topicId,
        taskCount: tasks.length,
        status: "active",
        tasks,
        masteryAtStart,
        startedAt: new Date(),
        finishedAt: null,
      };
      sessions.set(session.id, session);
      return { ...session };
    },
    async findSession(id) {
      const session = sessions.get(id);
      return session ? { ...session } : null;
    },
    async findActiveSession(userId, topicId) {
      const session = [...sessions.values()].find(
        (item) => item.userId === userId && item.topicId === topicId && item.status === "active",
      );
      return session ? { ...session } : null;
    },
    async listAttempts(sessionId) {
      return [...(attempts.get(sessionId) ?? [])];
    },
    async saveAttempt(session, taskIndex, steps) {
      const list = (attempts.get(session.id) ?? []).filter((item) => item.taskIndex !== taskIndex);
      attempts.set(session.id, [...list, { taskIndex, steps }]);
    },
    async finishSession(id) {
      const session = sessions.get(id);
      if (session) {
        session.status = "finished";
        session.finishedAt = new Date();
      }
    },
  };
}

/** Progress stand-in for tests: records recompute calls. */
export function createFakeProgress(level: MasteryLevel = "practising"): ProgressService & {
  recomputed: { userId: string; topicId: TopicId }[];
} {
  const recomputed: { userId: string; topicId: TopicId }[] = [];
  return {
    recomputed,
    async current() {
      return recomputed.length > 0 ? level : "none";
    },
    async recompute(userId, topicId) {
      recomputed.push({ userId, topicId });
      return level;
    },
  };
}
