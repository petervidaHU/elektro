import type { CalcResult, CalcStep } from "./types.js";
import { CalculationInputError } from "./voltage-drop.js";

/**
 * P2 physics calculators (plan §2.2, K10): AC impedance, capacitors, inductors,
 * real voltage source, transformer, charge, AC values. Textbook identities
 * only; each function documents its formulas. SI units throughout.
 */

function positive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new CalculationInputError(field);
  return value;
}

function nonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new CalculationInputError(field);
  return value;
}

type Step = CalcStep;
const step = (id: string, value: number, unit: Step["unit"], formulaId: Step["formulaId"]): Step => ({ id, value, unit, formulaId });

// ---- series RLC impedance ----------------------------------------------------

export interface AcImpedanceInput {
  resistance_ohm: number;
  /** Omit for no inductor. */
  inductance_H?: number;
  /** Omit for no capacitor. */
  capacitance_F?: number;
  frequency_Hz: number;
  voltage_V: number;
}

export interface AcImpedanceResult {
  inductiveReactance_ohm: number;
  capacitiveReactance_ohm: number;
  impedance_ohm: number;
  current_A: number;
  /** cos(phi) = R / Z. */
  powerFactor: number;
  /** Positive when inductive, negative when capacitive, degrees. */
  phaseAngle_deg: number;
  resistorVoltage_V: number;
  inductorVoltage_V: number;
  capacitorVoltage_V: number;
}

/**
 * Series R, L, C on a sinusoidal supply: X_L = 2 pi f L, X_C = 1 / (2 pi f C),
 * Z = sqrt(R^2 + (X_L - X_C)^2), I = U / Z, phi = atan((X_L - X_C) / R).
 */
export function calculateAcImpedance(input: AcImpedanceInput): CalcResult<AcImpedanceResult> {
  const r = positive(input.resistance_ohm, "resistance_ohm");
  const f = positive(input.frequency_Hz, "frequency_Hz");
  const u = positive(input.voltage_V, "voltage_V");
  const xl = input.inductance_H === undefined ? 0 : 2 * Math.PI * f * positive(input.inductance_H, "inductance_H");
  const xc = input.capacitance_F === undefined ? 0 : 1 / (2 * Math.PI * f * positive(input.capacitance_F, "capacitance_F"));

  const z = Math.sqrt(r * r + (xl - xc) ** 2);
  const i = u / z;
  const phi = (Math.atan2(xl - xc, r) * 180) / Math.PI;

  const steps: Step[] = [];
  if (input.inductance_H !== undefined) steps.push(step("inductive-reactance", xl, "ohm", "inductive-reactance"));
  if (input.capacitance_F !== undefined) steps.push(step("capacitive-reactance", xc, "ohm", "capacitive-reactance"));
  steps.push(
    step("impedance", z, "ohm", "series-impedance"),
    step("current", i, "ampere", "ohms-law-current"),
    step("phase-angle", phi, "degree", "impedance-phase-angle"),
    step("power-factor", r / z, "dimensionless", "impedance-power-factor"),
  );

  return {
    result: {
      inductiveReactance_ohm: xl,
      capacitiveReactance_ohm: xc,
      impedance_ohm: z,
      current_A: i,
      powerFactor: r / z,
      phaseAngle_deg: phi,
      resistorVoltage_V: i * r,
      inductorVoltage_V: i * xl,
      capacitorVoltage_V: i * xc,
    },
    steps,
  };
}

// ---- capacitors ----------------------------------------------------------------

export type CombineMode = "single" | "series" | "parallel";

/** The validated parts of a combination: one for `single`, two or more otherwise. */
function parts(mode: CombineMode, values: readonly number[], field: string): number[] {
  const list = values.map((value) => positive(value, field));
  if (mode === "single" ? list.length !== 1 : list.length < 2) throw new CalculationInputError(field);
  return list;
}

/** Series of reciprocal quantities (C in series, L in parallel) or plain sum. */
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
const reciprocalSum = (values: readonly number[]) => 1 / values.reduce((total, value) => total + 1 / value, 0);

export interface CapacitorsInput {
  mode: CombineMode;
  capacitances_F: number[];
  voltage_V: number;
  /** For the time constant and the charging curve. */
  resistance_ohm?: number;
  time_s?: number;
}

export interface CapacitorsResult {
  capacitance_F: number;
  charge_C: number;
  energy_J: number;
  timeConstant_s?: number;
  chargingVoltage_V?: number;
  dischargingVoltage_V?: number;
}

/** C of the combination, Q = C U, W = C U^2 / 2, tau = R C and u(t) while charging or discharging through R. */
export function calculateCapacitors(input: CapacitorsInput): CalcResult<CapacitorsResult> {
  const list = parts(input.mode, input.capacitances_F, "capacitances_F");
  const c = input.mode === "single" ? list[0]! : input.mode === "parallel" ? sum(list) : reciprocalSum(list);
  const u = positive(input.voltage_V, "voltage_V");

  const steps: Step[] = [];
  if (input.mode !== "single") {
    steps.push(step("capacitance", c, "farad", input.mode === "series" ? "series-capacitance" : "parallel-capacitance"));
  }
  const charge = c * u;
  const energy = (c * u * u) / 2;
  steps.push(step("charge", charge, "coulomb", "capacitor-charge"), step("energy", energy, "joule", "capacitor-energy"));

  const result: CapacitorsResult = { capacitance_F: c, charge_C: charge, energy_J: energy };
  if (input.resistance_ohm !== undefined) {
    const tau = positive(input.resistance_ohm, "resistance_ohm") * c;
    result.timeConstant_s = tau;
    steps.push(step("time-constant", tau, "second", "rc-time-constant"));
    if (input.time_s !== undefined) {
      const t = nonNegative(input.time_s, "time_s");
      result.chargingVoltage_V = u * (1 - Math.exp(-t / tau));
      result.dischargingVoltage_V = u * Math.exp(-t / tau);
      steps.push(
        step("charging-voltage", result.chargingVoltage_V, "volt", "capacitor-charging"),
        step("discharging-voltage", result.dischargingVoltage_V, "volt", "capacitor-discharging"),
      );
    }
  }
  return { result, steps };
}

// ---- inductors -----------------------------------------------------------------

export interface InductorsInput {
  mode: CombineMode;
  inductances_H: number[];
  /** For the stored energy. */
  current_A: number;
  /** For the time constant and the rising current. */
  resistance_ohm?: number;
  voltage_V?: number;
  time_s?: number;
}

export interface InductorsResult {
  inductance_H: number;
  energy_J: number;
  timeConstant_s?: number;
  risingCurrent_A?: number;
}

/** L of the combination (no mutual coupling), W = L I^2 / 2, tau = L / R, i(t) = (U / R)(1 - e^(-t / tau)). */
export function calculateInductors(input: InductorsInput): CalcResult<InductorsResult> {
  const list = parts(input.mode, input.inductances_H, "inductances_H");
  const l = input.mode === "single" ? list[0]! : input.mode === "series" ? sum(list) : reciprocalSum(list);
  const i = positive(input.current_A, "current_A");

  const steps: Step[] = [];
  if (input.mode !== "single") {
    steps.push(step("inductance", l, "henry", input.mode === "series" ? "series-inductance" : "parallel-inductance"));
  }
  const energy = (l * i * i) / 2;
  steps.push(step("energy", energy, "joule", "inductor-energy"));

  const result: InductorsResult = { inductance_H: l, energy_J: energy };
  if (input.resistance_ohm !== undefined) {
    const r = positive(input.resistance_ohm, "resistance_ohm");
    const tau = l / r;
    result.timeConstant_s = tau;
    steps.push(step("time-constant", tau, "second", "rl-time-constant"));
    if (input.voltage_V !== undefined && input.time_s !== undefined) {
      result.risingCurrent_A = (positive(input.voltage_V, "voltage_V") / r) * (1 - Math.exp(-nonNegative(input.time_s, "time_s") / tau));
      steps.push(step("rising-current", result.risingCurrent_A, "ampere", "inductor-current-rise"));
    }
  }
  return { result, steps };
}

// ---- real voltage source -------------------------------------------------------

export interface VoltageSourceInput {
  emf_V: number;
  internalResistance_ohm: number;
  /** Omit to see only the short-circuit and matching values. */
  loadResistance_ohm?: number;
}

export interface VoltageSourceResult {
  shortCircuitCurrent_A: number;
  /** The load resistance that receives the most power: equal to the internal resistance. */
  matchedLoad_ohm: number;
  maxPower_W: number;
  current_A?: number;
  terminalVoltage_V?: number;
  loadPower_W?: number;
  efficiency?: number;
}

/**
 * Real source: I = E / (Ri + R), U = E - Ri I, short circuit I_k = E / Ri,
 * maximum power transfer at R = Ri with P_max = E^2 / (4 Ri), eta = R / (R + Ri).
 */
export function calculateVoltageSource(input: VoltageSourceInput): CalcResult<VoltageSourceResult> {
  const e = positive(input.emf_V, "emf_V");
  const ri = positive(input.internalResistance_ohm, "internalResistance_ohm");
  const result: VoltageSourceResult = {
    shortCircuitCurrent_A: e / ri,
    matchedLoad_ohm: ri,
    maxPower_W: (e * e) / (4 * ri),
  };
  const steps: Step[] = [];

  if (input.loadResistance_ohm !== undefined) {
    const r = positive(input.loadResistance_ohm, "loadResistance_ohm");
    const i = e / (ri + r);
    result.current_A = i;
    result.terminalVoltage_V = e - ri * i;
    result.loadPower_W = result.terminalVoltage_V * i;
    result.efficiency = r / (r + ri);
    steps.push(
      step("current", i, "ampere", "source-current"),
      step("terminal-voltage", result.terminalVoltage_V, "volt", "terminal-voltage"),
      step("efficiency", result.efficiency, "dimensionless", "source-efficiency"),
    );
  }
  steps.push(
    step("short-circuit-current", result.shortCircuitCurrent_A, "ampere", "source-short-circuit-current"),
    step("maximum-power", result.maxPower_W, "watt", "maximum-power-transfer"),
  );
  return { result, steps };
}

// ---- ideal transformer ---------------------------------------------------------

export interface TransformerInput {
  primaryVoltage_V?: number;
  secondaryVoltage_V?: number;
  primaryTurns?: number;
  secondaryTurns?: number;
  /** Adds the primary current of an ideal (lossless) transformer. */
  secondaryCurrent_A?: number;
}

export interface TransformerResult {
  primaryVoltage_V: number;
  secondaryVoltage_V: number;
  primaryTurns: number;
  secondaryTurns: number;
  /** N1 / N2 = U1 / U2. */
  turnsRatio: number;
  primaryCurrent_A?: number;
}

/** Exactly three of U1, U2, N1, N2 are given; the fourth follows from U1 / U2 = N1 / N2. Currents: I1 = I2 N2 / N1. */
export function solveTransformer(input: TransformerInput): CalcResult<TransformerResult> {
  const given = [input.primaryVoltage_V, input.secondaryVoltage_V, input.primaryTurns, input.secondaryTurns].filter((v) => v !== undefined);
  if (given.length !== 3) throw new CalculationInputError("transformer");
  given.forEach((value) => positive(value as number, "transformer"));

  let { primaryVoltage_V: u1, secondaryVoltage_V: u2, primaryTurns: n1, secondaryTurns: n2 } = input;
  let missing: Step | undefined;
  if (u2 === undefined) {
    u2 = (u1! * n2!) / n1!;
    missing = step("secondary-voltage", u2, "volt", "turns-ratio");
  } else if (u1 === undefined) {
    u1 = (u2 * n1!) / n2!;
    missing = step("primary-voltage", u1, "volt", "turns-ratio");
  } else if (n2 === undefined) {
    n2 = (n1! * u2) / u1;
    missing = step("secondary-turns", n2, "dimensionless", "turns-ratio");
  } else {
    n1 = (n2 * u1) / u2;
    missing = step("primary-turns", n1, "dimensionless", "turns-ratio");
  }

  const ratio = n1! / n2!;
  const result: TransformerResult = { primaryVoltage_V: u1!, secondaryVoltage_V: u2, primaryTurns: n1!, secondaryTurns: n2!, turnsRatio: ratio };
  const steps = [missing];
  if (input.secondaryCurrent_A !== undefined) {
    result.primaryCurrent_A = positive(input.secondaryCurrent_A, "secondaryCurrent_A") / ratio;
    steps.push(step("primary-current", result.primaryCurrent_A, "ampere", "transformer-current"));
  }
  return { result, steps };
}

// ---- charge ---------------------------------------------------------------------

export interface ChargeInput {
  charge_C?: number;
  current_A?: number;
  time_s?: number;
}

export interface ChargeResult {
  charge_C: number;
  current_A: number;
  time_s: number;
}

/** Q = I t, given any two. */
export function solveCharge(input: ChargeInput): CalcResult<ChargeResult> {
  const { charge_C: q, current_A: i, time_s: t } = input;
  if ([q, i, t].filter((v) => v !== undefined).length !== 2) throw new CalculationInputError("charge");
  if (q === undefined) {
    const value = positive(i!, "current_A") * positive(t!, "time_s");
    return { result: { charge_C: value, current_A: i!, time_s: t! }, steps: [step("charge", value, "coulomb", "charge")] };
  }
  if (i === undefined) {
    const value = positive(q, "charge_C") / positive(t!, "time_s");
    return { result: { charge_C: q, current_A: value, time_s: t! }, steps: [step("current", value, "ampere", "charge")] };
  }
  const value = positive(q, "charge_C") / positive(i, "current_A");
  return { result: { charge_C: q, current_A: i, time_s: value }, steps: [step("time", value, "second", "charge")] };
}

// ---- AC values ------------------------------------------------------------------

export interface AcValuesInput {
  /** Give the RMS or the peak value. */
  rms_V?: number;
  peak_V?: number;
  /** Give the frequency or the period (optional). */
  frequency_Hz?: number;
  period_s?: number;
}

export interface AcValuesResult {
  rms_V: number;
  peak_V: number;
  frequency_Hz?: number;
  period_s?: number;
  angularFrequency_rad_s?: number;
}

/** U_m = U sqrt(2), f = 1 / T, omega = 2 pi f. */
export function calculateAcValues(input: AcValuesInput): CalcResult<AcValuesResult> {
  if ((input.rms_V === undefined) === (input.peak_V === undefined)) throw new CalculationInputError("acValues");
  const rms = input.rms_V ?? positive(input.peak_V!, "peak_V") / Math.SQRT2;
  const peak = input.peak_V ?? positive(input.rms_V!, "rms_V") * Math.SQRT2;
  const result: AcValuesResult = { rms_V: rms, peak_V: peak };
  const steps: Step[] = [step("peak-value", peak, "volt", "peak-value")];

  if (input.frequency_Hz !== undefined && input.period_s !== undefined) throw new CalculationInputError("acValues");
  const f = input.frequency_Hz ?? (input.period_s !== undefined ? 1 / positive(input.period_s, "period_s") : undefined);
  if (f !== undefined) {
    positive(f, "frequency_Hz");
    result.frequency_Hz = f;
    result.period_s = 1 / f;
    result.angularFrequency_rad_s = 2 * Math.PI * f;
    steps.push(
      step("frequency", f, "hertz", "period-frequency"),
      step("angular-frequency", result.angularFrequency_rad_s, "dimensionless", "angular-frequency"),
    );
  }
  return { result, steps };
}
