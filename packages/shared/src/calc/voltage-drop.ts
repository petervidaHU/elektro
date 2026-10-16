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

function requirePowerFactor(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new CalculationInputError("powerFactor");
  }
  return value;
}

/*
 * The calculation as separate steps. Practice tasks check a student's answer
 * for each step against these functions, fed with the student's own earlier
 * answers (docs/DEVELOPMENT_PLAN.md §2.5) - so the maths lives only here.
 */

/** b of Annex G: 2 for single-phase (out and back), sqrt(3) for balanced three-phase. */
export function phaseFactor(system: PhaseSystem): number {
  const factor = PHASE_FACTORS[system];
  if (factor === undefined) {
    throw new CalculationInputError("system");
  }
  return factor;
}

/** R = rho * L / S: resistance of one conductor, ohm (rho in ohm*mm2/m, L in m, S in mm2). */
export function conductorResistance(
  resistivity_ohm_mm2_per_m: number,
  length_m: number,
  crossSection_mm2: number,
): number {
  return (
    (requirePositive(resistivity_ohm_mm2_per_m, "resistivity_ohm_mm2_per_m") *
      requirePositive(length_m, "length_m")) /
    requirePositive(crossSection_mm2, "crossSection_mm2")
  );
}

/** dU = b * R * I * cos(phi), V. */
export function voltageDropFromResistance(
  phaseFactor_: number,
  conductorResistance_ohm: number,
  current_A: number,
  powerFactor: number,
): number {
  return (
    requirePositive(phaseFactor_, "phaseFactor") *
    requirePositive(conductorResistance_ohm, "conductorResistance_ohm") *
    requirePositive(current_A, "current_A") *
    requirePowerFactor(powerFactor)
  );
}

/** dU% = dU / Un * 100. */
export function voltageDropPercentOf(voltageDrop_V: number, nominalVoltage_V: number): number {
  return (
    (requirePositive(voltageDrop_V, "voltageDrop_V") /
      requirePositive(nominalVoltage_V, "nominalVoltage_V")) *
    100
  );
}

/** dUmax = dU%max * Un / 100: a permitted drop given in percent, in volts. */
export function permittedVoltageDrop(limitPercent: number, nominalVoltage_V: number): number {
  return (
    (requirePositive(limitPercent, "limitPercent") *
      requirePositive(nominalVoltage_V, "nominalVoltage_V")) /
    100
  );
}

/**
 * Smin = b * rho * L * I * cos(phi) / dUmax: the cross-section (mm2,
 * unrounded) at which the drop equals dUmax. Round up with
 * `nextStandardCrossSection`.
 */
export function minimumCrossSection(
  phaseFactor_: number,
  resistivity_ohm_mm2_per_m: number,
  length_m: number,
  current_A: number,
  powerFactor: number,
  permittedVoltageDrop_V: number,
): number {
  return (
    (requirePositive(phaseFactor_, "phaseFactor") *
      requirePositive(resistivity_ohm_mm2_per_m, "resistivity_ohm_mm2_per_m") *
      requirePositive(length_m, "length_m") *
      requirePositive(current_A, "current_A") *
      requirePowerFactor(powerFactor)) /
    requirePositive(permittedVoltageDrop_V, "permittedVoltageDrop_V")
  );
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
  const b = phaseFactor(input.system);
  const resistance = conductorResistance(
    input.resistivity_ohm_mm2_per_m,
    input.length_m,
    input.crossSection_mm2,
  );
  const voltageDrop_V = voltageDropFromResistance(
    b,
    resistance,
    input.current_A,
    input.powerFactor ?? 1,
  );
  const voltageDropPercent = voltageDropPercentOf(voltageDrop_V, input.nominalVoltage_V);

  return {
    result: { voltageDrop_V, voltageDropPercent, phaseFactor: b },
    steps: [
      {
        id: "phase-factor",
        value: b,
        unit: "dimensionless",
        formulaId:
          input.system === "three-phase" ? "phase-factor-three-phase" : "phase-factor-single-phase",
      },
      {
        id: "conductor-resistance",
        value: resistance,
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
  return minimumCrossSection(
    phaseFactor(input.system),
    input.resistivity_ohm_mm2_per_m,
    input.length_m,
    input.current_A,
    input.powerFactor ?? 1,
    permittedVoltageDrop(limitPercent, input.nominalVoltage_V),
  );
}
