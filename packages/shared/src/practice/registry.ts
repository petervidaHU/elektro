import type { TopicId } from "../syllabus/topics.js";
import { VOLTAGE_DROP_TEMPLATES } from "./templates/voltage-drop.js";
import type { TaskTemplate } from "./types.js";

/** Every practice template, by topic. Add a topic's templates here. */
export const TEMPLATES: readonly TaskTemplate[] = [...VOLTAGE_DROP_TEMPLATES];

export const TEMPLATES_BY_ID = new Map(TEMPLATES.map((template) => [template.id, template]));

export function templatesForTopic(topicId: TopicId): readonly TaskTemplate[] {
  return TEMPLATES.filter((template) => template.topicId === topicId);
}

/** Whether a topic has practice tasks (its hub shows the practice card). */
export function hasPractice(topicId: TopicId): boolean {
  return templatesForTopic(topicId).length > 0;
}
