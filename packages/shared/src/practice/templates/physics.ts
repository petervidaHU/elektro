import {
  calculateLoadDemand,
  currentFromVoltageResistance,
  parallelResistance,
  powerDc,
  powerSinglePhase,
  powerThreePhase,
  resistanceFromVoltageCurrent,
  seriesResistance,
  voltageFromCurrentResistance,
} from "../../calc/physics.js";
import { formatNumber } from "../../format.js";
import type { Locale } from "../../locales.js";
import type { PriorValues, StepSpec, TaskParams, TaskTemplate } from "../types.js";

/**
 * Practice for the P1 physics calculators (plan §2.2, K7): Ohm's law, series
 * and parallel circuits, DC and AC power, consumer demand. Textbook formulas
 * only; every expected value calls the engine in calc/physics.ts. Parameter
 * values are round practice numbers and need a teacher's review like the rest.
 */

const num = (params: TaskParams, key: string): number => Number(params[key]);
const prior = (values: PriorValues, key: string): number => values[key] ?? Number.NaN;

function fmt(value: number, locale: Locale): string {
  return formatNumber(value, locale, { maximumSignificantDigits: 4, useGrouping: false });
}

const VOLTAGES = [12, 24, 48, 230];
const RESISTANCES = [10, 12, 15, 20, 24, 30, 40, 46, 60, 100];

// ---- Ohm's law (topic ohms-law) ---------------------------------------------

const ohmsCurrent: TaskTemplate = {
  id: "ohms-law.current",
  version: 1,
  topicId: "ohms-law",
  difficulty: 1,
  scenarioKey: () => "ohms-law.current",
  generate: (rng) => ({ voltage: rng.pick(VOLTAGES), resistance: rng.pick(RESISTANCES) }),
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "resistance", value: num(p, "resistance"), unit: "ohm" },
  ],
  steps: [
    {
      id: "current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "ohms-law-current",
      expected: (p) => currentFromVoltageResistance(num(p, "voltage"), num(p, "resistance")),
      substitution: (p, _v, locale) => `I = ${fmt(num(p, "voltage"), locale)} / ${fmt(num(p, "resistance"), locale)}`,
      misconceptions: [
        { id: "ohms-law-inverted", value: (p) => num(p, "resistance") / num(p, "voltage") },
      ],
    },
  ],
};

const ohmsVoltage: TaskTemplate = {
  id: "ohms-law.voltage",
  version: 1,
  topicId: "ohms-law",
  difficulty: 1,
  scenarioKey: () => "ohms-law.voltage",
  generate: (rng) => ({ current: rng.pick([0.5, 1, 2, 2.5, 4, 5, 10]), resistance: rng.pick(RESISTANCES) }),
  givens: (p) => [
    { id: "current", value: num(p, "current"), unit: "ampere" },
    { id: "resistance", value: num(p, "resistance"), unit: "ohm" },
  ],
  steps: [
    {
      id: "voltage",
      unit: "volt",
      kind: "final",
      formulaId: () => "ohms-law-voltage",
      expected: (p) => voltageFromCurrentResistance(num(p, "current"), num(p, "resistance")),
      substitution: (p, _v, locale) => `U = ${fmt(num(p, "current"), locale)} · ${fmt(num(p, "resistance"), locale)}`,
      misconceptions: [
        { id: "ohms-law-inverted", value: (p) => num(p, "current") / num(p, "resistance") },
      ],
    },
  ],
};

const ohmsResistance: TaskTemplate = {
  id: "ohms-law.resistance",
  version: 1,
  topicId: "ohms-law",
  difficulty: 2,
  scenarioKey: () => "ohms-law.resistance",
  generate: (rng) => {
    const current = rng.pick([0.5, 1, 2, 2.5, 4, 5, 10]);
    return { voltage: rng.pick(VOLTAGES), current };
  },
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "current", value: num(p, "current"), unit: "ampere" },
  ],
  steps: [
    {
      id: "resistance",
      unit: "ohm",
      kind: "final",
      formulaId: () => "ohms-law-resistance",
      expected: (p) => resistanceFromVoltageCurrent(num(p, "voltage"), num(p, "current")),
      substitution: (p, _v, locale) => `R = ${fmt(num(p, "voltage"), locale)} / ${fmt(num(p, "current"), locale)}`,
      misconceptions: [
        { id: "ohms-law-inverted", value: (p) => num(p, "current") / num(p, "voltage") },
      ],
    },
  ],
};

// ---- series and parallel circuits (topic series-parallel-circuits) ---------

const parallelStep = (resistancesOf: (p: TaskParams) => number[]): StepSpec => ({
  id: "parallel-resistance",
  unit: "ohm",
  kind: "intermediate",
  formulaId: () => "parallel-resistance",
  expected: (p) => parallelResistance(resistancesOf(p)),
  substitution: (p, _v, locale) =>
    `1/R = ${resistancesOf(p).map((r) => `1/${fmt(r, locale)}`).join(" + ")}`,
  misconceptions: [{ id: "parallel-resistance-added", value: (p) => seriesResistance(resistancesOf(p)) }],
});

const PAIRS: [number, number][] = [[6, 3], [12, 4], [10, 10], [20, 5], [30, 60], [12, 6], [15, 10]];

const parallelTwo: TaskTemplate = {
  id: "series-parallel.parallel-two",
  version: 1,
  topicId: "series-parallel-circuits",
  difficulty: 1,
  scenarioKey: () => "series-parallel.parallel-two",
  generate: (rng) => {
    const [r1, r2] = rng.pick(PAIRS);
    return { resistance1: r1, resistance2: r2 };
  },
  givens: (p) => [
    { id: "resistance1", value: num(p, "resistance1"), unit: "ohm" },
    { id: "resistance2", value: num(p, "resistance2"), unit: "ohm" },
  ],
  steps: [
    {
      ...parallelStep((p) => [num(p, "resistance1"), num(p, "resistance2")]),
      id: "total-resistance",
      kind: "final",
    },
  ],
};

const seriesDivider: TaskTemplate = {
  id: "series-parallel.series-divider",
  version: 1,
  topicId: "series-parallel-circuits",
  difficulty: 2,
  scenarioKey: () => "series-parallel.series-divider",
  generate: (rng) => ({
    voltage: rng.pick([12, 24, 48, 230]),
    resistance1: rng.pick([10, 20, 30, 40, 60]),
    resistance2: rng.pick([10, 20, 30, 40, 60]),
  }),
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "resistance1", value: num(p, "resistance1"), unit: "ohm" },
    { id: "resistance2", value: num(p, "resistance2"), unit: "ohm" },
  ],
  steps: [
    {
      id: "total-resistance",
      unit: "ohm",
      kind: "intermediate",
      formulaId: () => "series-resistance",
      expected: (p) => seriesResistance([num(p, "resistance1"), num(p, "resistance2")]),
      substitution: (p, _v, locale) => `R = ${fmt(num(p, "resistance1"), locale)} + ${fmt(num(p, "resistance2"), locale)}`,
    },
    {
      id: "current",
      unit: "ampere",
      kind: "intermediate",
      formulaId: () => "ohms-law-current",
      expected: (p, v) => currentFromVoltageResistance(num(p, "voltage"), prior(v, "total-resistance")),
      substitution: (p, v, locale) => `I = ${fmt(num(p, "voltage"), locale)} / ${fmt(prior(v, "total-resistance"), locale)}`,
      misconceptions: [
        { id: "ohms-law-inverted", value: (p, v) => prior(v, "total-resistance") / num(p, "voltage") },
      ],
    },
    {
      id: "voltage",
      unit: "volt",
      kind: "final",
      formulaId: () => "ohms-law-voltage",
      expected: (p, v) => voltageFromCurrentResistance(prior(v, "current"), num(p, "resistance2")),
      substitution: (p, v, locale) => `U₂ = ${fmt(prior(v, "current"), locale)} · ${fmt(num(p, "resistance2"), locale)}`,
    },
  ],
};

const mixed: TaskTemplate = {
  id: "series-parallel.mixed",
  version: 1,
  topicId: "series-parallel-circuits",
  difficulty: 3,
  scenarioKey: () => "series-parallel.mixed",
  generate: (rng) => {
    const [r2, r3] = rng.pick(PAIRS);
    return { voltage: rng.pick([12, 24, 48]), resistance1: rng.pick([4, 5, 8, 10]), resistance2: r2, resistance3: r3 };
  },
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "resistance1", value: num(p, "resistance1"), unit: "ohm" },
    { id: "resistance2", value: num(p, "resistance2"), unit: "ohm" },
    { id: "resistance3", value: num(p, "resistance3"), unit: "ohm" },
  ],
  steps: [
    parallelStep((p) => [num(p, "resistance2"), num(p, "resistance3")]),
    {
      id: "total-resistance",
      unit: "ohm",
      kind: "intermediate",
      formulaId: () => "mixed-resistance",
      expected: (p, v) => num(p, "resistance1") + prior(v, "parallel-resistance"),
      substitution: (p, v, locale) => `R = ${fmt(num(p, "resistance1"), locale)} + ${fmt(prior(v, "parallel-resistance"), locale)}`,
    },
    {
      id: "total-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "ohms-law-current",
      expected: (p, v) => currentFromVoltageResistance(num(p, "voltage"), prior(v, "total-resistance")),
      substitution: (p, v, locale) => `I = ${fmt(num(p, "voltage"), locale)} / ${fmt(prior(v, "total-resistance"), locale)}`,
      misconceptions: [
        { id: "ohms-law-inverted", value: (p, v) => prior(v, "total-resistance") / num(p, "voltage") },
      ],
    },
  ],
};

// ---- power and energy (topic power-and-energy) -------------------------------

const powerBasic: TaskTemplate = {
  id: "power-dc.basic",
  version: 1,
  topicId: "power-and-energy",
  difficulty: 1,
  scenarioKey: () => "power-dc.basic",
  generate: (rng) => ({ voltage: rng.pick(VOLTAGES), current: rng.pick([0.5, 1, 2, 2.5, 4, 5, 10]) }),
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "current", value: num(p, "current"), unit: "ampere" },
  ],
  steps: [
    {
      id: "power",
      unit: "watt",
      kind: "final",
      formulaId: () => "power-dc",
      expected: (p) => powerDc({ voltage_V: num(p, "voltage"), current_A: num(p, "current") }).result.power_W,
      substitution: (p, _v, locale) => `P = ${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "current"), locale)}`,
    },
  ],
};

const powerEnergy: TaskTemplate = {
  id: "power-dc.resistance-energy",
  version: 1,
  topicId: "power-and-energy",
  difficulty: 2,
  scenarioKey: () => "power-dc.resistance-energy",
  generate: (rng) => ({
    current: rng.pick([2, 4, 5, 8, 10]),
    resistance: rng.pick([10, 12, 15, 20, 23, 25]),
    duration: rng.pick([0.5, 1, 2, 3, 4, 8]),
  }),
  givens: (p) => [
    { id: "current", value: num(p, "current"), unit: "ampere" },
    { id: "resistance", value: num(p, "resistance"), unit: "ohm" },
    { id: "duration", value: num(p, "duration"), unit: "hour" },
  ],
  steps: [
    {
      id: "power",
      unit: "watt",
      kind: "intermediate",
      formulaId: () => "power-dc-from-current",
      expected: (p) => powerDc({ current_A: num(p, "current"), resistance_ohm: num(p, "resistance") }).result.power_W,
      substitution: (p, _v, locale) => `P = ${fmt(num(p, "current"), locale)}² · ${fmt(num(p, "resistance"), locale)}`,
      misconceptions: [
        { id: "current-not-squared", value: (p) => num(p, "current") * num(p, "resistance") },
      ],
    },
    {
      id: "energy",
      unit: "kilowattHour",
      kind: "final",
      formulaId: () => "energy",
      expected: (p, v) => (prior(v, "power") * num(p, "duration")) / 1000,
      substitution: (p, v, locale) => `W = ${fmt(prior(v, "power"), locale)} W · ${fmt(num(p, "duration"), locale)} h / 1000`,
    },
  ],
};

const LOAD_POWERS = [100, 200, 500, 800, 1000, 1500, 2000];
const LOAD_HOURS = [0.5, 1, 2, 3, 4, 6, 8];

const loadParams = (p: TaskParams) =>
  [1, 2, 3].map((n) => ({ power_W: num(p, `load${n}Power`), hoursPerDay: num(p, `load${n}Hours`) }));

const loadDemand: TaskTemplate = {
  id: "load-demand.single-phase",
  version: 1,
  topicId: "power-and-energy",
  difficulty: 3,
  scenarioKey: () => "load-demand.single-phase",
  generate: (rng) => {
    const params: TaskParams = {};
    for (const n of [1, 2, 3]) {
      params[`load${n}Power`] = rng.pick(LOAD_POWERS);
      params[`load${n}Hours`] = rng.pick(LOAD_HOURS);
    }
    return params;
  },
  givens: (p) =>
    [1, 2, 3].flatMap((n) => [
      { id: `load${n}Power`, value: num(p, `load${n}Power`), unit: "watt" as const },
      { id: `load${n}Hours`, value: num(p, `load${n}Hours`), unit: "hour" as const },
    ]),
  steps: [
    {
      id: "total-power",
      unit: "watt",
      kind: "intermediate",
      formulaId: () => "total-power",
      expected: (p) =>
        calculateLoadDemand({ loads: loadParams(p), voltage_V: 230, system: "single-phase", powerFactor: 1 }).result.totalPower_W,
      substitution: (p, _v, locale) => `P = ${loadParams(p).map((l) => fmt(l.power_W, locale)).join(" + ")}`,
    },
    {
      id: "daily-energy",
      unit: "kilowattHour",
      kind: "intermediate",
      formulaId: () => "daily-energy",
      expected: (p) =>
        calculateLoadDemand({ loads: loadParams(p), voltage_V: 230, system: "single-phase", powerFactor: 1 }).result.dailyEnergy_kWh,
      substitution: (p, _v, locale) =>
        `W = (${loadParams(p).map((l) => `${fmt(l.power_W, locale)} · ${fmt(l.hoursPerDay, locale)}`).join(" + ")}) / 1000`,
    },
    {
      id: "design-current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "current-single-phase",
      expected: (_p, v) => prior(v, "total-power") / 230,
      substitution: (_p, v, locale) => `Ib = ${fmt(prior(v, "total-power"), locale)} / 230`,
    },
  ],
};

// ---- AC power (topics ac-fundamentals, three-phase-systems) ------------------

const acGivens = (p: TaskParams, voltageId: string) => [
  { id: voltageId, value: num(p, "voltage"), unit: "volt" as const },
  { id: "current", value: num(p, "current"), unit: "ampere" as const },
  { id: "powerFactor", value: num(p, "powerFactor"), unit: "dimensionless" as const },
];

const singleAc = (p: TaskParams) =>
  powerSinglePhase({ voltage_V: num(p, "voltage"), current_A: num(p, "current"), powerFactor: num(p, "powerFactor") }).result;

const apparentSingle: StepSpec = {
  id: "apparent-power",
  unit: "voltampere",
  kind: "intermediate",
  formulaId: () => "apparent-power-single-phase",
  expected: (p) => singleAc(p).apparentPower_VA,
  substitution: (p, _v, locale) => `S = ${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "current"), locale)}`,
};

const activeSingle = (isFinal: boolean): StepSpec => ({
  id: "active-power",
  unit: "watt",
  kind: isFinal ? "final" : "intermediate",
  formulaId: () => "active-power-single-phase",
  expected: (p) => singleAc(p).activePower_W,
  substitution: (p, v, locale) => `P = ${fmt(prior(v, "apparent-power"), locale)} · ${fmt(num(p, "powerFactor"), locale)}`,
  misconceptions: [{ id: "power-factor-ignored", value: (p) => singleAc(p).apparentPower_VA }],
});

const acSingleActive: TaskTemplate = {
  id: "power-ac-single.active",
  version: 1,
  topicId: "ac-fundamentals",
  difficulty: 1,
  scenarioKey: () => "power-ac-single.active",
  generate: (rng) => ({ voltage: 230, current: rng.pick([2, 4, 5, 8, 10, 16]), powerFactor: rng.pick([0.6, 0.7, 0.8, 0.9]) }),
  givens: (p) => acGivens(p, "voltage"),
  steps: [apparentSingle, activeSingle(true)],
};

const acSingleReactive: TaskTemplate = {
  id: "power-ac-single.reactive",
  version: 1,
  topicId: "ac-fundamentals",
  difficulty: 2,
  scenarioKey: () => "power-ac-single.reactive",
  generate: (rng) => ({ voltage: 230, current: rng.pick([2, 4, 5, 8, 10, 16]), powerFactor: rng.pick([0.6, 0.8, 0.9]) }),
  givens: (p) => acGivens(p, "voltage"),
  steps: [
    apparentSingle,
    activeSingle(false),
    {
      id: "reactive-power",
      unit: "var",
      kind: "final",
      formulaId: () => "reactive-power",
      expected: (_p, v) => Math.sqrt(prior(v, "apparent-power") ** 2 - prior(v, "active-power") ** 2),
      substitution: (_p, v, locale) => `Q = √(${fmt(prior(v, "apparent-power"), locale)}² − ${fmt(prior(v, "active-power"), locale)}²)`,
    },
  ],
};

const acSingleCurrent: TaskTemplate = {
  id: "power-ac-single.current",
  version: 1,
  topicId: "ac-fundamentals",
  difficulty: 3,
  scenarioKey: () => "power-ac-single.current",
  generate: (rng) => ({ voltage: 230, power: rng.pick([500, 1000, 1500, 2000, 2300]), powerFactor: rng.pick([0.5, 0.8, 0.9]) }),
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "power", value: num(p, "power"), unit: "watt" },
    { id: "powerFactor", value: num(p, "powerFactor"), unit: "dimensionless" },
  ],
  steps: [
    {
      id: "current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "current-single-phase",
      expected: (p) =>
        powerSinglePhase({ voltage_V: num(p, "voltage"), activePower_W: num(p, "power"), powerFactor: num(p, "powerFactor") }).result.current_A,
      substitution: (p, _v, locale) =>
        `I = ${fmt(num(p, "power"), locale)} / (${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "powerFactor"), locale)})`,
      misconceptions: [{ id: "power-factor-ignored", value: (p) => num(p, "power") / num(p, "voltage") }],
    },
  ],
};

const threeAc = (p: TaskParams) =>
  powerThreePhase({ lineVoltage_V: num(p, "voltage"), current_A: num(p, "current"), powerFactor: num(p, "powerFactor") }).result;

const acThreeActive: TaskTemplate = {
  id: "power-three-phase.active",
  version: 1,
  topicId: "three-phase-systems",
  difficulty: 2,
  scenarioKey: () => "power-three-phase.active",
  generate: (rng) => ({ voltage: 400, current: rng.pick([5, 8, 10, 16, 20, 25]), powerFactor: rng.pick([0.8, 0.85, 0.9, 1]) }),
  givens: (p) => acGivens(p, "voltage"),
  steps: [
    {
      id: "apparent-power",
      unit: "voltampere",
      kind: "intermediate",
      formulaId: () => "apparent-power-three-phase",
      expected: (p) => threeAc(p).apparentPower_VA,
      substitution: (p, _v, locale) => `S = √3 · ${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "current"), locale)}`,
      misconceptions: [{ id: "root-three-missing", value: (p) => num(p, "voltage") * num(p, "current") }],
    },
    {
      id: "active-power",
      unit: "watt",
      kind: "final",
      formulaId: () => "active-power-three-phase",
      expected: (p) => threeAc(p).activePower_W,
      substitution: (p, v, locale) => `P = ${fmt(prior(v, "apparent-power"), locale)} · ${fmt(num(p, "powerFactor"), locale)}`,
      misconceptions: [
        { id: "power-factor-ignored", value: (p) => (num(p, "powerFactor") < 1 ? threeAc(p).apparentPower_VA : null) },
        { id: "root-three-missing", value: (p) => num(p, "voltage") * num(p, "current") * num(p, "powerFactor") },
      ],
    },
  ],
};

const acThreeCurrent: TaskTemplate = {
  id: "power-three-phase.current",
  version: 1,
  topicId: "three-phase-systems",
  difficulty: 3,
  scenarioKey: () => "power-three-phase.current",
  generate: (rng) => ({ voltage: 400, power: rng.pick([3000, 5000, 7500, 11000, 15000]), powerFactor: rng.pick([0.8, 0.9, 1]) }),
  givens: (p) => [
    { id: "voltage", value: num(p, "voltage"), unit: "volt" },
    { id: "power", value: num(p, "power"), unit: "watt" },
    { id: "powerFactor", value: num(p, "powerFactor"), unit: "dimensionless" },
  ],
  steps: [
    {
      id: "current",
      unit: "ampere",
      kind: "final",
      formulaId: () => "current-three-phase",
      expected: (p) =>
        powerThreePhase({ lineVoltage_V: num(p, "voltage"), activePower_W: num(p, "power"), powerFactor: num(p, "powerFactor") }).result.current_A,
      substitution: (p, _v, locale) =>
        `I = ${fmt(num(p, "power"), locale)} / (√3 · ${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "powerFactor"), locale)})`,
      misconceptions: [
        { id: "root-three-missing", value: (p) => num(p, "power") / (num(p, "voltage") * num(p, "powerFactor")) },
        { id: "power-factor-ignored", value: (p) => (num(p, "powerFactor") < 1 ? num(p, "power") / (Math.sqrt(3) * num(p, "voltage")) : null) },
      ],
    },
  ],
};

export const PHYSICS_TEMPLATES: readonly TaskTemplate[] = [
  ohmsCurrent,
  ohmsVoltage,
  ohmsResistance,
  parallelTwo,
  seriesDivider,
  mixed,
  powerBasic,
  powerEnergy,
  loadDemand,
  acSingleActive,
  acSingleReactive,
  acSingleCurrent,
  acThreeActive,
  acThreeCurrent,
];
