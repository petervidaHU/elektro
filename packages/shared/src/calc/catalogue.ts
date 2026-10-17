import type { TopicId } from "../syllabus/topics.js";

/**
 * Calculators implemented in code (engine + page). Formulas never come from the
 * database (see CLAUDE.md, electrical correctness); the database only holds the
 * registry around them: whether and where a calculator is listed, its order,
 * topic and texts (plan §2.2, Q21). A new calculator is added here first, with
 * its engine and tests; teachers then add it to the list in the app.
 */
export const CALCULATOR_IDS = [
  "voltage-drop",
  "ohms-law",
  "equivalent-resistance",
  "power-dc",
  "load-demand",
  "power-ac-single",
  "power-three-phase",
  "connection-power",
  "phase-balancing",
] as const;

export type CalculatorId = (typeof CALCULATOR_IDS)[number];

export interface CalculatorDefinition {
  id: CalculatorId;
  /** Suggested topic when the calculator is added to the list. */
  defaultTopicId: TopicId;
  /** Page path below the locale prefix. */
  path: string;
}

const define = (id: CalculatorId, defaultTopicId: TopicId): CalculatorDefinition => ({
  id,
  defaultTopicId,
  path: `calculators/${id}`,
});

const DEFINITIONS: Record<CalculatorId, CalculatorDefinition> = {
  "voltage-drop": define("voltage-drop", "voltage-drop"),
  "ohms-law": define("ohms-law", "ohms-law"),
  "equivalent-resistance": define("equivalent-resistance", "series-parallel-circuits"),
  "power-dc": define("power-dc", "power-and-energy"),
  "load-demand": define("load-demand", "power-and-energy"),
  "power-ac-single": define("power-ac-single", "ac-fundamentals"),
  "power-three-phase": define("power-three-phase", "three-phase-systems"),
  "connection-power": define("connection-power", "service-connection-and-metering"),
  "phase-balancing": define("phase-balancing", "distribution-boards"),
};

export function isCalculatorId(value: unknown): value is CalculatorId {
  return typeof value === "string" && (CALCULATOR_IDS as readonly string[]).includes(value);
}

export function getCalculatorDefinition(id: CalculatorId): CalculatorDefinition {
  return DEFINITIONS[id];
}
