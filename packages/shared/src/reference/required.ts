import type { TableStatus } from "./tables.js";

/**
 * Reference tables a planned calculator cannot work without (plan §2.3, K9).
 * Only the keys and what they are for are fixed here - never a value. A teacher
 * creates each table with its source and verifies it; until every table of a
 * calculator is verified, the calculator stays "Hamarosan" and the teacher area
 * says what is missing.
 */
export const REQUIRED_TABLES = [
  { key: "current-carrying-capacity" },
  { key: "correction-factor-ambient-temperature" },
  { key: "correction-factor-grouping" },
  { key: "permitted-voltage-drop" },
] as const;

export type RequiredTableKey = (typeof REQUIRED_TABLES)[number]["key"];

export interface PlannedCalculator {
  id: string;
  requiresTables: readonly RequiredTableKey[];
}

/** Calculators that exist in the plan but wait for verified tables (not in `CALCULATOR_IDS` yet). */
export const PLANNED_CALCULATORS: readonly PlannedCalculator[] = [
  {
    id: "cable-selection",
    requiresTables: [
      "current-carrying-capacity",
      "correction-factor-ambient-temperature",
      "correction-factor-grouping",
      "permitted-voltage-drop",
    ],
  },
];

export type RequirementState = "missing" | "unverified" | "verified";

export interface ListedTableState {
  key: string;
  latest: { status: TableStatus };
  /** Version of the verified table students get, if any. */
  liveVersion: number | null;
}

/** For each required key: no table yet, a table nobody verified, or a live verified one. */
export function requirementStates(
  keys: readonly string[],
  listed: readonly ListedTableState[],
): { key: string; state: RequirementState }[] {
  return keys.map((key) => {
    const table = listed.find((item) => item.key === key);
    if (!table) return { key, state: "missing" as const };
    return { key, state: table.liveVersion !== null || table.latest.status === "verified" ? ("verified" as const) : ("unverified" as const) };
  });
}

export const unmetRequirements = (states: readonly { key: string; state: RequirementState }[]) =>
  states.filter((item) => item.state !== "verified");
