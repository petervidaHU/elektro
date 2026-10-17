import { EXAM_PARTS, TOPICS, type ExamPart, type TopicId } from "../syllabus/topics.js";
import type { MasteryLevel } from "../practice/mastery.js";
import { STRUGGLING_MIN_TASKS } from "../practice/mastery.js";

/** What the dashboard needs to know about one topic of the learner. */
export interface TopicState {
  masteryLevel: MasteryLevel;
  tasksCompleted: number;
  /** Unaided share of the last 10 tasks, or null without tasks. */
  unaidedRate: number | null;
}

export type TopicStates = Partial<Record<TopicId, TopicState>>;

/** Below this unaided share a topic is recommended again as "recent mistakes". */
export const REVISIT_RATE = 0.6;

export interface Recommendation {
  topicId: TopicId;
  /** `mistakes`: practise again; `start`: first topic; `next`: the next unmastered one. */
  reason: "mistakes" | "start" | "next";
}

const practised = (level: MasteryLevel | undefined) => level === "practising" || level === "mastered";

/**
 * "Ajánlott következő" (plan §3.4 J2): a topic with recent mistakes first,
 * otherwise the first unmastered topic, in syllabus order, whose prerequisites
 * are practised. `available` are the topics that have content for students;
 * a prerequisite without content never blocks. Recommendation only - nothing
 * is locked.
 */
export function recommendNext(states: TopicStates, available: readonly TopicId[]): Recommendation | null {
  const candidates = TOPICS.filter((topic) => available.includes(topic.id));

  const shaky = candidates.find((topic) => {
    const state = states[topic.id];
    return (
      state !== undefined &&
      state.masteryLevel !== "mastered" &&
      state.tasksCompleted >= STRUGGLING_MIN_TASKS &&
      state.unaidedRate !== null &&
      state.unaidedRate < REVISIT_RATE
    );
  });
  if (shaky) {
    return { topicId: shaky.id, reason: "mistakes" };
  }

  const next = candidates.find((topic) => {
    if (states[topic.id]?.masteryLevel === "mastered") return false;
    return topic.prerequisites.every(
      (id) => !available.includes(id) || practised(states[id]?.masteryLevel),
    );
  });
  if (!next) {
    return null;
  }
  const anyActivity = Object.values(states).some((state) => state && state.masteryLevel !== "none");
  return { topicId: next.id, reason: anyActivity ? "next" : "start" };
}

export interface ExamPartReadiness {
  part: ExamPart;
  total: number;
  covered: number;
  share: number;
}

/**
 * Coverage of the exam parts (plan §3.4 J2): the share of an exam part's
 * topics the learner is practising or has mastered. Information, not a score.
 * The project task is not a topic area, so only the base exam and parts I-IV.
 */
export function examReadiness(states: TopicStates): ExamPartReadiness[] {
  return EXAM_PARTS.filter((part) => part !== "project").map((part) => {
    const topics = TOPICS.filter((topic) => topic.examParts.includes(part));
    const covered = topics.filter((topic) => practised(states[topic.id]?.masteryLevel)).length;
    return { part, total: topics.length, covered, share: topics.length === 0 ? 0 : covered / topics.length };
  });
}

