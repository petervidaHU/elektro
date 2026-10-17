import { wrongTries } from "../practice/attempt.js";
import type { MisconceptionId, StepState } from "../practice/types.js";
import type { TopicId } from "../syllabus/topics.js";

export interface InsightAttempt {
  topicId: TopicId;
  templateId: string;
  steps: readonly StepState[];
}

export interface StepInsight {
  templateId: string;
  stepId: string;
  /** Attempts in which the step was answered at least once. */
  attempts: number;
  /** Of those, how many needed a wrong try. */
  withErrors: number;
  errorRate: number;
}

export interface TopicInsight {
  topicId: TopicId;
  /** Hardest steps first. */
  steps: StepInsight[];
  misconceptions: { id: MisconceptionId; count: number }[];
}

/**
 * Teacher insights (plan §3.4 J7): per topic the steps with the highest error
 * rate and the most frequent misconceptions, so a teacher sees which lessons
 * to improve.
 */
export function aggregateInsights(attempts: readonly InsightAttempt[]): TopicInsight[] {
  const byTopic = new Map<TopicId, { steps: Map<string, StepInsight>; misconceptions: Map<MisconceptionId, number> }>();

  for (const attempt of attempts) {
    const topic = byTopic.get(attempt.topicId) ?? { steps: new Map(), misconceptions: new Map() };
    byTopic.set(attempt.topicId, topic);

    for (const step of attempt.steps) {
      for (const id of step.misconceptions) {
        if (id) topic.misconceptions.set(id, (topic.misconceptions.get(id) ?? 0) + 1);
      }
      if (step.verdicts.length === 0) continue;

      const key = `${attempt.templateId}/${step.stepId}`;
      const insight = topic.steps.get(key) ?? {
        templateId: attempt.templateId,
        stepId: step.stepId,
        attempts: 0,
        withErrors: 0,
        errorRate: 0,
      };
      insight.attempts += 1;
      if (wrongTries(step) > 0) insight.withErrors += 1;
      insight.errorRate = insight.withErrors / insight.attempts;
      topic.steps.set(key, insight);
    }
  }

  return [...byTopic.entries()].map(([topicId, topic]) => ({
    topicId,
    steps: [...topic.steps.values()].sort(
      (a, b) => b.errorRate - a.errorRate || b.attempts - a.attempts || a.stepId.localeCompare(b.stepId),
    ),
    misconceptions: [...topic.misconceptions.entries()]
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count),
  }));
}
