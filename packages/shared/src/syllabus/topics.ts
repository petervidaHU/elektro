/**
 * The one shared topic map: the syllabus of docs/DEVELOPMENT_PLAN.md §1.2 in
 * data form. Lessons, calculators, practice tasks and simulator scenarios are
 * all tagged with these IDs, and progress is tracked per topic.
 *
 * IDs are stable identifiers (English, kebab-case) and are never shown to the
 * user: display names are i18next keys (`topic.<id>`, `module.<id>`), so adding
 * a locale never touches this file. Change the plan first, then this file.
 *
 * Curriculum references:
 * - `ptt`: témakör numbers of the Programtanterv, Villanyszerelő
 *   4 0713 04 07, v1 (2020), chapter 3 - e.g. "3.6.1.6.2".
 * - `kkk`: requirement rows of the Képzési és kimeneti követelmények, v4
 *   (2024), §6.2 (sector base), §6.3 (shared by all specialisations),
 *   §6.4.1-3 (per specialisation) - e.g. "6.3/5".
 * - `examParts`: KKK §7 (sector base exam) and §8 (central interactive exam
 *   parts I-IV, project task).
 */
export const MODULES = [
  "safety",
  "fundamentals",
  "documentation",
  "installation",
  "sizing-and-protection",
  "machines",
  "verification",
  "other-specialisations",
] as const;

export type ModuleId = (typeof MODULES)[number];

/** KKK §1.4: Épületvillamosság, Villamos hálózat, Villamos készülék és berendezés. */
export const SPECIALISATIONS = ["building", "network", "equipment"] as const;

export type Specialisation = (typeof SPECIALISATIONS)[number];

/** KKK §7 sector base exam, §8 central exam parts I-IV and the project task. */
export const EXAM_PARTS = ["base", "I", "II", "III", "IV", "project"] as const;

export type ExamPart = (typeof EXAM_PARTS)[number];

/** 1 = content now, 2 = next, 3 = topic ID only. */
export type ContentPhase = 1 | 2 | 3;

export const TOPIC_IDS = [
  // A. safety
  "electrical-safety-basics",
  "isolation-procedure",
  "occupational-safety",
  // B. fundamentals
  "dc-circuits",
  "ohms-law",
  "conductor-resistance",
  "series-parallel-circuits",
  "voltage-sources",
  "power-and-energy",
  "electric-field-and-capacitors",
  "magnetism-and-induction",
  "ac-fundamentals",
  "three-phase-systems",
  "measuring-instruments",
  "power-electronics-basics",
  "logic-basics",
  // C. documentation
  "wiring-diagrams",
  // D. installation
  "installation-planning",
  "conductors-and-cross-section",
  "cables-and-cable-laying",
  "installation-methods",
  "lighting-circuits",
  "building-controls",
  "building-automation",
  "distribution-boards",
  "service-connection-and-metering",
  "motor-control",
  "photovoltaic-systems",
  "temporary-site-supply",
  "power-system",
  // E. sizing and protection
  "supply-systems",
  "voltage-drop",
  "current-carrying-capacity",
  "overcurrent-protection",
  "shock-protection",
  "earthing-and-bonding",
  "rcd-protection",
  "lightning-protection",
  "surge-protection",
  // F. machines
  "transformers",
  "electric-motors",
  // G. verification and measurement
  "initial-verification",
  "continuity-of-pe",
  "insulation-resistance",
  "loop-impedance",
  "rcd-testing",
  "earth-resistance",
  "measurement-report",
  // H. other specialisations (IDs only)
  "overhead-lines",
  "network-switchgear",
  "substations",
  "network-earthing",
  "public-lighting",
  "network-operation",
  "industrial-distribution",
  "power-factor-correction",
  "industrial-controls",
  "machine-maintenance",
  "equipment-testing",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export interface Topic {
  id: TopicId;
  module: ModuleId;
  /** Position within the module. */
  order: number;
  /** Drives "recommended next"; never locks content. */
  prerequisites: readonly TopicId[];
  specialisations: readonly Specialisation[];
  ptt: readonly string[];
  kkk: readonly string[];
  examParts: readonly ExamPart[];
  /** Shown with a "safety-critical" badge. */
  safetyCritical: boolean;
  contentPhase: ContentPhase;
}

const ALL: readonly Specialisation[] = SPECIALISATIONS;
const BUILDING: readonly Specialisation[] = ["building"];

type TopicSpec = Omit<Topic, "id" | "module" | "order" | "safetyCritical" | "specialisations"> & {
  safetyCritical?: boolean;
  specialisations?: readonly Specialisation[];
};

/** Builds a module's topics; the order is the position in the list. */
function moduleTopics(module: ModuleId, specs: Record<string, TopicSpec>): Topic[] {
  return Object.entries(specs).map(([id, spec], index) => ({
    id: id as TopicId,
    module,
    order: index + 1,
    prerequisites: spec.prerequisites,
    specialisations: spec.specialisations ?? ALL,
    ptt: spec.ptt,
    kkk: spec.kkk,
    examParts: spec.examParts,
    safetyCritical: spec.safetyCritical ?? false,
    contentPhase: spec.contentPhase,
  }));
}

export const TOPICS: readonly Topic[] = [
  ...moduleTopics("safety", {
    "electrical-safety-basics": {
      prerequisites: [],
      ptt: ["3.3.1.6.4", "3.5.1.6.1"],
      kkk: ["6.2/8", "6.2/10"],
      examParts: ["base", "IV"],
      safetyCritical: true,
      contentPhase: 1,
    },
    "isolation-procedure": {
      prerequisites: ["electrical-safety-basics"],
      ptt: ["3.11.2.6.6"],
      kkk: ["6.3/12"],
      examParts: ["IV"],
      safetyCritical: true,
      contentPhase: 1,
    },
    "occupational-safety": {
      prerequisites: [],
      ptt: ["3.5.2.6.1", "3.5.2.6.2", "3.5.2.6.3", "3.5.2.6.4", "3.5.1.6.6", "3.5.1.6.7"],
      kkk: ["6.3/14", "6.2/10"],
      examParts: [],
      contentPhase: 2,
    },
  }),

  ...moduleTopics("fundamentals", {
    "dc-circuits": {
      prerequisites: [],
      ptt: ["3.3.1.6.1"],
      kkk: ["6.2/6", "6.2/7"],
      examParts: ["base"],
      contentPhase: 1,
    },
    "ohms-law": {
      prerequisites: ["dc-circuits"],
      ptt: ["3.3.1.6.1"],
      kkk: ["6.2/7"],
      examParts: ["base"],
      contentPhase: 1,
    },
    "conductor-resistance": {
      prerequisites: ["ohms-law"],
      ptt: ["3.3.1.6.1"],
      kkk: ["6.2/7"],
      examParts: [],
      contentPhase: 1,
    },
    "series-parallel-circuits": {
      prerequisites: ["ohms-law"],
      ptt: ["3.3.1.6.1", "3.4.1.6.1"],
      kkk: [],
      examParts: ["base"],
      contentPhase: 1,
    },
    "voltage-sources": {
      prerequisites: ["series-parallel-circuits"],
      ptt: ["3.4.1.6.1"],
      kkk: [],
      examParts: [],
      contentPhase: 2,
    },
    "power-and-energy": {
      prerequisites: ["ohms-law"],
      ptt: ["3.3.1.6.1", "3.4.1.6.1"],
      kkk: [],
      examParts: ["III"],
      contentPhase: 1,
    },
    "electric-field-and-capacitors": {
      prerequisites: ["dc-circuits"],
      ptt: ["3.4.1.6.2"],
      kkk: [],
      examParts: [],
      contentPhase: 2,
    },
    "magnetism-and-induction": {
      prerequisites: ["dc-circuits"],
      ptt: ["3.4.1.6.3"],
      kkk: [],
      examParts: [],
      contentPhase: 2,
    },
    "ac-fundamentals": {
      prerequisites: ["ohms-law", "power-and-energy"],
      ptt: ["3.4.1.6.4"],
      kkk: [],
      examParts: ["III"],
      contentPhase: 1,
    },
    "three-phase-systems": {
      prerequisites: ["ac-fundamentals"],
      ptt: ["3.4.1.6.5"],
      kkk: [],
      examParts: ["III"],
      contentPhase: 1,
    },
    "measuring-instruments": {
      prerequisites: ["ohms-law"],
      ptt: ["3.3.1.6.5"],
      kkk: ["6.2/7"],
      examParts: ["base"],
      contentPhase: 1,
    },
    "power-electronics-basics": {
      prerequisites: ["ac-fundamentals"],
      ptt: ["3.4.2.6.1", "3.4.2.6.2", "3.4.2.6.3"],
      kkk: [],
      examParts: [],
      contentPhase: 3,
    },
    "logic-basics": {
      prerequisites: [],
      ptt: ["3.4.2.6.4", "3.3.1.6.5"],
      kkk: [],
      examParts: [],
      contentPhase: 3,
    },
  }),

  ...moduleTopics("documentation", {
    "wiring-diagrams": {
      prerequisites: ["dc-circuits"],
      ptt: ["3.3.1.6.2", "3.4.3.6.2"],
      kkk: ["6.2/6", "6.3/1"],
      examParts: ["I"],
      contentPhase: 1,
    },
  }),

  ...moduleTopics("installation", {
    "installation-planning": {
      prerequisites: ["wiring-diagrams", "installation-methods"],
      ptt: ["3.6.1.6.1", "3.6.2.6.1"],
      kkk: ["6.3/2"],
      examParts: ["I"],
      specialisations: BUILDING,
      contentPhase: 2,
    },
    "conductors-and-cross-section": {
      prerequisites: ["conductor-resistance"],
      ptt: ["3.6.1.6.2"],
      kkk: ["6.3/1"],
      examParts: ["I"],
      contentPhase: 1,
    },
    "cables-and-cable-laying": {
      prerequisites: ["conductors-and-cross-section"],
      ptt: ["3.6.1.6.2", "3.10.1.6.3"],
      kkk: ["6.3/5", "6.3/6", "6.4.2/6", "6.4.2/7", "6.4.2/8"],
      examParts: ["I", "II"],
      contentPhase: 2,
    },
    "installation-methods": {
      prerequisites: ["conductors-and-cross-section"],
      ptt: ["3.6.1.6.4"],
      kkk: ["6.3/2", "6.4.2/1"],
      examParts: ["II"],
      contentPhase: 1,
    },
    "lighting-circuits": {
      prerequisites: ["wiring-diagrams"],
      ptt: ["3.3.1.6.3", "3.6.1.6.6"],
      kkk: ["6.4.2/4"],
      examParts: [],
      specialisations: BUILDING,
      contentPhase: 1,
    },
    "building-controls": {
      prerequisites: ["lighting-circuits"],
      ptt: ["3.6.2.6.2"],
      kkk: ["6.4.2/4", "6.4.2/5"],
      examParts: [],
      specialisations: BUILDING,
      contentPhase: 2,
    },
    "building-automation": {
      prerequisites: ["building-controls"],
      ptt: ["3.6.2.6.3"],
      kkk: ["6.4.2/2"],
      examParts: [],
      specialisations: BUILDING,
      contentPhase: 3,
    },
    "distribution-boards": {
      prerequisites: ["overcurrent-protection", "rcd-protection"],
      ptt: ["3.6.1.6.1", "3.8.1.6.6"],
      kkk: ["6.4.2/10"],
      examParts: ["project"],
      contentPhase: 1,
    },
    "service-connection-and-metering": {
      prerequisites: ["supply-systems", "distribution-boards"],
      ptt: ["3.10.1.6.4"],
      kkk: ["6.3/3", "6.3/4"],
      examParts: ["project"],
      safetyCritical: true,
      contentPhase: 1,
    },
    "motor-control": {
      prerequisites: ["three-phase-systems", "wiring-diagrams"],
      ptt: ["3.3.1.6.3", "3.8.1.6.4"],
      kkk: ["6.3/7"],
      examParts: ["II"],
      contentPhase: 2,
    },
    "photovoltaic-systems": {
      prerequisites: ["ac-fundamentals", "shock-protection", "isolation-procedure"],
      ptt: ["3.9.2.6.2"],
      kkk: ["6.3/8"],
      examParts: ["IV"],
      safetyCritical: true,
      contentPhase: 2,
    },
    "temporary-site-supply": {
      prerequisites: ["distribution-boards", "shock-protection"],
      ptt: [],
      kkk: ["6.4.2/9"],
      examParts: [],
      specialisations: BUILDING,
      contentPhase: 3,
    },
    "power-system": {
      prerequisites: ["three-phase-systems"],
      ptt: ["3.10.1.6.1", "3.10.1.6.2"],
      kkk: [],
      examParts: [],
      contentPhase: 2,
    },
  }),

  ...moduleTopics("sizing-and-protection", {
    "supply-systems": {
      prerequisites: ["three-phase-systems"],
      ptt: ["3.5.1.6.2", "3.10.1.6.2"],
      kkk: ["6.4.2/11"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "voltage-drop": {
      prerequisites: ["conductor-resistance", "conductors-and-cross-section"],
      ptt: ["3.6.1.6.2"],
      kkk: ["6.3/5"],
      examParts: ["III"],
      contentPhase: 1,
    },
    "current-carrying-capacity": {
      prerequisites: ["conductors-and-cross-section"],
      ptt: ["3.6.1.6.2"],
      kkk: ["6.3/5"],
      examParts: ["III"],
      contentPhase: 1,
    },
    "overcurrent-protection": {
      prerequisites: ["current-carrying-capacity"],
      ptt: ["3.6.1.6.5"],
      kkk: ["6.2/8", "6.4.2/12"],
      examParts: [],
      contentPhase: 1,
    },
    "shock-protection": {
      prerequisites: ["electrical-safety-basics", "supply-systems"],
      ptt: ["3.5.1.6.1", "3.5.1.6.2", "3.6.1.6.3"],
      kkk: ["6.3/9", "6.4.2/3"],
      examParts: ["IV", "project"],
      safetyCritical: true,
      contentPhase: 1,
    },
    "earthing-and-bonding": {
      prerequisites: ["shock-protection"],
      ptt: ["3.5.1.6.2", "3.5.1.6.4"],
      kkk: ["6.4.2/11"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "rcd-protection": {
      prerequisites: ["shock-protection"],
      ptt: ["3.5.1.6.2", "3.6.1.6.3"],
      kkk: ["6.2/8", "6.4.2/12"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "lightning-protection": {
      prerequisites: ["earthing-and-bonding"],
      ptt: ["3.5.1.6.4", "3.6.2.6.4"],
      kkk: ["6.3/11"],
      examParts: ["IV"],
      contentPhase: 2,
    },
    "surge-protection": {
      prerequisites: ["lightning-protection"],
      ptt: ["3.5.1.6.5", "3.6.2.6.5"],
      kkk: ["6.3/10"],
      examParts: ["IV"],
      contentPhase: 2,
    },
  }),

  ...moduleTopics("machines", {
    transformers: {
      prerequisites: ["magnetism-and-induction", "ac-fundamentals"],
      ptt: ["3.4.1.6.3", "3.8.1.6.2"],
      kkk: ["6.4.3/1", "6.4.3/6"],
      examParts: [],
      contentPhase: 2,
    },
    "electric-motors": {
      prerequisites: ["three-phase-systems", "magnetism-and-induction"],
      ptt: ["3.4.1.6.5", "3.8.1.6.3", "3.8.1.6.4", "3.8.1.6.5"],
      kkk: ["6.3/7"],
      examParts: [],
      contentPhase: 2,
    },
  }),

  ...moduleTopics("verification", {
    "initial-verification": {
      prerequisites: ["shock-protection", "measuring-instruments"],
      ptt: ["3.5.1.6.3", "3.6.2.6.6"],
      kkk: ["6.3/9", "6.4.2/3"],
      examParts: ["IV"],
      safetyCritical: true,
      contentPhase: 1,
    },
    "continuity-of-pe": {
      prerequisites: ["initial-verification", "earthing-and-bonding"],
      ptt: ["3.5.1.6.3", "3.6.2.6.6"],
      kkk: ["6.4.2/3"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "insulation-resistance": {
      prerequisites: ["initial-verification"],
      ptt: ["3.5.1.6.3", "3.6.2.6.6"],
      kkk: ["6.4.2/3"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "loop-impedance": {
      prerequisites: ["initial-verification", "overcurrent-protection"],
      ptt: ["3.5.1.6.3"],
      kkk: ["6.4.2/3"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "rcd-testing": {
      prerequisites: ["initial-verification", "rcd-protection"],
      ptt: ["3.5.1.6.3", "3.6.2.6.6"],
      kkk: ["6.4.2/3"],
      examParts: [],
      safetyCritical: true,
      contentPhase: 1,
    },
    "earth-resistance": {
      prerequisites: ["initial-verification", "earthing-and-bonding"],
      ptt: ["3.5.1.6.3", "3.5.1.6.4"],
      kkk: [],
      examParts: [],
      contentPhase: 2,
    },
    "measurement-report": {
      prerequisites: ["initial-verification"],
      ptt: ["3.6.2.6.6"],
      kkk: ["6.2/9", "6.4.2/3"],
      examParts: [],
      contentPhase: 1,
    },
  }),

  ...moduleTopics("other-specialisations", {
    "overhead-lines": {
      prerequisites: ["power-system"],
      ptt: ["3.11.2.6.1"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    "network-switchgear": {
      prerequisites: ["power-system"],
      ptt: ["3.11.2.6.2"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    substations: {
      prerequisites: ["transformers", "power-system"],
      ptt: ["3.11.2.6.3"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    "network-earthing": {
      prerequisites: ["earthing-and-bonding"],
      ptt: ["3.11.2.6.4"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    "public-lighting": {
      prerequisites: ["lighting-circuits", "power-system"],
      ptt: ["3.11.2.6.5"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    "network-operation": {
      prerequisites: ["isolation-procedure", "power-system"],
      ptt: ["3.11.2.6.6", "3.11.2.6.7"],
      kkk: [],
      examParts: [],
      specialisations: ["network"],
      contentPhase: 3,
    },
    "industrial-distribution": {
      prerequisites: ["distribution-boards"],
      ptt: ["3.9.2.6.1", "3.9.2.6.2"],
      kkk: [],
      examParts: [],
      specialisations: ["equipment"],
      contentPhase: 3,
    },
    "power-factor-correction": {
      prerequisites: ["ac-fundamentals"],
      ptt: ["3.9.2.6.1"],
      kkk: [],
      examParts: [],
      specialisations: ["equipment"],
      contentPhase: 3,
    },
    "industrial-controls": {
      prerequisites: ["motor-control"],
      ptt: ["3.9.2.6.3"],
      kkk: [],
      examParts: [],
      specialisations: ["equipment"],
      contentPhase: 3,
    },
    "machine-maintenance": {
      prerequisites: ["electric-motors"],
      ptt: ["3.9.2.6.4"],
      kkk: [],
      examParts: [],
      specialisations: ["equipment"],
      contentPhase: 3,
    },
    "equipment-testing": {
      prerequisites: ["initial-verification"],
      ptt: ["3.9.2.6.5"],
      kkk: [],
      examParts: [],
      specialisations: ["equipment"],
      contentPhase: 3,
    },
  }),
];

const TOPICS_BY_ID = new Map<TopicId, Topic>(TOPICS.map((topic) => [topic.id, topic]));

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === "string" && TOPICS_BY_ID.has(value as TopicId);
}

export function getTopic(id: TopicId): Topic {
  const topic = TOPICS_BY_ID.get(id);
  if (!topic) {
    throw new Error(`Unknown topic: ${id}`);
  }
  return topic;
}

export function topicsByModule(module: ModuleId): readonly Topic[] {
  return TOPICS.filter((topic) => topic.module === module);
}

/** Syllabus order: by module, then by position inside the module. */
export function compareTopics(a: TopicId, b: TopicId): number {
  const left = getTopic(a);
  const right = getTopic(b);
  return (
    MODULES.indexOf(left.module) - MODULES.indexOf(right.module) || left.order - right.order
  );
}
