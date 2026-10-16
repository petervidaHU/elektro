/**
 * The one shared topic map. Lessons, calculators, practice tasks and simulator
 * scenarios are all tagged with these IDs, and progress is tracked per topic.
 *
 * IDs are stable identifiers (English, kebab-case) and are never shown to the
 * user: display names are i18next keys (`topic.<id>`), so adding a locale never
 * touches this file.
 */
export const TOPIC_GROUPS = ["basics", "installation", "measurement"] as const;

export type TopicGroup = (typeof TOPIC_GROUPS)[number];

export interface Topic {
  id: TopicId;
  group: TopicGroup;
}

export const TOPIC_IDS = [
  // basics
  "dc-circuits",
  "ohms-law",
  "series-parallel-circuits",
  "power-and-energy",
  "ac-fundamentals",
  "three-phase-systems",
  // installation
  "conductors-and-cross-section",
  "voltage-drop",
  "overcurrent-protection",
  "rcd-protection",
  "shock-protection",
  "earthing-and-bonding",
  // measurement
  "continuity-of-pe",
  "insulation-resistance",
  "loop-impedance",
  "rcd-testing",
  "earth-resistance",
  "measurement-report",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export const TOPICS: readonly Topic[] = [
  { id: "dc-circuits", group: "basics" },
  { id: "ohms-law", group: "basics" },
  { id: "series-parallel-circuits", group: "basics" },
  { id: "power-and-energy", group: "basics" },
  { id: "ac-fundamentals", group: "basics" },
  { id: "three-phase-systems", group: "basics" },
  { id: "conductors-and-cross-section", group: "installation" },
  { id: "voltage-drop", group: "installation" },
  { id: "overcurrent-protection", group: "installation" },
  { id: "rcd-protection", group: "installation" },
  { id: "shock-protection", group: "installation" },
  { id: "earthing-and-bonding", group: "installation" },
  { id: "continuity-of-pe", group: "measurement" },
  { id: "insulation-resistance", group: "measurement" },
  { id: "loop-impedance", group: "measurement" },
  { id: "rcd-testing", group: "measurement" },
  { id: "earth-resistance", group: "measurement" },
  { id: "measurement-report", group: "measurement" },
];

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === "string" && (TOPIC_IDS as readonly string[]).includes(value);
}

export function topicsByGroup(group: TopicGroup): readonly Topic[] {
  return TOPICS.filter((topic) => topic.group === group);
}
