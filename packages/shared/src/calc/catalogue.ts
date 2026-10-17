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
  // P2 physics (K10)
  "ac-impedance",
  "capacitors",
  "inductors",
  "voltage-source",
  "transformer-ratio",
  "charge-current",
  "ac-values",
  "kirchhoff",
  "wheatstone-bridge",
  "meter-range-extension",
  "measurement-error",
  "motor-basics",
  "short-circuit-current",
  "illuminance",
  "pe-continuity-check",
  "material-list",
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
  "ac-impedance": define("ac-impedance", "ac-fundamentals"),
  capacitors: define("capacitors", "electric-field-and-capacitors"),
  inductors: define("inductors", "magnetism-and-induction"),
  "voltage-source": define("voltage-source", "voltage-sources"),
  "transformer-ratio": define("transformer-ratio", "transformers"),
  "charge-current": define("charge-current", "dc-circuits"),
  "ac-values": define("ac-values", "ac-fundamentals"),
  kirchhoff: define("kirchhoff", "series-parallel-circuits"),
  "wheatstone-bridge": define("wheatstone-bridge", "series-parallel-circuits"),
  "meter-range-extension": define("meter-range-extension", "measuring-instruments"),
  "measurement-error": define("measurement-error", "measuring-instruments"),
  "motor-basics": define("motor-basics", "electric-motors"),
  "short-circuit-current": define("short-circuit-current", "overcurrent-protection"),
  illuminance: define("illuminance", "lighting-circuits"),
  "pe-continuity-check": define("pe-continuity-check", "continuity-of-pe"),
  "material-list": define("material-list", "installation-planning"),
};

export function isCalculatorId(value: unknown): value is CalculatorId {
  return typeof value === "string" && (CALCULATOR_IDS as readonly string[]).includes(value);
}

export function getCalculatorDefinition(id: CalculatorId): CalculatorDefinition {
  return DEFINITIONS[id];
}
