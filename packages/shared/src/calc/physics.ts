import type { CalcResult, CalcStep } from "./types.js";
import { CalculationInputError } from "./voltage-drop.js";

/**
 * Textbook physics calculators (plan §2.2, K7): Ohm's law, series and
 * parallel resistance, DC power and energy, AC power. Only identities that
 * need no table or standard; each function documents its formula. SI units
 * throughout (V, A, ohm, W, VA, var); energy is returned in kWh because that
 * is the unit the domain bills in.
 */

function positive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new CalculationInputError(field);
  return value;
}

function powerFactorOf(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > 1) throw new CalculationInputError("powerFactor");
  return value;
}

/** U = I * R, V. */
export const voltageFromCurrentResistance = (current_A: number, resistance_ohm: number) =>
  positive(current_A, "current_A") * positive(resistance_ohm, "resistance_ohm");

/** I = U / R, A. */
export const currentFromVoltageResistance = (voltage_V: number, resistance_ohm: number) =>
  positive(voltage_V, "voltage_V") / positive(resistance_ohm, "resistance_ohm");

/** R = U / I, ohm. */
export const resistanceFromVoltageCurrent = (voltage_V: number, current_A: number) =>
  positive(voltage_V, "voltage_V") / positive(current_A, "current_A");

export interface OhmsLawInput {
  voltage_V?: number;
  current_A?: number;
  resistance_ohm?: number;
}

export interface OhmsLawResult {
  voltage_V: number;
  current_A: number;
  resistance_ohm: number;
}

/** Exactly two of U, I, R are given; the third is calculated. */
export function solveOhmsLaw(input: OhmsLawInput): CalcResult<OhmsLawResult> {
  const { voltage_V: u, current_A: i, resistance_ohm: r } = input;
  const given = [u, i, r].filter((value) => value !== undefined).length;
  if (given !== 2) throw new CalculationInputError("ohmsLaw");

  if (u !== undefined && i !== undefined) {
    const resistance = resistanceFromVoltageCurrent(u, i);
    return {
      result: { voltage_V: u, current_A: i, resistance_ohm: resistance },
      steps: [{ id: "resistance", value: resistance, unit: "ohm", formulaId: "ohms-law-resistance" }],
    };
  }
  if (u !== undefined && r !== undefined) {
    const current = currentFromVoltageResistance(u, r);
    return {
      result: { voltage_V: u, current_A: current, resistance_ohm: r },
      steps: [{ id: "current", value: current, unit: "ampere", formulaId: "ohms-law-current" }],
    };
  }
  const voltage = voltageFromCurrentResistance(i!, r!);
  return {
    result: { voltage_V: voltage, current_A: i!, resistance_ohm: r! },
    steps: [{ id: "voltage", value: voltage, unit: "volt", formulaId: "ohms-law-voltage" }],
  };
}

function resistances(values: readonly number[]): number[] {
  if (values.length < 2) throw new CalculationInputError("resistances_ohm");
  return values.map((value) => positive(value, "resistances_ohm"));
}

/** R = R1 + R2 + ..., ohm. */
export const seriesResistance = (values: readonly number[]) =>
  resistances(values).reduce((sum, value) => sum + value, 0);

/** 1/R = 1/R1 + 1/R2 + ..., ohm. */
export const parallelResistance = (values: readonly number[]) =>
  1 / resistances(values).reduce((sum, value) => sum + 1 / value, 0);

export interface SeriesCircuitInput {
  supplyVoltage_V: number;
  resistances_ohm: number[];
}

export interface SeriesCircuitResult {
  totalResistance_ohm: number;
  current_A: number;
  /** Voltage across each resistor (voltage divider). */
  voltages_V: number[];
}

/** Series circuit: one current, the supply voltage divides in proportion to R. */
export function solveSeriesCircuit(input: SeriesCircuitInput): CalcResult<SeriesCircuitResult> {
  const total = seriesResistance(input.resistances_ohm);
  const current = currentFromVoltageResistance(input.supplyVoltage_V, total);
  return {
    result: {
      totalResistance_ohm: total,
      current_A: current,
      voltages_V: input.resistances_ohm.map((r) => current * r),
    },
    steps: [
      { id: "total-resistance", value: total, unit: "ohm", formulaId: "series-resistance" },
      { id: "current", value: current, unit: "ampere", formulaId: "ohms-law-current" },
    ],
  };
}

export interface ParallelCircuitResult {
  totalResistance_ohm: number;
  totalCurrent_A: number;
  /** Current in each branch (current divider). */
  branchCurrents_A: number[];
}

/** Parallel circuit: one voltage, the total current divides inversely to R. */
export function solveParallelBranches(input: SeriesCircuitInput): CalcResult<ParallelCircuitResult> {
  const total = parallelResistance(input.resistances_ohm);
  const totalCurrent = currentFromVoltageResistance(input.supplyVoltage_V, total);
  return {
    result: {
      totalResistance_ohm: total,
      totalCurrent_A: totalCurrent,
      branchCurrents_A: input.resistances_ohm.map((r) => input.supplyVoltage_V / r),
    },
    steps: [
      { id: "total-resistance", value: total, unit: "ohm", formulaId: "parallel-resistance" },
      { id: "total-current", value: totalCurrent, unit: "ampere", formulaId: "ohms-law-current" },
    ],
  };
}

export interface PowerDcInput {
  voltage_V?: number;
  current_A?: number;
  resistance_ohm?: number;
  /** Operating time, h; adds the energy in kWh. */
  duration_h?: number;
  /** Useful output power, W; adds the efficiency. */
  usefulPower_W?: number;
}

export interface PowerDcResult {
  power_W: number;
  voltage_V: number;
  current_A: number;
  resistance_ohm: number;
  energy_kWh?: number;
  efficiency?: number;
}

/** P = U*I = I^2*R = U^2/R from any two of U, I, R; optional energy W = P*t and efficiency. */
export function powerDc(input: PowerDcInput): CalcResult<PowerDcResult> {
  const { voltage_V: u, current_A: i, resistance_ohm: r } = input;
  const given = [u, i, r].filter((value) => value !== undefined).length;
  if (given !== 2) throw new CalculationInputError("powerDc");

  const steps: CalcStep[] = [];
  let voltage: number;
  let current: number;
  let resistance: number;
  let power: number;
  let formulaId: CalcStep["formulaId"];

  if (u !== undefined && i !== undefined) {
    voltage = positive(u, "voltage_V");
    current = positive(i, "current_A");
    resistance = voltage / current;
    power = voltage * current;
    formulaId = "power-dc";
  } else if (i !== undefined && r !== undefined) {
    current = positive(i, "current_A");
    resistance = positive(r, "resistance_ohm");
    voltage = current * resistance;
    power = current * current * resistance;
    formulaId = "power-dc-from-current";
  } else {
    voltage = positive(u!, "voltage_V");
    resistance = positive(r!, "resistance_ohm");
    current = voltage / resistance;
    power = (voltage * voltage) / resistance;
    formulaId = "power-dc-from-voltage";
  }
  steps.push({ id: "power", value: power, unit: "watt", formulaId });

  const result: PowerDcResult = { power_W: power, voltage_V: voltage, current_A: current, resistance_ohm: resistance };

  if (input.duration_h !== undefined) {
    result.energy_kWh = (power * positive(input.duration_h, "duration_h")) / 1000;
    steps.push({ id: "energy", value: result.energy_kWh, unit: "kilowattHour", formulaId: "energy" });
  }
  if (input.usefulPower_W !== undefined) {
    const useful = positive(input.usefulPower_W, "usefulPower_W");
    if (useful > power) throw new CalculationInputError("usefulPower_W");
    result.efficiency = useful / power;
    steps.push({ id: "efficiency", value: result.efficiency, unit: "dimensionless", formulaId: "efficiency" });
  }
  return { result, steps };
}

export interface AcPowerResult {
  current_A: number;
  apparentPower_VA: number;
  activePower_W: number;
  reactivePower_var: number;
}

/** Shared by 1- and 3-phase: `k` is 1 or sqrt(3) in S = k * U * I. */
function acPower(
  k: number,
  voltage_V: number,
  powerFactor: number,
  known: { current_A?: number; activePower_W?: number },
  ids: { apparent: CalcStep["formulaId"]; active: CalcStep["formulaId"] },
): CalcResult<AcPowerResult> {
  positive(voltage_V, "voltage_V");
  powerFactorOf(powerFactor);
  if ((known.current_A === undefined) === (known.activePower_W === undefined)) {
    throw new CalculationInputError("acPower");
  }
  const current =
    known.current_A !== undefined
      ? positive(known.current_A, "current_A")
      : positive(known.activePower_W!, "activePower_W") / (k * voltage_V * powerFactor);
  const apparent = k * voltage_V * current;
  const active = apparent * powerFactor;
  const reactive = Math.sqrt(Math.max(apparent * apparent - active * active, 0));

  return {
    result: { current_A: current, apparentPower_VA: apparent, activePower_W: active, reactivePower_var: reactive },
    steps: [
      { id: "apparent-power", value: apparent, unit: "voltampere", formulaId: ids.apparent },
      { id: "active-power", value: active, unit: "watt", formulaId: ids.active },
      { id: "reactive-power", value: reactive, unit: "var", formulaId: "reactive-power" },
    ],
  };
}

export interface PowerSinglePhaseInput {
  voltage_V: number;
  powerFactor: number;
  /** Give either the current or the active power. */
  current_A?: number;
  activePower_W?: number;
}

/** Single-phase: S = U*I, P = U*I*cos(phi), Q = sqrt(S^2 - P^2); current from P when P is given. */
export function powerSinglePhase(input: PowerSinglePhaseInput): CalcResult<AcPowerResult> {
  return acPower(1, input.voltage_V, input.powerFactor, input, {
    apparent: "apparent-power-single-phase",
    active: "active-power-single-phase",
  });
}

export interface PowerThreePhaseInput {
  /** Line-to-line voltage, V. */
  lineVoltage_V: number;
  powerFactor: number;
  current_A?: number;
  activePower_W?: number;
}

/** Balanced three-phase: S = sqrt(3)*U*I, P = sqrt(3)*U*I*cos(phi) with line voltage and line current. */
export function powerThreePhase(input: PowerThreePhaseInput): CalcResult<AcPowerResult> {
  return acPower(Math.sqrt(3), input.lineVoltage_V, input.powerFactor, input, {
    apparent: "apparent-power-three-phase",
    active: "active-power-three-phase",
  });
}

export interface LoadInput {
  power_W: number;
  /** Average operating time per day, h (0 < t <= 24). */
  hoursPerDay: number;
}

export interface LoadDemandInput {
  loads: LoadInput[];
  /** 230 V line-to-neutral for single-phase, line-to-line (e.g. 400 V) for three-phase. */
  voltage_V: number;
  system: "single-phase" | "three-phase";
  powerFactor: number;
  /** Days used for the monthly energy; defaults to 30. */
  daysPerMonth?: number;
}

export interface LoadDemandResult {
  totalPower_W: number;
  dailyEnergy_kWh: number;
  monthlyEnergy_kWh: number;
  /** Design current Ib of the supply, A. */
  designCurrent_A: number;
}

export const DEFAULT_DAYS_PER_MONTH = 30;

/**
 * Consumer power and energy demand: the plain sum of the loads (no demand or
 * diversity factors - plan decision, K7), daily energy as the sum of P*t,
 * monthly energy as daily * days, and the design current
 * Ib = P / (U cos phi) (single-phase) or P / (sqrt(3) U cos phi) (three-phase).
 */
export function calculateLoadDemand(input: LoadDemandInput): CalcResult<LoadDemandResult> {
  if (input.loads.length === 0) throw new CalculationInputError("loads");
  for (const load of input.loads) {
    positive(load.power_W, "power_W");
    if (!Number.isFinite(load.hoursPerDay) || load.hoursPerDay <= 0 || load.hoursPerDay > 24) {
      throw new CalculationInputError("hoursPerDay");
    }
  }
  const days = positive(input.daysPerMonth ?? DEFAULT_DAYS_PER_MONTH, "daysPerMonth");
  const k = input.system === "three-phase" ? Math.sqrt(3) : 1;

  const totalPower = input.loads.reduce((sum, load) => sum + load.power_W, 0);
  const daily = input.loads.reduce((sum, load) => sum + load.power_W * load.hoursPerDay, 0) / 1000;
  const monthly = daily * days;
  const current = totalPower / (k * positive(input.voltage_V, "voltage_V") * powerFactorOf(input.powerFactor));

  return {
    result: { totalPower_W: totalPower, dailyEnergy_kWh: daily, monthlyEnergy_kWh: monthly, designCurrent_A: current },
    steps: [
      { id: "total-power", value: totalPower, unit: "watt", formulaId: "total-power" },
      { id: "daily-energy", value: daily, unit: "kilowattHour", formulaId: "daily-energy" },
      { id: "monthly-energy", value: monthly, unit: "kilowattHour", formulaId: "monthly-energy" },
      {
        id: "design-current",
        value: current,
        unit: "ampere",
        formulaId: input.system === "three-phase" ? "current-three-phase" : "current-single-phase",
      },
    ],
  };
}

export interface MixedCircuitInput {
  supplyVoltage_V: number;
  /** R1, in series with the parallel group. */
  seriesResistance_ohm: number;
  /** R2, R3 (...), in parallel with each other. */
  parallelResistances_ohm: number[];
}

export interface MixedCircuitResult {
  parallelResistance_ohm: number;
  totalResistance_ohm: number;
  totalCurrent_A: number;
  seriesVoltage_V: number;
  parallelVoltage_V: number;
  branchCurrents_A: number[];
}

/** R1 in series with a parallel group: R = R1 + R2 || R3, then the voltages and branch currents. */
export function solveMixedCircuit(input: MixedCircuitInput): CalcResult<MixedCircuitResult> {
  const r1 = positive(input.seriesResistance_ohm, "seriesResistance_ohm");
  const parallel = parallelResistance(input.parallelResistances_ohm);
  const total = r1 + parallel;
  const current = currentFromVoltageResistance(input.supplyVoltage_V, total);
  const parallelVoltage = current * parallel;

  return {
    result: {
      parallelResistance_ohm: parallel,
      totalResistance_ohm: total,
      totalCurrent_A: current,
      seriesVoltage_V: current * r1,
      parallelVoltage_V: parallelVoltage,
      branchCurrents_A: input.parallelResistances_ohm.map((r) => parallelVoltage / r),
    },
    steps: [
      { id: "parallel-resistance", value: parallel, unit: "ohm", formulaId: "parallel-resistance" },
      { id: "total-resistance", value: total, unit: "ohm", formulaId: "mixed-resistance" },
      { id: "total-current", value: current, unit: "ampere", formulaId: "ohms-law-current" },
    ],
  };
}
