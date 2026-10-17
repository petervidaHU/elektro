import type { CalcResult, CalcStep } from "./types.js";
import { CalculationInputError } from "./voltage-drop.js";

/**
 * More P2 calculators (plan §2.2, K10): circuits, instruments, motors,
 * installation arithmetic. Textbook identities only; any limit or table value
 * (trip currents, allowed deviations, target illuminance) is an explicit input.
 */

function positive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new CalculationInputError(field);
  return value;
}

function finite(value: number, field: string): number {
  if (!Number.isFinite(value)) throw new CalculationInputError(field);
  return value;
}

type Step = CalcStep;
const step = (id: string, value: number, unit: Step["unit"], formulaId: Step["formulaId"]): Step => ({ id, value, unit, formulaId });

// ---- two sources, three branches (Kirchhoff) ----------------------------------

export interface KirchhoffInput {
  /** May be negative for a reversed source. */
  emf1_V: number;
  resistance1_ohm: number;
  emf2_V: number;
  resistance2_ohm: number;
  /** The middle branch, without a source. */
  resistance3_ohm: number;
}

export interface KirchhoffResult {
  nodeVoltage_V: number;
  /** Current in each branch towards the common node; I1 + I2 = I3. */
  current1_A: number;
  current2_A: number;
  current3_A: number;
}

/**
 * Two branches with a source and a resistor, and a middle resistor, between two
 * nodes: the node voltage U_ab = (E1/R1 + E2/R2) / (1/R1 + 1/R2 + 1/R3)
 * (from the node law I1 + I2 = I3), then I_n = (E_n - U_ab) / R_n.
 */
export function solveKirchhoff(input: KirchhoffInput): CalcResult<KirchhoffResult> {
  const r1 = positive(input.resistance1_ohm, "resistance1_ohm");
  const r2 = positive(input.resistance2_ohm, "resistance2_ohm");
  const r3 = positive(input.resistance3_ohm, "resistance3_ohm");
  const e1 = finite(input.emf1_V, "emf1_V");
  const e2 = finite(input.emf2_V, "emf2_V");

  const u = (e1 / r1 + e2 / r2) / (1 / r1 + 1 / r2 + 1 / r3);
  const result = { nodeVoltage_V: u, current1_A: (e1 - u) / r1, current2_A: (e2 - u) / r2, current3_A: u / r3 };
  return {
    result,
    steps: [
      step("node-voltage", u, "volt", "node-voltage"),
      step("current-1", result.current1_A, "ampere", "branch-current"),
      step("current-2", result.current2_A, "ampere", "branch-current"),
      step("current-3", result.current3_A, "ampere", "ohms-law-current"),
    ],
  };
}

// ---- Wheatstone bridge ---------------------------------------------------------

export interface WheatstoneInput {
  /** Left arm: R1 on top, R2 below; right arm: R3 on top, Rx below. */
  resistance1_ohm: number;
  resistance2_ohm: number;
  resistance3_ohm: number;
  /** Give the actual Rx to see the bridge voltage; omit to find the balancing Rx. */
  unknownResistance_ohm?: number;
  supplyVoltage_V?: number;
}

export interface WheatstoneResult {
  /** The Rx that balances the bridge: R2 R3 / R1. */
  balancingResistance_ohm: number;
  unknownResistance_ohm: number;
  /** U_a - U_b between the two arm midpoints (only with a supply voltage). */
  bridgeVoltage_V?: number;
}

export function solveWheatstone(input: WheatstoneInput): CalcResult<WheatstoneResult> {
  const r1 = positive(input.resistance1_ohm, "resistance1_ohm");
  const r2 = positive(input.resistance2_ohm, "resistance2_ohm");
  const r3 = positive(input.resistance3_ohm, "resistance3_ohm");
  const balancing = (r2 * r3) / r1;
  const rx = input.unknownResistance_ohm === undefined ? balancing : positive(input.unknownResistance_ohm, "unknownResistance_ohm");

  const result: WheatstoneResult = { balancingResistance_ohm: balancing, unknownResistance_ohm: rx };
  const steps: Step[] = [step("unknown-resistance", balancing, "ohm", "wheatstone-unknown")];
  if (input.supplyVoltage_V !== undefined) {
    const u = positive(input.supplyVoltage_V, "supplyVoltage_V");
    result.bridgeVoltage_V = u * (r2 / (r1 + r2) - rx / (r3 + rx));
    steps.push(step("bridge-voltage", result.bridgeVoltage_V, "volt", "wheatstone-bridge-voltage"));
  }
  return { result, steps };
}

// ---- meter range extension ----------------------------------------------------

export interface MeterRangeInput {
  kind: "ammeter" | "voltmeter";
  /** Internal resistance of the movement, ohm. */
  meterResistance_ohm: number;
  /** Full-scale current of the movement, A. */
  meterCurrent_A: number;
  /** The new full-scale current (ammeter, A) or voltage (voltmeter, V). */
  targetRange: number;
}

/**
 * Ammeter: a shunt R_p = R_m I_m / (I - I_m) in parallel with the movement.
 * Voltmeter: a series resistor R_s = U / I_m - R_m.
 */
export function solveMeterRange(input: MeterRangeInput): CalcResult<{ resistor_ohm: number }> {
  const rm = positive(input.meterResistance_ohm, "meterResistance_ohm");
  const im = positive(input.meterCurrent_A, "meterCurrent_A");
  const target = positive(input.targetRange, "targetRange");

  if (input.kind === "ammeter") {
    if (target <= im) throw new CalculationInputError("targetRange");
    const value = (rm * im) / (target - im);
    return { result: { resistor_ohm: value }, steps: [step("shunt-resistor", value, "ohm", "shunt-resistor")] };
  }
  if (target <= im * rm) throw new CalculationInputError("targetRange");
  const value = target / im - rm;
  return { result: { resistor_ohm: value }, steps: [step("series-resistor", value, "ohm", "series-resistor")] };
}

// ---- digital meter accuracy ---------------------------------------------------

export interface MeasurementErrorInput {
  reading: number;
  /** Accuracy in percent of the reading. */
  percentOfReading: number;
  /** Accuracy in digits (counts of the last place). */
  digits: number;
  /** Value of one digit (resolution of the range). */
  resolution: number;
}

export interface MeasurementErrorResult {
  absoluteError: number;
  minimum: number;
  maximum: number;
  relativeErrorPercent: number;
}

/** Absolute error = reading * p / 100 + digits * resolution; the true value lies within reading +/- error. */
export function calculateMeasurementError(input: MeasurementErrorInput): CalcResult<MeasurementErrorResult> {
  const reading = positive(input.reading, "reading");
  const error =
    (reading * finite(input.percentOfReading, "percentOfReading")) / 100 + finite(input.digits, "digits") * positive(input.resolution, "resolution");
  if (error < 0) throw new CalculationInputError("percentOfReading");
  return {
    result: { absoluteError: error, minimum: reading - error, maximum: reading + error, relativeErrorPercent: (error / reading) * 100 },
    steps: [step("absolute-error", error, "dimensionless", "meter-absolute-error")],
  };
}

// ---- motor basics ---------------------------------------------------------------

export interface MotorInput {
  /** Supply frequency and pole pairs give the synchronous speed. */
  frequency_Hz?: number;
  polePairs?: number;
  rotorSpeed_rpm?: number;
  /** Nameplate data give the rated current: shaft power, line voltage, efficiency, cos phi. */
  ratedPower_W?: number;
  voltage_V?: number;
  efficiency?: number;
  powerFactor?: number;
  /** Direct-on-line starting current as a multiple of the rated current (catalogue data). */
  startingCurrentRatio?: number;
}

export interface MotorResult {
  synchronousSpeed_rpm?: number;
  slip?: number;
  ratedCurrent_A?: number;
  directStartCurrent_A?: number;
  starDeltaStartCurrent_A?: number;
}

/** n_s = 60 f / p, s = (n_s - n) / n_s, I = P / (sqrt(3) U eta cos phi), star-delta start I_Y = I_delta / 3. */
export function calculateMotor(input: MotorInput): CalcResult<MotorResult> {
  const result: MotorResult = {};
  const steps: Step[] = [];

  if (input.frequency_Hz !== undefined || input.polePairs !== undefined) {
    const ns = (60 * positive(input.frequency_Hz ?? Number.NaN, "frequency_Hz")) / positive(input.polePairs ?? Number.NaN, "polePairs");
    result.synchronousSpeed_rpm = ns;
    steps.push(step("synchronous-speed", ns, "revolutionPerMinute", "synchronous-speed"));
    if (input.rotorSpeed_rpm !== undefined) {
      const n = positive(input.rotorSpeed_rpm, "rotorSpeed_rpm");
      if (n > ns) throw new CalculationInputError("rotorSpeed_rpm");
      result.slip = (ns - n) / ns;
      steps.push(step("slip", result.slip, "dimensionless", "slip"));
    }
  }

  if (input.ratedPower_W !== undefined) {
    const eta = positive(input.efficiency ?? Number.NaN, "efficiency");
    const cos = positive(input.powerFactor ?? Number.NaN, "powerFactor");
    if (eta > 1) throw new CalculationInputError("efficiency");
    if (cos > 1) throw new CalculationInputError("powerFactor");
    const current = positive(input.ratedPower_W, "ratedPower_W") / (Math.sqrt(3) * positive(input.voltage_V ?? Number.NaN, "voltage_V") * eta * cos);
    result.ratedCurrent_A = current;
    steps.push(step("rated-current", current, "ampere", "motor-rated-current"));
    if (input.startingCurrentRatio !== undefined) {
      result.directStartCurrent_A = current * positive(input.startingCurrentRatio, "startingCurrentRatio");
      result.starDeltaStartCurrent_A = result.directStartCurrent_A / 3;
      steps.push(step("star-delta-start-current", result.starDeltaStartCurrent_A, "ampere", "star-delta-start-current"));
    }
  }

  if (steps.length === 0) throw new CalculationInputError("motor");
  return { result, steps };
}

// ---- short-circuit current -----------------------------------------------------

export interface ShortCircuitInput {
  phaseVoltage_V: number;
  loopImpedance_ohm: number;
  /** The current at which the protective device trips (from its data sheet or the task). */
  tripCurrent_A?: number;
}

export interface ShortCircuitResult {
  shortCircuitCurrent_A: number;
  tripReached?: boolean;
  /** The highest loop impedance that still reaches the trip current: U0 / I_a. */
  maxLoopImpedance_ohm?: number;
}

/** I_k = U0 / Z_s; the device trips when I_k >= I_a, i.e. Z_s <= U0 / I_a. The trip current is an input, never assumed. */
export function calculateShortCircuit(input: ShortCircuitInput): CalcResult<ShortCircuitResult> {
  const u0 = positive(input.phaseVoltage_V, "phaseVoltage_V");
  const ik = u0 / positive(input.loopImpedance_ohm, "loopImpedance_ohm");
  const result: ShortCircuitResult = { shortCircuitCurrent_A: ik };
  const steps: Step[] = [step("short-circuit-current", ik, "ampere", "short-circuit-current")];

  if (input.tripCurrent_A !== undefined) {
    const trip = positive(input.tripCurrent_A, "tripCurrent_A");
    result.tripReached = ik >= trip;
    result.maxLoopImpedance_ohm = u0 / trip;
    steps.push(step("max-loop-impedance", result.maxLoopImpedance_ohm, "ohm", "maximum-loop-impedance"));
  }
  return { result, steps };
}

// ---- illuminance ---------------------------------------------------------------

export interface IlluminanceInput {
  luminousFlux_lm: number;
  area_m2: number;
  /** The target illuminance (from the task or the standard), lx. */
  targetIlluminance_lx?: number;
  fluxPerLuminaire_lm?: number;
  /** Share of the luminaire flux reaching the work plane; defaults to 1 (simplified). */
  utilisationFactor?: number;
}

export interface IlluminanceResult {
  illuminance_lx: number;
  luminairesNeeded?: number;
}

/** E = Phi / A; luminaires N = ceil(E_target A / (Phi_luminaire eta)). */
export function calculateIlluminance(input: IlluminanceInput): CalcResult<IlluminanceResult> {
  const area = positive(input.area_m2, "area_m2");
  const e = positive(input.luminousFlux_lm, "luminousFlux_lm") / area;
  const result: IlluminanceResult = { illuminance_lx: e };
  const steps: Step[] = [step("illuminance", e, "lux", "illuminance")];

  if (input.targetIlluminance_lx !== undefined && input.fluxPerLuminaire_lm !== undefined) {
    const eta = input.utilisationFactor ?? 1;
    if (!(eta > 0 && eta <= 1)) throw new CalculationInputError("utilisationFactor");
    const exact = (positive(input.targetIlluminance_lx, "targetIlluminance_lx") * area) / (positive(input.fluxPerLuminaire_lm, "fluxPerLuminaire_lm") * eta);
    // Guard against floating point noise just above a whole number.
    result.luminairesNeeded = Math.ceil(Math.round(exact * 1e9) / 1e9);
    steps.push(step("luminaire-count", result.luminairesNeeded, "dimensionless", "luminaire-count"));
  }
  return { result, steps };
}

// ---- PE continuity check ------------------------------------------------------

export interface PeContinuityInput {
  /** Explicit, as always: use the value the task gives (see the resistivity convention, plan §2.4). */
  resistivity_ohm_mm2_per_m: number;
  length_m: number;
  crossSection_mm2: number;
  measuredResistance_ohm: number;
  /** How many times the calculated value the measurement may reach (from the task). */
  allowedFactor?: number;
}

export interface PeContinuityResult {
  expectedResistance_ohm: number;
  ratio: number;
  withinAllowed?: boolean;
}

/** Expected R = rho L / S compared with the measured value: k = R_measured / R. */
export function calculatePeContinuityCheck(input: PeContinuityInput): CalcResult<PeContinuityResult> {
  const expected =
    (positive(input.resistivity_ohm_mm2_per_m, "resistivity_ohm_mm2_per_m") * positive(input.length_m, "length_m")) /
    positive(input.crossSection_mm2, "crossSection_mm2");
  const ratio = positive(input.measuredResistance_ohm, "measuredResistance_ohm") / expected;
  const result: PeContinuityResult = { expectedResistance_ohm: expected, ratio };
  if (input.allowedFactor !== undefined) {
    // A tiny margin keeps a measurement exactly at the limit from failing on floating point noise.
    result.withinAllowed = ratio <= positive(input.allowedFactor, "allowedFactor") * (1 + 1e-9);
  }
  return {
    result,
    steps: [step("expected-resistance", expected, "ohm", "pe-expected-resistance"), step("resistance-ratio", ratio, "dimensionless", "pe-resistance-ratio")],
  };
}

// ---- material list --------------------------------------------------------------

export interface MaterialListInput {
  lines: { quantity: number; unitPrice: number }[];
  /** A spare quantity in percent, given by the task or the quotation. */
  reservePercent?: number;
}

export interface MaterialListResult {
  lineTotals: number[];
  total: number;
  totalWithReserve?: number;
}

/** Line total = quantity * unit price; total = sum. Prices are always inputs. */
export function calculateMaterialList(input: MaterialListInput): CalcResult<MaterialListResult> {
  if (input.lines.length === 0) throw new CalculationInputError("lines");
  const lineTotals = input.lines.map((line) => positive(line.quantity, "quantity") * positive(line.unitPrice, "unitPrice"));
  const total = lineTotals.reduce((sum, value) => sum + value, 0);
  const result: MaterialListResult = { lineTotals, total };
  const steps: Step[] = [step("material-total", total, "dimensionless", "material-total")];
  if (input.reservePercent !== undefined) {
    result.totalWithReserve = total * (1 + finite(input.reservePercent, "reservePercent") / 100);
  }
  return { result, steps };
}
