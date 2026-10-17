import { calculateConnectionPower, calculatePhaseLoad } from "../../calc/installation.js";
import { formatNumber } from "../../format.js";
import type { Locale } from "../../locales.js";
import type { PriorValues, StepSpec, TaskParams, TaskTemplate } from "../types.js";

/**
 * Practice for the installation-side calculators (plan §2.2, K13): connection
 * power and phase balancing. Textbook formulas only; every expected value calls
 * calc/installation.ts. The breaker ratings used here are the usual practice
 * values, not a table of the standard, and need a teacher's review.
 */

const num = (params: TaskParams, key: string): number => Number(params[key]);
const prior = (values: PriorValues, key: string): number => values[key] ?? Number.NaN;

function fmt(value: number, locale: Locale): string {
  return formatNumber(value, locale, { maximumSignificantDigits: 4, useGrouping: false });
}

const BREAKERS = [16, 20, 25, 32, 40, 50, 63];

// ---- connection power (topic service-connection-and-metering) ---------------

const available = (system: "single-phase" | "three-phase", isFinal: boolean): StepSpec => ({
  id: "available-power",
  unit: "watt",
  kind: isFinal ? "final" : "intermediate",
  formulaId: () => (system === "three-phase" ? "available-power-three-phase" : "available-power-single-phase"),
  expected: (p) =>
    calculateConnectionPower({ system, voltage_V: num(p, "voltage"), mainBreaker_A: num(p, "mainBreaker") }).result.availablePower_W,
  substitution: (p, _v, locale) =>
    `P = ${system === "three-phase" ? "√3 · " : ""}${fmt(num(p, "voltage"), locale)} · ${fmt(num(p, "mainBreaker"), locale)}`,
  misconceptions:
    system === "three-phase"
      ? [{ id: "root-three-missing", value: (p) => num(p, "voltage") * num(p, "mainBreaker") }]
      : [],
});

const connectionGivens = (p: TaskParams) => [
  { id: "voltage", value: num(p, "voltage"), unit: "volt" as const },
  { id: "mainBreaker", value: num(p, "mainBreaker"), unit: "ampere" as const },
];

const connectionSingle: TaskTemplate = {
  id: "connection-power.single-phase",
  version: 1,
  topicId: "service-connection-and-metering",
  difficulty: 1,
  scenarioKey: () => "connection-power.single-phase",
  generate: (rng) => ({ voltage: 230, mainBreaker: rng.pick(BREAKERS.slice(0, 4)) }),
  givens: connectionGivens,
  steps: [available("single-phase", true)],
};

const connectionThree: TaskTemplate = {
  id: "connection-power.three-phase",
  version: 1,
  topicId: "service-connection-and-metering",
  difficulty: 2,
  scenarioKey: () => "connection-power.three-phase",
  generate: (rng) => ({ voltage: 400, mainBreaker: rng.pick(BREAKERS) }),
  givens: connectionGivens,
  steps: [available("three-phase", true)],
};

const connectionMargin: TaskTemplate = {
  id: "connection-power.margin",
  version: 1,
  topicId: "service-connection-and-metering",
  difficulty: 3,
  scenarioKey: () => "connection-power.margin",
  generate: (rng) => {
    const mainBreaker = rng.pick(BREAKERS);
    const capacity = Math.sqrt(3) * 400 * mainBreaker;
    // A demand between 40 % and 90 % of the capacity, in whole hundred watts.
    const demand = Math.round((capacity * rng.pick([0.4, 0.5, 0.6, 0.7, 0.8, 0.9])) / 100) * 100;
    return { voltage: 400, mainBreaker, demand };
  },
  givens: (p) => [...connectionGivens(p), { id: "demand", value: num(p, "demand"), unit: "watt" }],
  steps: [
    available("three-phase", false),
    {
      id: "power-margin",
      unit: "watt",
      kind: "final",
      formulaId: () => "power-margin",
      expected: (p) =>
        calculateConnectionPower({
          system: "three-phase",
          voltage_V: num(p, "voltage"),
          mainBreaker_A: num(p, "mainBreaker"),
          demandPower_W: num(p, "demand"),
        }).result.margin_W!,
      substitution: (p, v, locale) => `ΔP = ${fmt(prior(v, "available-power"), locale)} − ${fmt(num(p, "demand"), locale)}`,
    },
  ],
};

// ---- phase balancing (topic distribution-boards) -----------------------------

/** Fixed wiring in every task: circuits 1-2 on L1, circuit 3 on L2, circuits 4-5 on L3. */
const PHASE_OF = [0, 0, 1, 2, 2];
const CURRENTS = [2, 4, 6, 8, 10, 13, 16];
const circuits = (p: TaskParams) => PHASE_OF.map((phase, i) => ({ current_A: num(p, `circuit${i + 1}Current`), phase }));
const load = (p: TaskParams) => calculatePhaseLoad(circuits(p)).result;

const circuitGivens = (p: TaskParams) =>
  PHASE_OF.map((_phase, i) => ({ id: `circuit${i + 1}Current`, value: num(p, `circuit${i + 1}Current`), unit: "ampere" as const }));

function generateCircuits(rng: { pick<T>(items: readonly T[]): T }, requireUniqueMax: boolean): TaskParams {
  for (let attempt = 0; attempt < 200; attempt++) {
    const params: TaskParams = {};
    PHASE_OF.forEach((_phase, i) => (params[`circuit${i + 1}Current`] = rng.pick(CURRENTS)));
    const sums = load(params).phaseCurrents_A;
    const max = Math.max(...sums);
    const unique = sums.filter((s) => s === max).length === 1;
    // A zero spread would make the imbalance step meaningless.
    if (max !== Math.min(...sums) && (!requireUniqueMax || unique)) return params;
  }
  return PHASE_FALLBACK;
}

/** L1 = 14 A, L2 = 6 A, L3 = 18 A: unique most loaded phase. */
export const PHASE_FALLBACK: TaskParams = {
  circuit1Current: 10,
  circuit2Current: 4,
  circuit3Current: 6,
  circuit4Current: 8,
  circuit5Current: 10,
};

const phaseStep = (index: 0 | 1 | 2, isFinal: boolean): StepSpec => ({
  id: (["phase-current-l1", "phase-current-l2", "phase-current-l3"] as const)[index],
  unit: "ampere",
  kind: isFinal ? "final" : "intermediate",
  formulaId: () => "phase-current",
  expected: (p) => load(p).phaseCurrents_A[index],
  substitution: (p, _v, locale) =>
    `I = ${circuits(p).filter((c) => c.phase === index).map((c) => fmt(c.current_A, locale)).join(" + ")}`,
});

const phaseOne: TaskTemplate = {
  id: "phase-balancing.one-phase",
  version: 1,
  topicId: "distribution-boards",
  difficulty: 1,
  scenarioKey: () => "phase-balancing.one-phase",
  generate: (rng) => generateCircuits(rng, false),
  givens: circuitGivens,
  steps: [phaseStep(0, true)],
};

const phaseAll: TaskTemplate = {
  id: "phase-balancing.all-phases",
  version: 1,
  topicId: "distribution-boards",
  difficulty: 2,
  scenarioKey: () => "phase-balancing.all-phases",
  generate: (rng) => generateCircuits(rng, false),
  givens: circuitGivens,
  steps: [phaseStep(0, false), phaseStep(1, false), phaseStep(2, true)],
};

const phaseImbalance: TaskTemplate = {
  id: "phase-balancing.imbalance",
  version: 1,
  topicId: "distribution-boards",
  difficulty: 3,
  scenarioKey: () => "phase-balancing.imbalance",
  generate: (rng) => generateCircuits(rng, true),
  givens: circuitGivens,
  steps: [
    phaseStep(0, false),
    phaseStep(1, false),
    phaseStep(2, false),
    {
      id: "most-loaded-phase",
      unit: "dimensionless",
      kind: "selection",
      formulaId: () => "most-loaded-phase",
      options: () => [
        { value: 1, label: "L1" },
        { value: 2, label: "L2" },
        { value: 3, label: "L3" },
      ],
      // Judged against the student's own phase currents (error carried forward).
      expected: (_p, v) => {
        const sums = [prior(v, "phase-current-l1"), prior(v, "phase-current-l2"), prior(v, "phase-current-l3")];
        return sums.indexOf(Math.max(...sums)) + 1;
      },
      substitution: (_p, v, locale) =>
        `max(${["phase-current-l1", "phase-current-l2", "phase-current-l3"].map((id) => fmt(prior(v, id), locale)).join("; ")})`,
    },
    {
      id: "phase-imbalance",
      unit: "ampere",
      kind: "final",
      formulaId: () => "phase-imbalance",
      expected: (_p, v) => {
        const sums = [prior(v, "phase-current-l1"), prior(v, "phase-current-l2"), prior(v, "phase-current-l3")];
        return Math.max(...sums) - Math.min(...sums);
      },
      substitution: (_p, v, locale) => {
        const sums = [prior(v, "phase-current-l1"), prior(v, "phase-current-l2"), prior(v, "phase-current-l3")];
        return `ΔI = ${fmt(Math.max(...sums), locale)} − ${fmt(Math.min(...sums), locale)}`;
      },
    },
  ],
};

export const INSTALLATION_TEMPLATES: readonly TaskTemplate[] = [
  connectionSingle,
  connectionThree,
  connectionMargin,
  phaseOne,
  phaseAll,
  phaseImbalance,
];
