import type { CalcResult } from "./types.js";

/**
 * Voltage drop (feszültségesés) on a cable run.
 *
 * Model: resistive voltage drop only, the simplified form of
 * MSZ HD 60364-5-52:2014 Annex G
 *
 *     dU = b * rho * (L / S) * I * cos(phi)
 *
 * where b = 2 for single-phase (and DC) circuits - current flows out and back -
 * and b = sqrt(3) for balanced three-phase circuits, L is the one-way route
 * length, S the nominal cross-section and rho the conductor resistivity.
 *
 * The reactive term of Annex G (lambda * L * sin(phi)) is deliberately NOT
 * modelled: it is negligible for the small cross-sections used in domestic
 * installations and the training's calculation exercises omit it. Do not extend
 * this function to large cross-sections without adding that term.
 *
 * Units: SI for current (A), length (m) and voltage (V). Cross-section stays in
 * mm2 and resistivity in ohm*mm2/m - the units the domain tabulates them in -
 * which is why both carry the unit in the field name.
 */
export const PHASE_SYSTEMS = ["single-phase", "three-phase"] as const;

export type PhaseSystem = (typeof PHASE_SYSTEMS)[number];

/** b factor of Annex G: 2 for single-phase, sqrt(3) for three-phase. */
export const PHASE_FACTORS: Record<PhaseSystem, number> = {
  "single-phase": 2,
  "three-phase": Math.sqrt(3),
};

export interface VoltageDropInput {
  /** Load current, A. */
  current_A: number;
  /** One-way route length of the cable, m. */
  length_m: number;
  /** Nominal conductor cross-section, mm2. */
  crossSection_mm2: number;
  /**
   * Conductor resistivity, ohm*mm2/m. Explicit on purpose - see
   * `reference/conductors.ts` for the tabulated values and their source.
   */
  resistivity_ohm_mm2_per_m: number;
  /** Nominal voltage of the circuit, V (230 line-to-neutral, 400 line-to-line). */
  nominalVoltage_V: number;
  system: PhaseSystem;
  /** cos(phi); defaults to 1 (purely resistive load). */
  powerFactor?: number;
}

export interface VoltageDropResult {
  /** Absolute voltage drop, V. */
  voltageDrop_V: number;
  /** Voltage drop relative to the nominal voltage, in percent. */
  voltageDropPercent: number;
  /** The b factor used, so a practice task can check the student's step. */
  phaseFactor: number;
}

export class CalculationInputError extends Error {
  readonly field: string;

  constructor(field: string) {
    super(`Invalid value for "${field}"`);
    this.name = "CalculationInputError";
    this.field = field;
  }
}

function requirePositive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new CalculationInputError(field);
  }
  return value;
}

/**
 * Returns the drop plus the steps a student works through:
 *
 *     b  -> R = rho * L / S  -> dU = b * R * I * cos(phi)  -> dU% = dU / Un * 100
 *
 * which is the Annex G formula above, split at the conductor resistance R of
 * one conductor.
 */
export function calculateVoltageDrop(input: VoltageDropInput): CalcResult<VoltageDropResult> {
  const current = requirePositive(input.current_A, "current_A");
  const length = requirePositive(input.length_m, "length_m");
  const crossSection = requirePositive(input.crossSection_mm2, "crossSection_mm2");
  const resistivity = requirePositive(
    input.resistivity_ohm_mm2_per_m,
    "resistivity_ohm_mm2_per_m",
  );
  const nominalVoltage = requirePositive(input.nominalVoltage_V, "nominalVoltage_V");

  const powerFactor = input.powerFactor ?? 1;
  if (!Number.isFinite(powerFactor) || powerFactor <= 0 || powerFactor > 1) {
    throw new CalculationInputError("powerFactor");
  }

  const phaseFactor = PHASE_FACTORS[input.system];
  if (phaseFactor === undefined) {
    throw new CalculationInputError("system");
  }

  const conductorResistance_ohm = (resistivity * length) / crossSection;
  const voltageDrop_V = phaseFactor * conductorResistance_ohm * current * powerFactor;
  const voltageDropPercent = (voltageDrop_V / nominalVoltage) * 100;

  return {
    result: { voltageDrop_V, voltageDropPercent, phaseFactor },
    steps: [
      {
        id: "phase-factor",
        value: phaseFactor,
        unit: "dimensionless",
        formulaId:
          input.system === "three-phase" ? "phase-factor-three-phase" : "phase-factor-single-phase",
      },
      {
        id: "conductor-resistance",
        value: conductorResistance_ohm,
        unit: "ohm",
        formulaId: "conductor-resistance",
      },
      { id: "voltage-drop", value: voltageDrop_V, unit: "volt", formulaId: "voltage-drop" },
      {
        id: "voltage-drop-percent",
        value: voltageDropPercent,
        unit: "percent",
        formulaId: "voltage-drop-percent",
      },
    ],
  };
}

/**
 * Compares a computed drop against a permitted limit.
 *
 * The limit is an explicit input: permitted voltage drop depends on the
 * installation type and on what the training teaches, so no limit value is
 * hard-coded here. Supply it from approved reference content.
 */
export function isWithinVoltageDropLimit(
  result: VoltageDropResult,
  limitPercent: number,
): boolean {
  return result.voltageDropPercent <= requirePositive(limitPercent, "limitPercent");
}

/**
 * Smallest cross-section (mm2, unrounded) that keeps the drop at or below
 * `limitPercent`. Round up to a standard size with
 * `nextStandardCrossSection`.
 */
export function requiredCrossSectionForLimit(
  input: Omit<VoltageDropInput, "crossSection_mm2">,
  limitPercent: number,
): number {
  const limit = requirePositive(limitPercent, "limitPercent");
  const { result: unit } = calculateVoltageDrop({ ...input, crossSection_mm2: 1 });

  // dU% is inversely proportional to S, so S_min = dU%(S = 1 mm2) / limit%.
  return unit.voltageDropPercent / limit;
}
