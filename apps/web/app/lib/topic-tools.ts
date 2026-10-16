import type { TopicId } from "@elektro/shared";

/** Calculators per topic (plan §2.2); the topic hub and lessons link to them. */
export const TOPIC_CALCULATORS: Partial<Record<TopicId, { path: string; titleKey: string }>> = {
  "voltage-drop": { path: "calculators/voltage-drop", titleKey: "calculators.voltageDrop.title" },
};
