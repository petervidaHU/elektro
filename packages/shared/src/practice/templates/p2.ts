import { calculateAcImpedance, calculateAcValues, calculateCapacitors, calculateInductors, calculateVoltageSource, solveCharge, solveTransformer } from "../../calc/p2.js";
import {
  calculateIlluminance,
  calculateMaterialList,
  calculateMeasurementError,
  calculateMotor,
  calculatePeContinuityCheck,
  calculateShortCircuit,
  solveMeterRange,
  solveWheatstone,
} from "../../calc/p2-more.js";
import type { Unit } from "../../calc/types.js";
import { formatNumber } from "../../format.js";
import type { Locale } from "../../locales.js";
import type { Given, PriorValues, TaskParams, TaskTemplate } from "../types.js";

/**
 * Practice for the P2 calculators (plan §2.2, K10). Textbook formulas only;
 * every expected value calls the engine in calc/p2.ts or calc/p2-more.ts, with
 * the unit conversions (µF, mH, ms, mA) done here so answers stay in the unit
 * shown with the task. Parameter values are round practice numbers and need a
 * teacher's review like the rest.
 */

const num = (params: TaskParams, key: string): number => Number(params[key]);
const prior = (values: PriorValues, key: string): number => values[key] ?? Number.NaN;

function fmt(value: number, locale: Locale): string {
  return formatNumber(value, locale, { maximumSignificantDigits: 4, useGrouping: false });
}

/** Givens from `[id, param key, unit]` triples. */
const givensOf =
  (specs: readonly (readonly [string, string, Unit])[]) =>
  (p: TaskParams): Given[] =>
    specs.map(([id, key, unit]) => ({ id, value: num(p, key), unit }));

const MICRO = 1e6;
const MILLI = 1e3;
const MICROFARADS = [10, 22, 47, 100, 220, 470];
const MILLIHENRIES = [50, 100, 200, 500, 1000];
const RESISTANCES = [10, 20, 47, 100, 220, 470, 1000];

// ---- AC (topic ac-fundamentals) ----------------------------------------------------

const acRl = (p: TaskParams) =>
  calculateAcImpedance({ resistance_ohm: num(p, "resistance"), inductance_H: num(p, "inductance") / MILLI, frequency_Hz: num(p, "frequency"), voltage_V: num(p, "voltage") });

const acImpedanceRl: TaskTemplate = {
  id: "ac-impedance.rl",
  version: 1,
  topicId: "ac-fundamentals",
  difficulty: 3,
  scenarioKey: () => "ac-impedance.rl",
  generate: (rng) => ({
    resistance: rng.pick([20, 30, 40, 50, 100]),
    inductance: rng.pick([100, 200, 300, 500]),
    frequency: 50,
    voltage: rng.pick([24, 48, 230]),
  }),
  givens: givensOf([
    ["resistance", "resistance", "ohm"],
    ["inductance", "inductance", "millihenry"],
    ["frequency", "frequency", "hertz"],
    ["voltage", "voltage", "volt"],
  ]),
  steps: [
    {
      id: "inductive-reactance",
      unit: "ohm",
      kind: "intermediate",
      formulaId: () => "inductive-reactance",
      expected: (p) => acRl(p).result.inductiveReactance_ohm,
      substitution: (p, _v, locale) => `X_L = 2π · ${fmt(num(p, "frequency"), locale)} · ${fmt(num(p, "inductance") / MILLI, locale)}`,
    },
    {
      id: "impedance",
      unit: "ohm",
      kind: "intermediate",
      formulaId: () => "series-impedance",
      expected: (p, v) => Math.sqrt(num(p, "resistance") ** 2 + prior(v, "inductive-reactance") ** 2),
      substitution: (p, v, locale) => `Z = √(${fmt(num(p, "resistance"), locale)}² + ${fmt(prior(v, "inductive-reactance"), locale)}²)`,
      misconceptions: [{ id: "impedance-added", value: (p, v) => num(p, "resistance") + prior(v, "inductive-reactance") }],
    },
    {
      id: "current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "ohms-law-current",
      expected: (p, v) => num(p, "voltage") / prior(v, "impedance"),
      substitution: (p, v, locale) => `I = ${fmt(num(p, "voltage"), locale)} / ${fmt(prior(v, "impedance"), locale)}`,
    },
  ],
};

const acValuesPeak: TaskTemplate = {
  id: "ac-values.peak-frequency",
  version: 1,
  topicId: "ac-fundamentals",
  difficulty: 1,
  scenarioKey: () => "ac-values.peak-frequency",
  generate: (rng) => ({ voltage: rng.pick([12, 24, 48, 230, 400]), period: rng.pick([0.02, 0.01, 0.025, 0.04]) }),
  givens: givensOf([
    ["voltage", "voltage", "volt"],
    ["period", "period", "second"],
  ]),
  steps: [
    {
      id: "peak-value",
      unit: "volt",
      kind: "intermediate",
      formulaId: () => "peak-value",
      expected: (p) => calculateAcValues({ rms_V: num(p, "voltage") }).result.peak_V,
      substitution: (p, _v, locale) => `Uₘ = ${fmt(num(p, "voltage"), locale)} · √2`,
    },
    {
      id: "frequency",
      unit: "hertz",
      kind: "final",
      formulaId: () => "period-frequency",
      expected: (p) => calculateAcValues({ rms_V: num(p, "voltage"), period_s: num(p, "period") }).result.frequency_Hz!,
      substitution: (p, _v, locale) => `f = 1 / ${fmt(num(p, "period"), locale)}`,
      misconceptions: [{ id: "period-not-inverted", value: (p) => num(p, "period") }],
    },
  ],
};

// ---- capacitors (topic electric-field-and-capacitors) ---------------------------------

const capacitorSeries: TaskTemplate = {
  id: "capacitors.series",
  version: 1,
  topicId: "electric-field-and-capacitors",
  difficulty: 1,
  scenarioKey: () => "capacitors.series",
  generate: (rng) => ({ capacitance1: rng.pick(MICROFARADS), capacitance2: rng.pick(MICROFARADS) }),
  givens: givensOf([
    ["capacitance1", "capacitance1", "microfarad"],
    ["capacitance2", "capacitance2", "microfarad"],
  ]),
  steps: [
    {
      id: "capacitance",
      unit: "microfarad",
      kind: "final",
      formulaId: () => "series-capacitance",
      expected: (p) => calculateCapacitors({ mode: "series", capacitances_F: [num(p, "capacitance1") / MICRO, num(p, "capacitance2") / MICRO], voltage_V: 1 }).result.capacitance_F * MICRO,
      substitution: (p, _v, locale) => `1/C = 1/${fmt(num(p, "capacitance1"), locale)} + 1/${fmt(num(p, "capacitance2"), locale)}`,
      misconceptions: [{ id: "series-capacitance-summed", value: (p) => num(p, "capacitance1") + num(p, "capacitance2") }],
    },
  ],
};

const capacitorEnergy: TaskTemplate = {
  id: "capacitors.charge-energy",
  version: 1,
  topicId: "electric-field-and-capacitors",
  difficulty: 2,
  scenarioKey: () => "capacitors.charge-energy",
  generate: (rng) => ({ capacitance: rng.pick(MICROFARADS), voltage: rng.pick([12, 24, 48, 230]) }),
  givens: givensOf([
    ["capacitance", "capacitance", "microfarad"],
    ["voltage", "voltage", "volt"],
  ]),
  steps: [
    {
      id: "charge",
      unit: "millicoulomb",
      kind: "intermediate",
      formulaId: () => "capacitor-charge",
      expected: (p) => calculateCapacitors({ mode: "single", capacitances_F: [num(p, "capacitance") / MICRO], voltage_V: num(p, "voltage") }).result.charge_C * MILLI,
      substitution: (p, _v, locale) => `Q = ${fmt(num(p, "capacitance"), locale)} µF · ${fmt(num(p, "voltage"), locale)} V`,
    },
    {
      id: "energy",
      unit: "millijoule",
      kind: "final",
      formulaId: () => "capacitor-energy",
      expected: (p) => calculateCapacitors({ mode: "single", capacitances_F: [num(p, "capacitance") / MICRO], voltage_V: num(p, "voltage") }).result.energy_J * MILLI,
      substitution: (p, _v, locale) => `W = ${fmt(num(p, "capacitance"), locale)} µF · ${fmt(num(p, "voltage"), locale)}² / 2`,
      misconceptions: [{ id: "energy-half-missing", value: (p) => (num(p, "capacitance") / MICRO) * num(p, "voltage") ** 2 * MILLI }],
    },
  ],
};

const rcTimeConstant: TaskTemplate = {
  id: "capacitors.time-constant",
  version: 1,
  topicId: "electric-field-and-capacitors",
  difficulty: 3,
  scenarioKey: () => "capacitors.time-constant",
  generate: (rng) => ({ capacitance: rng.pick(MICROFARADS), resistance: rng.pick(RESISTANCES), voltage: rng.pick([12, 24, 48]) }),
  givens: givensOf([
    ["capacitance", "capacitance", "microfarad"],
    ["resistance", "resistance", "ohm"],
    ["voltage", "voltage", "volt"],
  ]),
  steps: [
    {
      id: "time-constant",
      unit: "millisecond",
      kind: "intermediate",
      formulaId: () => "rc-time-constant",
      expected: (p) => calculateCapacitors({ mode: "single", capacitances_F: [num(p, "capacitance") / MICRO], voltage_V: 1, resistance_ohm: num(p, "resistance") }).result.timeConstant_s! * MILLI,
      substitution: (p, _v, locale) => `τ = ${fmt(num(p, "resistance"), locale)} Ω · ${fmt(num(p, "capacitance"), locale)} µF`,
    },
    {
      id: "full-charge-time",
      unit: "millisecond",
      kind: "final",
      formulaId: () => "rc-full-charge",
      expected: (_p, v) => 5 * prior(v, "time-constant"),
      substitution: (_p, v, locale) => `t ≈ 5 · ${fmt(prior(v, "time-constant"), locale)}`,
    },
  ],
};

// ---- inductors (topic magnetism-and-induction) ------------------------------------------

const inductorEnergy: TaskTemplate = {
  id: "inductors.energy",
  version: 1,
  topicId: "magnetism-and-induction",
  difficulty: 1,
  scenarioKey: () => "inductors.energy",
  generate: (rng) => ({ inductance: rng.pick(MILLIHENRIES), current: rng.pick([1, 2, 4, 5, 10]) }),
  givens: givensOf([
    ["inductance", "inductance", "millihenry"],
    ["current", "current", "ampere"],
  ]),
  steps: [
    {
      id: "energy",
      unit: "millijoule",
      kind: "final",
      formulaId: () => "inductor-energy",
      expected: (p) => calculateInductors({ mode: "single", inductances_H: [num(p, "inductance") / MILLI], current_A: num(p, "current") }).result.energy_J * MILLI,
      substitution: (p, _v, locale) => `W = ${fmt(num(p, "inductance"), locale)} mH · ${fmt(num(p, "current"), locale)}² / 2`,
      misconceptions: [{ id: "energy-half-missing", value: (p) => (num(p, "inductance") / MILLI) * num(p, "current") ** 2 * MILLI }],
    },
  ],
};

const inductorTimeConstant: TaskTemplate = {
  id: "inductors.time-constant",
  version: 1,
  topicId: "magnetism-and-induction",
  difficulty: 2,
  scenarioKey: () => "inductors.time-constant",
  generate: (rng) => ({ inductance: rng.pick(MILLIHENRIES), resistance: rng.pick([5, 10, 20, 50, 100]) }),
  givens: givensOf([
    ["inductance", "inductance", "millihenry"],
    ["resistance", "resistance", "ohm"],
  ]),
  steps: [
    {
      id: "time-constant",
      unit: "millisecond",
      kind: "final",
      formulaId: () => "rl-time-constant",
      // L in mH over R in ohm is directly milliseconds.
      expected: (p) => num(p, "inductance") / num(p, "resistance"),
      substitution: (p, _v, locale) => `τ = ${fmt(num(p, "inductance"), locale)} mH / ${fmt(num(p, "resistance"), locale)} Ω`,
    },
  ],
};

// ---- real voltage source (topic voltage-sources) -------------------------------------------

const sourceShortCircuit: TaskTemplate = {
  id: "voltage-source.short-circuit",
  version: 1,
  topicId: "voltage-sources",
  difficulty: 1,
  scenarioKey: () => "voltage-source.short-circuit",
  generate: (rng) => ({ emf: rng.pick([6, 12, 24, 48]), internalResistance: rng.pick([0.1, 0.2, 0.5, 1, 2]) }),
  givens: givensOf([
    ["emf", "emf", "volt"],
    ["internalResistance", "internalResistance", "ohm"],
  ]),
  steps: [
    {
      id: "short-circuit-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "source-short-circuit-current",
      expected: (p) => calculateVoltageSource({ emf_V: num(p, "emf"), internalResistance_ohm: num(p, "internalResistance") }).result.shortCircuitCurrent_A,
      substitution: (p, _v, locale) => `I_k = ${fmt(num(p, "emf"), locale)} / ${fmt(num(p, "internalResistance"), locale)}`,
    },
  ],
};

const sourceTerminal: TaskTemplate = {
  id: "voltage-source.terminal-voltage",
  version: 1,
  topicId: "voltage-sources",
  difficulty: 2,
  scenarioKey: () => "voltage-source.terminal-voltage",
  generate: (rng) => ({ emf: rng.pick([6, 12, 24, 48]), internalResistance: rng.pick([0.5, 1, 2]), loadResistance: rng.pick([2, 4, 5, 10, 20]) }),
  givens: givensOf([
    ["emf", "emf", "volt"],
    ["internalResistance", "internalResistance", "ohm"],
    ["loadResistance", "loadResistance", "ohm"],
  ]),
  steps: [
    {
      id: "current",
      unit: "ampere",
      kind: "intermediate",
      formulaId: () => "source-current",
      expected: (p) => calculateVoltageSource({ emf_V: num(p, "emf"), internalResistance_ohm: num(p, "internalResistance"), loadResistance_ohm: num(p, "loadResistance") }).result.current_A!,
      substitution: (p, _v, locale) => `I = ${fmt(num(p, "emf"), locale)} / (${fmt(num(p, "internalResistance"), locale)} + ${fmt(num(p, "loadResistance"), locale)})`,
      misconceptions: [{ id: "internal-resistance-ignored", value: (p) => num(p, "emf") / num(p, "loadResistance") }],
    },
    {
      id: "terminal-voltage",
      unit: "volt",
      kind: "final",
      formulaId: () => "terminal-voltage",
      expected: (p, v) => num(p, "emf") - num(p, "internalResistance") * prior(v, "current"),
      substitution: (p, v, locale) => `U = ${fmt(num(p, "emf"), locale)} − ${fmt(num(p, "internalResistance"), locale)} · ${fmt(prior(v, "current"), locale)}`,
      misconceptions: [{ id: "internal-resistance-ignored", value: (p) => num(p, "emf") }],
    },
  ],
};

// ---- transformer (topic transformers) ----------------------------------------------------------

const transformerVoltage: TaskTemplate = {
  id: "transformer.secondary-voltage",
  version: 1,
  topicId: "transformers",
  difficulty: 1,
  scenarioKey: () => "transformer.secondary-voltage",
  generate: (rng) => ({ primaryVoltage: rng.pick([230, 400]), primaryTurns: rng.pick([500, 1000, 2000]), secondaryTurns: rng.pick([50, 100, 150, 250]) }),
  givens: givensOf([
    ["primaryVoltage", "primaryVoltage", "volt"],
    ["primaryTurns", "primaryTurns", "dimensionless"],
    ["secondaryTurns", "secondaryTurns", "dimensionless"],
  ]),
  steps: [
    {
      id: "secondary-voltage",
      unit: "volt",
      kind: "final",
      formulaId: () => "turns-ratio",
      expected: (p) => solveTransformer({ primaryVoltage_V: num(p, "primaryVoltage"), primaryTurns: num(p, "primaryTurns"), secondaryTurns: num(p, "secondaryTurns") }).result.secondaryVoltage_V,
      substitution: (p, _v, locale) => `U₂ = ${fmt(num(p, "primaryVoltage"), locale)} · ${fmt(num(p, "secondaryTurns"), locale)} / ${fmt(num(p, "primaryTurns"), locale)}`,
      misconceptions: [{ id: "transformer-ratio-inverted", value: (p) => (num(p, "primaryVoltage") * num(p, "primaryTurns")) / num(p, "secondaryTurns") }],
    },
  ],
};

const transformerCurrent: TaskTemplate = {
  id: "transformer.primary-current",
  version: 1,
  topicId: "transformers",
  difficulty: 2,
  scenarioKey: () => "transformer.primary-current",
  generate: (rng) => ({ primaryVoltage: 230, secondaryVoltage: rng.pick([12, 24, 48]), secondaryCurrent: rng.pick([2, 5, 10, 20]) }),
  givens: givensOf([
    ["primaryVoltage", "primaryVoltage", "volt"],
    ["secondaryVoltage", "secondaryVoltage", "volt"],
    ["secondaryCurrent", "secondaryCurrent", "ampere"],
  ]),
  steps: [
    {
      id: "primary-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "transformer-current",
      expected: (p) => (num(p, "secondaryCurrent") * num(p, "secondaryVoltage")) / num(p, "primaryVoltage"),
      substitution: (p, _v, locale) => `I₁ = ${fmt(num(p, "secondaryCurrent"), locale)} · ${fmt(num(p, "secondaryVoltage"), locale)} / ${fmt(num(p, "primaryVoltage"), locale)}`,
      misconceptions: [{ id: "transformer-ratio-inverted", value: (p) => (num(p, "secondaryCurrent") * num(p, "primaryVoltage")) / num(p, "secondaryVoltage") }],
    },
  ],
};

// ---- charge (topic dc-circuits) -----------------------------------------------------------------

const chargeBasic: TaskTemplate = {
  id: "charge-current.charge",
  version: 1,
  topicId: "dc-circuits",
  difficulty: 1,
  scenarioKey: () => "charge-current.charge",
  generate: (rng) => ({ current: rng.pick([0.5, 1, 2, 5, 10]), time: rng.pick([10, 30, 60, 120, 300]) }),
  givens: givensOf([
    ["current", "current", "ampere"],
    ["time", "time", "second"],
  ]),
  steps: [
    {
      id: "charge",
      unit: "coulomb",
      kind: "final",
      formulaId: () => "charge",
      expected: (p) => solveCharge({ current_A: num(p, "current"), time_s: num(p, "time") }).result.charge_C,
      substitution: (p, _v, locale) => `Q = ${fmt(num(p, "current"), locale)} · ${fmt(num(p, "time"), locale)}`,
    },
  ],
};

// ---- Wheatstone bridge (topic series-parallel-circuits) -------------------------------------------

const wheatstone: TaskTemplate = {
  id: "wheatstone.unknown-resistance",
  version: 1,
  topicId: "series-parallel-circuits",
  difficulty: 3,
  scenarioKey: () => "wheatstone.unknown-resistance",
  generate: (rng) => ({ resistance1: rng.pick([100, 200, 500]), resistance2: rng.pick([100, 200, 300, 400]), resistance3: rng.pick([100, 150, 300, 600]) }),
  givens: givensOf([
    ["resistance1", "resistance1", "ohm"],
    ["resistance2", "resistance2", "ohm"],
    ["resistance3", "resistance3", "ohm"],
  ]),
  steps: [
    {
      id: "unknown-resistance",
      unit: "ohm",
      kind: "final",
      formulaId: () => "wheatstone-unknown",
      expected: (p) => solveWheatstone({ resistance1_ohm: num(p, "resistance1"), resistance2_ohm: num(p, "resistance2"), resistance3_ohm: num(p, "resistance3") }).result.balancingResistance_ohm,
      substitution: (p, _v, locale) => `Rₓ = ${fmt(num(p, "resistance2"), locale)} · ${fmt(num(p, "resistance3"), locale)} / ${fmt(num(p, "resistance1"), locale)}`,
    },
  ],
};

// ---- instruments (topic measuring-instruments) -----------------------------------------------------

const meterShunt: TaskTemplate = {
  id: "meter-range.shunt",
  version: 1,
  topicId: "measuring-instruments",
  difficulty: 2,
  scenarioKey: () => "meter-range.shunt",
  generate: (rng) => ({ meterResistance: rng.pick([50, 100, 200]), meterCurrent: rng.pick([1, 2, 5]), target: rng.pick([20, 50, 100, 500]) }),
  givens: givensOf([
    ["meterResistance", "meterResistance", "ohm"],
    ["meterCurrent", "meterCurrent", "milliampere"],
    ["meterTarget", "target", "milliampere"],
  ]),
  steps: [
    {
      id: "shunt-resistor",
      unit: "ohm",
      kind: "final",
      formulaId: () => "shunt-resistor",
      expected: (p) => solveMeterRange({ kind: "ammeter", meterResistance_ohm: num(p, "meterResistance"), meterCurrent_A: num(p, "meterCurrent") / MILLI, targetRange: num(p, "target") / MILLI }).result.resistor_ohm,
      substitution: (p, _v, locale) => `Rₚ = ${fmt(num(p, "meterResistance"), locale)} · ${fmt(num(p, "meterCurrent"), locale)} / (${fmt(num(p, "target"), locale)} − ${fmt(num(p, "meterCurrent"), locale)})`,
      misconceptions: [{ id: "shunt-full-range", value: (p) => (num(p, "meterResistance") * num(p, "meterCurrent")) / num(p, "target") }],
    },
  ],
};

const measurementError: TaskTemplate = {
  id: "measurement-error.absolute",
  version: 1,
  topicId: "measuring-instruments",
  difficulty: 1,
  scenarioKey: () => "measurement-error.absolute",
  generate: (rng) => ({ reading: rng.pick([12, 24, 48, 230, 400]), percent: rng.pick([0.5, 1, 1.5, 2]), digits: rng.pick([1, 2, 3, 5]), resolution: rng.pick([0.1, 0.01]) }),
  givens: givensOf([
    ["reading", "reading", "volt"],
    ["percent", "percent", "percent"],
    ["digits", "digits", "dimensionless"],
    ["resolution", "resolution", "volt"],
  ]),
  steps: [
    {
      id: "absolute-error",
      unit: "volt",
      kind: "intermediate",
      formulaId: () => "meter-absolute-error",
      expected: (p) => calculateMeasurementError({ reading: num(p, "reading"), percentOfReading: num(p, "percent"), digits: num(p, "digits"), resolution: num(p, "resolution") }).result.absoluteError,
      substitution: (p, _v, locale) => `Δ = ${fmt(num(p, "reading"), locale)} · ${fmt(num(p, "percent"), locale)}/100 + ${fmt(num(p, "digits"), locale)} · ${fmt(num(p, "resolution"), locale)}`,
      misconceptions: [{ id: "digits-ignored", value: (p) => (num(p, "reading") * num(p, "percent")) / 100 }],
    },
    {
      id: "maximum-value",
      unit: "volt",
      kind: "final",
      formulaId: () => "maximum-true-value",
      expected: (p, v) => num(p, "reading") + prior(v, "absolute-error"),
      substitution: (p, v, locale) => `${fmt(num(p, "reading"), locale)} + ${fmt(prior(v, "absolute-error"), locale)}`,
    },
  ],
};

// ---- motors (topic electric-motors) -------------------------------------------------------------------

const motorSpeed: TaskTemplate = {
  id: "motor.synchronous-speed",
  version: 1,
  topicId: "electric-motors",
  difficulty: 1,
  scenarioKey: () => "motor.synchronous-speed",
  generate: (rng) => ({ frequency: 50, polePairs: rng.pick([1, 2, 3, 4]) }),
  givens: givensOf([
    ["frequency", "frequency", "hertz"],
    ["polePairs", "polePairs", "dimensionless"],
  ]),
  steps: [
    {
      id: "synchronous-speed",
      unit: "revolutionPerMinute",
      kind: "final",
      formulaId: () => "synchronous-speed",
      expected: (p) => calculateMotor({ frequency_Hz: num(p, "frequency"), polePairs: num(p, "polePairs") }).result.synchronousSpeed_rpm!,
      substitution: (p, _v, locale) => `nₛ = 60 · ${fmt(num(p, "frequency"), locale)} / ${fmt(num(p, "polePairs"), locale)}`,
      misconceptions: [{ id: "speed-per-second", value: (p) => num(p, "frequency") / num(p, "polePairs") }],
    },
  ],
};

const SYNCHRONOUS: Record<number, number[]> = { 1: [2880, 2900, 2940], 2: [1410, 1425, 1440], 3: [940, 960, 970], 4: [700, 720, 730] };

const motorSlip: TaskTemplate = {
  id: "motor.slip",
  version: 1,
  topicId: "electric-motors",
  difficulty: 2,
  scenarioKey: () => "motor.slip",
  generate: (rng) => {
    const polePairs = rng.pick([1, 2, 3, 4]);
    return { frequency: 50, polePairs, rotorSpeed: rng.pick(SYNCHRONOUS[polePairs]!) };
  },
  givens: givensOf([
    ["frequency", "frequency", "hertz"],
    ["polePairs", "polePairs", "dimensionless"],
    ["rotorSpeed", "rotorSpeed", "revolutionPerMinute"],
  ]),
  steps: [
    {
      id: "synchronous-speed",
      unit: "revolutionPerMinute",
      kind: "intermediate",
      formulaId: () => "synchronous-speed",
      expected: (p) => (60 * num(p, "frequency")) / num(p, "polePairs"),
      substitution: (p, _v, locale) => `nₛ = 60 · ${fmt(num(p, "frequency"), locale)} / ${fmt(num(p, "polePairs"), locale)}`,
    },
    {
      id: "slip",
      unit: "percent",
      kind: "percent",
      formulaId: () => "slip",
      expected: (p, v) => ((prior(v, "synchronous-speed") - num(p, "rotorSpeed")) / prior(v, "synchronous-speed")) * 100,
      substitution: (p, v, locale) => `s = (${fmt(prior(v, "synchronous-speed"), locale)} − ${fmt(num(p, "rotorSpeed"), locale)}) / ${fmt(prior(v, "synchronous-speed"), locale)} · 100`,
    },
  ],
};

const motorCurrent: TaskTemplate = {
  id: "motor.rated-current",
  version: 1,
  topicId: "electric-motors",
  difficulty: 3,
  scenarioKey: () => "motor.rated-current",
  generate: (rng) => ({ ratedPower: rng.pick([1100, 2200, 4000, 5500, 7500]), voltage: 400, efficiency: rng.pick([0.8, 0.85, 0.9]), powerFactor: rng.pick([0.75, 0.8, 0.85]) }),
  givens: givensOf([
    ["ratedPower", "ratedPower", "watt"],
    ["voltage", "voltage", "volt"],
    ["efficiency", "efficiency", "dimensionless"],
    ["powerFactor", "powerFactor", "dimensionless"],
  ]),
  steps: [
    {
      id: "rated-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "motor-rated-current",
      expected: (p) => calculateMotor({ ratedPower_W: num(p, "ratedPower"), voltage_V: num(p, "voltage"), efficiency: num(p, "efficiency"), powerFactor: num(p, "powerFactor") }).result.ratedCurrent_A!,
      substitution: (p, _v, locale) => `I = ${fmt(num(p, "ratedPower"), locale)} / (√3 · ${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "efficiency"), locale)} · ${fmt(num(p, "powerFactor"), locale)})`,
      misconceptions: [
        { id: "root-three-missing", value: (p) => num(p, "ratedPower") / (num(p, "voltage") * num(p, "efficiency") * num(p, "powerFactor")) },
        { id: "efficiency-ignored", value: (p) => num(p, "ratedPower") / (Math.sqrt(3) * num(p, "voltage") * num(p, "powerFactor")) },
      ],
    },
  ],
};

// ---- short-circuit current (topic overcurrent-protection) -----------------------------------------------

const shortCircuitCurrent: TaskTemplate = {
  id: "short-circuit-current.current",
  version: 1,
  topicId: "overcurrent-protection",
  difficulty: 2,
  scenarioKey: () => "short-circuit-current.current",
  generate: (rng) => ({ phaseVoltage: 230, loopImpedance: rng.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1]) }),
  givens: givensOf([
    ["phaseVoltage", "phaseVoltage", "volt"],
    ["loopImpedance", "loopImpedance", "ohm"],
  ]),
  steps: [
    {
      id: "short-circuit-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "short-circuit-current",
      expected: (p) => calculateShortCircuit({ phaseVoltage_V: num(p, "phaseVoltage"), loopImpedance_ohm: num(p, "loopImpedance") }).result.shortCircuitCurrent_A,
      substitution: (p, _v, locale) => `I_k = ${fmt(num(p, "phaseVoltage"), locale)} / ${fmt(num(p, "loopImpedance"), locale)}`,
      misconceptions: [{ id: "ohms-law-inverted", value: (p) => num(p, "loopImpedance") / num(p, "phaseVoltage") }],
    },
  ],
};

const shortCircuitMaxImpedance: TaskTemplate = {
  id: "short-circuit-current.max-impedance",
  version: 1,
  topicId: "overcurrent-protection",
  difficulty: 3,
  scenarioKey: () => "short-circuit-current.max-impedance",
  generate: (rng) => ({ phaseVoltage: 230, tripCurrent: rng.pick([80, 100, 160, 200, 320, 460]) }),
  givens: givensOf([
    ["phaseVoltage", "phaseVoltage", "volt"],
    ["tripCurrent", "tripCurrent", "ampere"],
  ]),
  steps: [
    {
      id: "max-loop-impedance",
      unit: "ohm",
      kind: "final",
      formulaId: () => "maximum-loop-impedance",
      expected: (p) => calculateShortCircuit({ phaseVoltage_V: num(p, "phaseVoltage"), loopImpedance_ohm: 1, tripCurrent_A: num(p, "tripCurrent") }).result.maxLoopImpedance_ohm!,
      substitution: (p, _v, locale) => `Z_s,max = ${fmt(num(p, "phaseVoltage"), locale)} / ${fmt(num(p, "tripCurrent"), locale)}`,
      misconceptions: [{ id: "ohms-law-inverted", value: (p) => num(p, "tripCurrent") / num(p, "phaseVoltage") }],
    },
  ],
};

// ---- lighting (topic lighting-circuits) -----------------------------------------------------------------

const illuminanceBasic: TaskTemplate = {
  id: "illuminance.basic",
  version: 1,
  topicId: "lighting-circuits",
  difficulty: 1,
  scenarioKey: () => "illuminance.basic",
  generate: (rng) => ({ luminousFlux: rng.pick([2000, 3000, 4500, 6000, 9000]), area: rng.pick([10, 12, 15, 20, 30]) }),
  givens: givensOf([
    ["luminousFlux", "luminousFlux", "lumen"],
    ["area", "area", "squareMetre"],
  ]),
  steps: [
    {
      id: "illuminance",
      unit: "lux",
      kind: "final",
      formulaId: () => "illuminance",
      expected: (p) => calculateIlluminance({ luminousFlux_lm: num(p, "luminousFlux"), area_m2: num(p, "area") }).result.illuminance_lx,
      substitution: (p, _v, locale) => `E = ${fmt(num(p, "luminousFlux"), locale)} / ${fmt(num(p, "area"), locale)}`,
    },
  ],
};

const luminaireCount: TaskTemplate = {
  id: "illuminance.luminaires",
  version: 1,
  topicId: "lighting-circuits",
  difficulty: 2,
  scenarioKey: () => "illuminance.luminaires",
  generate: (rng) => ({ area: rng.pick([10, 12, 20, 24, 30]), target: rng.pick([100, 200, 300, 500]), luminaireFlux: rng.pick([1000, 1500, 2000, 3000]) }),
  givens: givensOf([
    ["area", "area", "squareMetre"],
    ["illuminanceTarget", "target", "lux"],
    ["luminaireFlux", "luminaireFlux", "lumen"],
  ]),
  steps: [
    {
      id: "needed-flux",
      unit: "lumen",
      kind: "intermediate",
      formulaId: () => "needed-flux",
      expected: (p) => num(p, "target") * num(p, "area"),
      substitution: (p, _v, locale) => `Φ = ${fmt(num(p, "target"), locale)} · ${fmt(num(p, "area"), locale)}`,
    },
    {
      id: "luminaire-count",
      unit: "dimensionless",
      kind: "final",
      formulaId: () => "luminaire-count",
      // Rounded up: a fractional luminaire does not exist.
      expected: (p) => calculateIlluminance({ luminousFlux_lm: 1, area_m2: num(p, "area"), targetIlluminance_lx: num(p, "target"), fluxPerLuminaire_lm: num(p, "luminaireFlux") }).result.luminairesNeeded!,
      substitution: (p, v, locale) => `N ≥ ${fmt(prior(v, "needed-flux"), locale)} / ${fmt(num(p, "luminaireFlux"), locale)}`,
      misconceptions: [{ id: "rounded-down", value: (p) => Math.floor((num(p, "target") * num(p, "area")) / num(p, "luminaireFlux")) }],
    },
  ],
};

// ---- PE continuity (topic continuity-of-pe) -----------------------------------------------------------------

const peExpected: TaskTemplate = {
  id: "pe-continuity.expected",
  version: 1,
  topicId: "continuity-of-pe",
  difficulty: 2,
  scenarioKey: () => "pe-continuity.expected",
  generate: (rng) => ({ resistivity: 0.0225, length: rng.pick([10, 15, 20, 30, 40]), crossSection: rng.pick([1.5, 2.5, 4, 6]), measured: rng.pick([0.15, 0.2, 0.3, 0.4]) }),
  givens: givensOf([
    ["resistivity", "resistivity", "ohmSquareMillimetrePerMetre"],
    ["length", "length", "metre"],
    ["crossSection", "crossSection", "squareMillimetre"],
    ["measured", "measured", "ohm"],
  ]),
  steps: [
    {
      id: "expected-resistance",
      unit: "ohm",
      kind: "intermediate",
      formulaId: () => "pe-expected-resistance",
      expected: (p) => calculatePeContinuityCheck({ resistivity_ohm_mm2_per_m: num(p, "resistivity"), length_m: num(p, "length"), crossSection_mm2: num(p, "crossSection"), measuredResistance_ohm: num(p, "measured") }).result.expectedResistance_ohm,
      substitution: (p, _v, locale) => `R = ${fmt(num(p, "resistivity"), locale)} · ${fmt(num(p, "length"), locale)} / ${fmt(num(p, "crossSection"), locale)}`,
      misconceptions: [{ id: "resistance-inverted", value: (p) => (num(p, "resistivity") * num(p, "crossSection")) / num(p, "length") }],
    },
    {
      id: "resistance-ratio",
      unit: "dimensionless",
      kind: "final",
      formulaId: () => "pe-resistance-ratio",
      expected: (p, v) => num(p, "measured") / prior(v, "expected-resistance"),
      substitution: (p, v, locale) => `k = ${fmt(num(p, "measured"), locale)} / ${fmt(prior(v, "expected-resistance"), locale)}`,
    },
  ],
};

// ---- material list (topic installation-planning) ---------------------------------------------------------------

const materialTotal: TaskTemplate = {
  id: "material-list.total",
  version: 1,
  topicId: "installation-planning",
  difficulty: 1,
  scenarioKey: () => "material-list.total",
  generate: (rng) => ({
    quantity1: rng.pick([20, 30, 50, 100]),
    price1: rng.pick([150, 200, 350]),
    quantity2: rng.pick([5, 10, 20]),
    price2: rng.pick([400, 600, 900]),
    quantity3: rng.pick([2, 4, 8]),
    price3: rng.pick([1200, 2500, 4000]),
  }),
  givens: givensOf([
    ["quantity1", "quantity1", "dimensionless"],
    ["price1", "price1", "dimensionless"],
    ["quantity2", "quantity2", "dimensionless"],
    ["price2", "price2", "dimensionless"],
    ["quantity3", "quantity3", "dimensionless"],
    ["price3", "price3", "dimensionless"],
  ]),
  steps: [
    {
      id: "material-total",
      unit: "dimensionless",
      kind: "final",
      formulaId: () => "material-total",
      expected: (p) =>
        calculateMaterialList({
          lines: [1, 2, 3].map((n) => ({ quantity: num(p, `quantity${n}`), unitPrice: num(p, `price${n}`) })),
        }).result.total,
      substitution: (p, _v, locale) => [1, 2, 3].map((n) => `${fmt(num(p, `quantity${n}`), locale)} · ${fmt(num(p, `price${n}`), locale)}`).join(" + "),
      misconceptions: [{ id: "quantities-not-multiplied", value: (p) => [1, 2, 3].reduce((sum, n) => sum + num(p, `price${n}`), 0) }],
    },
  ],
};

export const P2_TEMPLATES: readonly TaskTemplate[] = [
  acImpedanceRl,
  acValuesPeak,
  capacitorSeries,
  capacitorEnergy,
  rcTimeConstant,
  inductorEnergy,
  inductorTimeConstant,
  sourceShortCircuit,
  sourceTerminal,
  transformerVoltage,
  transformerCurrent,
  chargeBasic,
  wheatstone,
  meterShunt,
  measurementError,
  motorSpeed,
  motorSlip,
  motorCurrent,
  shortCircuitCurrent,
  shortCircuitMaxImpedance,
  illuminanceBasic,
  luminaireCount,
  peExpected,
  materialTotal,
];

