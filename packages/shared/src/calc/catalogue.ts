import type { TopicId } from "../syllabus/topics.js";

/**
 * Calculators implemented in code (engine + page). Formulas never come from the
 * database (see CLAUDE.md, electrical correctness); the database only holds the
 * registry around them: whether and where a calculator is listed, its order,
 * topic and texts (plan §2.2, Q21). A new calculator is added here first, with
 * its engine and tests; teachers then add it to the list in the app.
 */
export const CALCULATOR_IDS = ["voltage-drop"] as const;

export type CalculatorId = (typeof CALCULATOR_IDS)[number];

export interface CalculatorDefinition {
  id: CalculatorId;
  /** Suggested topic when the calculator is added to the list. */
  defaultTopicId: TopicId;
  /** Page path below the locale prefix. */
  path: string;
}

const DEFINITIONS: Record<CalculatorId, CalculatorDefinition> = {
  "voltage-drop": {
    id: "voltage-drop",
    defaultTopicId: "voltage-drop",
    path: "calculators/voltage-drop",
  },
};

export function isCalculatorId(value: unknown): value is CalculatorId {
  return typeof value === "string" && (CALCULATOR_IDS as readonly string[]).includes(value);
}

export function getCalculatorDefinition(id: CalculatorId): CalculatorDefinition {
  return DEFINITIONS[id];
}
