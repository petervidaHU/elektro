import type {
  AttemptRecord,
  MasteryLevel,
  PlannedTask,
  SessionRecord,
  StepState,
  TaskOutcome,
  TopicId,
} from "@elektro/shared";

/**
 * Storage for practice sessions. The routes only talk to this interface, so
 * the flow and its authorization rules are tested with an in-memory store;
 * production uses the Drizzle implementation.
 */
export interface StoredSession extends SessionRecord {
  userId: string;
  startedAt: Date;
  finishedAt: Date | null;
}

export interface PracticeRepository {
  /** Creates an active session; earlier active sessions of the topic are abandoned. */
  createSession(input: {
    userId: string;
    topicId: TopicId;
    tasks: PlannedTask[];
    masteryAtStart: MasteryLevel;
  }): Promise<StoredSession>;
  findSession(id: string): Promise<StoredSession | null>;
  findActiveSession(userId: string, topicId: TopicId): Promise<StoredSession | null>;
  listAttempts(sessionId: string): Promise<AttemptRecord[]>;
  /** Upserts the attempt of one task; stamps completion when the outcome is final. */
  saveAttempt(
    session: StoredSession,
    taskIndex: number,
    steps: StepState[],
    outcome: TaskOutcome,
  ): Promise<void>;
  finishSession(id: string): Promise<void>;
}

/** Topic progress, recomputed after activity (lib/progress.ts). */
export interface ProgressService {
  current(userId: string, topicId: TopicId): Promise<MasteryLevel>;
  recompute(userId: string, topicId: TopicId): Promise<MasteryLevel>;
}
