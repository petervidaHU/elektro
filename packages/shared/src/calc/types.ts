import type { FormulaId } from "./formulas.js";

/**
 * Units a calculation step can carry. These are IDs, not symbols: the UI maps
 * them to i18next keys (`unit.<id>`), so the symbol is localisable.
 */
export const UNITS = [
  "dimensionless",
  "ampere",
  "volt",
  "ohm",
  "watt",
  "metre",
  "squareMillimetre",
  "ohmSquareMillimetrePerMetre",
  "percent",
] as const;

export type Unit = (typeof UNITS)[number];

/**
 * One intermediate result of a calculation. The calculator shows every step,
 * and practice tasks ask the student to enter them one by one
 * (docs/DEVELOPMENT_PLAN.md §2.1).
 */
export interface CalcStep {
  /** Stable step ID, e.g. "conductor-resistance"; practice tasks refer to it. */
  id: string;
  /** SI value (or the domain unit the engine documents for the field). */
  value: number;
  unit: Unit;
  /** The formula used for this step, rendered from the registry. */
  formulaId: FormulaId;
}

/** What every engine function returns: the result plus how it was reached. */
export interface CalcResult<T> {
  result: T;
  steps: CalcStep[];
}
