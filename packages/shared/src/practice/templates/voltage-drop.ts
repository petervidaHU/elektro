import {
  conductorResistance,
  minimumCrossSection,
  permittedVoltageDrop,
  phaseFactor,
  voltageDropFromResistance,
  voltageDropPercentOf,
  type PhaseSystem,
} from "../../calc/voltage-drop.js";
import { formatNumber } from "../../format.js";
import type { Locale } from "../../locales.js";
import {
  nextStandardCrossSection,
  RESISTIVITY_AT_OPERATING_TEMPERATURE,
  STANDARD_CROSS_SECTIONS_MM2,
  type ConductorMaterial,
} from "../../reference/conductors.js";
import type { Rng } from "../rng.js";
import type { MisconceptionCheck, PriorValues, StepSpec, TaskParams, TaskTemplate } from "../types.js";

/**
 * Voltage-drop practice (topic `voltage-drop`, KKK exam part III), from easy
 * to hard. Every expected value calls the engine in calc/voltage-drop.ts.
 *
 * Parameter ranges are for practice only and must be reviewed by a teacher:
 * - Load currents are kept at a conservative 2-4 A per mm2 of the chosen
 *   cross-section, so no task pairs a thin cable with a heavy load. The
 *   current-carrying capacity itself is taught from verified reference tables
 *   (plan §2.3), never from these numbers.
 * - The permitted drop in the selection task is presented as the designer's
 *   requirement for that run, not as a standard limit.
 * - Resistivity is the value of `RESISTIVITY_AT_OPERATING_TEMPERATURE` and is
 *   printed in every task, so the answer never depends on which convention the
 *   student learned (plan §2.4).
 */

const num = (params: TaskParams, key: string): number => Number(params[key]);
const systemOf = (params: TaskParams): PhaseSystem =>
  params["system"] === "three-phase" ? "three-phase" : "single-phase";
const prior = (values: PriorValues, key: string): number => values[key] ?? Number.NaN;

const NOMINAL_VOLTAGE: Record<PhaseSystem, number> = { "single-phase": 230, "three-phase": 400 };
const FACTOR_LABEL: Record<PhaseSystem, string> = { "single-phase": "2", "three-phase": "√3" };
const OTHER_SYSTEM: Record<PhaseSystem, PhaseSystem> = {
  "single-phase": "three-phase",
  "three-phase": "single-phase",
};

function fmt(value: number, locale: Locale): string {
  return formatNumber(value, locale, { maximumSignificantDigits: 4, useGrouping: false });
}

/** A load current at a conservative 2-4 A per mm2 (see the note above). */
function loadCurrent(rng: Rng, crossSection_mm2: number): number {
  return Math.max(3, Math.round(crossSection_mm2 * rng.pick([2, 2.5, 3, 4])));
}

// ---- steps shared by the templates -----------------------------------------

const phaseFactorStep: StepSpec = {
  id: "phase-factor",
  unit: "dimensionless",
  kind: "selection",
  formulaId: (p) =>
    systemOf(p) === "three-phase" ? "phase-factor-three-phase" : "phase-factor-single-phase",
  options: () => [
    { value: phaseFactor("single-phase"), label: FACTOR_LABEL["single-phase"] },
    { value: phaseFactor("three-phase"), label: FACTOR_LABEL["three-phase"] },
  ],
  expected: (p) => phaseFactor(systemOf(p)),
  substitution: (p) => `b = ${FACTOR_LABEL[systemOf(p)]}`,
  misconceptions: [
    { id: "phase-factor-wrong-system", value: (p) => phaseFactor(OTHER_SYSTEM[systemOf(p)]) },
  ],
};

const resistanceStep: StepSpec = {
  id: "conductor-resistance",
  unit: "ohm",
  kind: "intermediate",
  formulaId: () => "conductor-resistance",
  expected: (p) => conductorResistance(num(p, "resistivity"), num(p, "length"), num(p, "crossSection")),
  substitution: (p, _v, locale) =>
    `R = ${fmt(num(p, "resistivity"), locale)} · ${fmt(num(p, "length"), locale)} / ${fmt(num(p, "crossSection"), locale)}`,
  misconceptions: [
    {
      id: "resistance-inverted",
      value: (p) => conductorResistance(num(p, "resistivity"), num(p, "crossSection"), num(p, "length")),
    },
    {
      id: "length-doubled-in-resistance",
      value: (p) =>
        conductorResistance(num(p, "resistivity"), 2 * num(p, "length"), num(p, "crossSection")),
    },
  ],
};

/** dU from the student's R; `b` and cos(phi) come from the task. */
function voltageDropStep(withPowerFactorMistake: boolean): StepSpec {
  const misconceptions: MisconceptionCheck[] = [
    {
      id: "phase-factor-missing",
      value: (p, v) => prior(v, "conductor-resistance") * num(p, "current") * num(p, "powerFactor"),
    },
    {
      id: "phase-factor-wrong-system",
      value: (p, v) =>
        voltageDropFromResistance(
          phaseFactor(OTHER_SYSTEM[systemOf(p)]),
          prior(v, "conductor-resistance"),
          num(p, "current"),
          num(p, "powerFactor"),
        ),
    },
  ];
  if (withPowerFactorMistake) {
    misconceptions.push({
      id: "power-factor-ignored",
      value: (p, v) =>
        num(p, "powerFactor") < 1
          ? voltageDropFromResistance(phaseFactor(systemOf(p)), prior(v, "conductor-resistance"), num(p, "current"), 1)
          : null,
    });
  }

  return {
    id: "voltage-drop",
    unit: "volt",
    kind: "final",
    formulaId: () => "voltage-drop",
    expected: (p, v) =>
      voltageDropFromResistance(
        phaseFactor(systemOf(p)),
        prior(v, "conductor-resistance"),
        num(p, "current"),
        num(p, "powerFactor"),
      ),
    substitution: (p, v, locale) =>
      `ΔU = ${FACTOR_LABEL[systemOf(p)]} · ${fmt(prior(v, "conductor-resistance"), locale)} · ${fmt(num(p, "current"), locale)} · ${fmt(num(p, "powerFactor"), locale)}`,
    misconceptions,
  };
}

function percentStep(withReferenceMistake: boolean): StepSpec {
  const misconceptions: MisconceptionCheck[] = [
    {
      id: "percent-as-fraction",
      value: (p, v) => voltageDropPercentOf(prior(v, "voltage-drop"), num(p, "nominalVoltage")) / 100,
    },
  ];
  if (withReferenceMistake) {
    misconceptions.push({
      id: "wrong-reference-voltage",
      value: (p, v) =>
        voltageDropPercentOf(prior(v, "voltage-drop"), NOMINAL_VOLTAGE[OTHER_SYSTEM[systemOf(p)]]),
    });
  }

  return {
    id: "voltage-drop-percent",
    unit: "percent",
    kind: "percent",
    formulaId: () => "voltage-drop-percent",
    expected: (p, v) => voltageDropPercentOf(prior(v, "voltage-drop"), num(p, "nominalVoltage")),
    substitution: (p, v, locale) =>
      `ΔU% = ${fmt(prior(v, "voltage-drop"), locale)} / ${fmt(num(p, "nominalVoltage"), locale)} · 100`,
    misconceptions,
  };
}

const commonGivens = (p: TaskParams) => [
  { id: "current", value: num(p, "current"), unit: "ampere" as const },
  { id: "length", value: num(p, "length"), unit: "metre" as const },
];

// ---- difficulty 1: single-phase, resistive load ----------------------------

const singlePhaseBasic: TaskTemplate = {
  id: "voltage-drop.single-phase-basic",
  version: 1,
  topicId: "voltage-drop",
  difficulty: 1,
  scenarioKey: () => "voltage-drop.single-phase-basic",
  generate: (rng) => {
    const crossSection = rng.pick([1.5, 2.5, 4]);
    return {
      system: "single-phase",
      material: "copper",
      current: loadCurrent(rng, crossSection),
      length: rng.step(10, 60, 5),
      crossSection,
      resistivity: RESISTIVITY_AT_OPERATING_TEMPERATURE.copper,
      nominalVoltage: NOMINAL_VOLTAGE["single-phase"],
      powerFactor: 1,
    };
  },
  givens: (p) => [
    ...commonGivens(p),
    { id: "crossSection", value: num(p, "crossSection"), unit: "squareMillimetre" },
    { id: "resistivity", value: num(p, "resistivity"), unit: "ohmSquareMillimetrePerMetre" },
    { id: "nominalVoltage", value: num(p, "nominalVoltage"), unit: "volt" },
  ],
  steps: [resistanceStep, voltageDropStep(false), percentStep(false)],
};

// ---- difficulty 2: phase factor and power factor ---------------------------

const phaseAndPowerFactor: TaskTemplate = {
  id: "voltage-drop.phase-and-power-factor",
  version: 1,
  topicId: "voltage-drop",
  difficulty: 2,
  scenarioKey: (p) => `voltage-drop.phase-and-power-factor.${systemOf(p)}`,
  generate: (rng) => {
    const system = rng.pick(["single-phase", "three-phase"] as const);
    const material = rng.pick<ConductorMaterial>(["copper", "aluminium"]);
    const crossSection = rng.pick(
      material === "copper" ? [1.5, 2.5, 4, 6, 10, 16] : [16, 25, 35],
    );
    return {
      system,
      material,
      current: loadCurrent(rng, crossSection),
      length: rng.step(10, 80, 5),
      crossSection,
      resistivity: RESISTIVITY_AT_OPERATING_TEMPERATURE[material],
      nominalVoltage: NOMINAL_VOLTAGE[system],
      powerFactor: rng.pick([0.8, 0.85, 0.9, 0.95]),
    };
  },
  givens: (p) => [
    ...commonGivens(p),
    { id: "crossSection", value: num(p, "crossSection"), unit: "squareMillimetre" },
    { id: "resistivity", value: num(p, "resistivity"), unit: "ohmSquareMillimetrePerMetre" },
    { id: "nominalVoltage", value: num(p, "nominalVoltage"), unit: "volt" },
    { id: "powerFactor", value: num(p, "powerFactor"), unit: "dimensionless" },
  ],
  steps: [phaseFactorStep, resistanceStep, voltageDropStep(true), percentStep(true)],
};

// ---- difficulty 3: choose the cross-section for a permitted drop -----------

const SELECTABLE_SIZES = STANDARD_CROSS_SECTIONS_MM2.filter((size) => size <= 35);

/** Accepts generated values only if the task is unambiguous and realistic. */
export function isGoodSelectionTask(p: TaskParams): boolean {
  const minimum = minimumCrossSection(
    phaseFactor(systemOf(p)),
    num(p, "resistivity"),
    num(p, "length"),
    num(p, "current"),
    1,
    permittedVoltageDrop(num(p, "limitPercent"), num(p, "nominalVoltage")),
  );
  const chosen = nextStandardCrossSection(minimum);
  const nearSize = STANDARD_CROSS_SECTIONS_MM2.some((size) => Math.abs(minimum - size) / size <= 0.03);
  return (
    minimum > STANDARD_CROSS_SECTIONS_MM2[0] &&
    minimum <= 25 &&
    !nearSize &&
    chosen !== undefined &&
    num(p, "current") / chosen <= 4
  );
}

/** Used if 200 draws find no good task (checked by the tests): S_min = 6,26 mm² -> 10 mm². */
export const SELECTION_FALLBACK: TaskParams = {
  system: "single-phase",
  material: "copper",
  current: 16,
  length: 60,
  resistivity: RESISTIVITY_AT_OPERATING_TEMPERATURE.copper,
  nominalVoltage: 230,
  powerFactor: 1,
  limitPercent: 3,
};

const crossSectionSelection: TaskTemplate = {
  id: "voltage-drop.cross-section-selection",
  version: 1,
  topicId: "voltage-drop",
  difficulty: 3,
  scenarioKey: (p) => `voltage-drop.cross-section-selection.${systemOf(p)}`,
  generate: (rng) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const system = rng.pick(["single-phase", "three-phase"] as const);
      const params: TaskParams = {
        system,
        material: "copper",
        current: rng.pick([10, 13, 16, 20, 25, 32]),
        length: rng.step(20, 150, 5),
        resistivity: RESISTIVITY_AT_OPERATING_TEMPERATURE.copper,
        nominalVoltage: NOMINAL_VOLTAGE[system],
        powerFactor: 1,
        limitPercent: rng.pick([2, 2.5, 3, 4, 5]),
      };
      if (isGoodSelectionTask(params)) {
        return params;
      }
    }
    return SELECTION_FALLBACK;
  },
  givens: (p) => [
    ...commonGivens(p),
    { id: "resistivity", value: num(p, "resistivity"), unit: "ohmSquareMillimetrePerMetre" },
    { id: "nominalVoltage", value: num(p, "nominalVoltage"), unit: "volt" },
    { id: "powerFactor", value: num(p, "powerFactor"), unit: "dimensionless" },
    { id: "limitPercent", value: num(p, "limitPercent"), unit: "percent" },
  ],
  steps: [
    {
      id: "permitted-voltage-drop",
      unit: "volt",
      kind: "intermediate",
      formulaId: () => "permitted-voltage-drop",
      expected: (p) => permittedVoltageDrop(num(p, "limitPercent"), num(p, "nominalVoltage")),
      substitution: (p, _v, locale) =>
        `ΔUₘₐₓ = ${fmt(num(p, "limitPercent"), locale)} · ${fmt(num(p, "nominalVoltage"), locale)} / 100`,
      misconceptions: [
        { id: "percent-not-divided", value: (p) => num(p, "limitPercent") * num(p, "nominalVoltage") },
      ],
    },
    {
      id: "minimum-cross-section",
      unit: "squareMillimetre",
      kind: "intermediate",
      formulaId: () => "minimum-cross-section",
      expected: (p, v) =>
        minimumCrossSection(
          phaseFactor(systemOf(p)),
          num(p, "resistivity"),
          num(p, "length"),
          num(p, "current"),
          num(p, "powerFactor"),
          prior(v, "permitted-voltage-drop"),
        ),
      substitution: (p, v, locale) =>
        `Sₘᵢₙ = ${FACTOR_LABEL[systemOf(p)]} · ${fmt(num(p, "resistivity"), locale)} · ${fmt(num(p, "length"), locale)} · ${fmt(num(p, "current"), locale)} · ${fmt(num(p, "powerFactor"), locale)} / ${fmt(prior(v, "permitted-voltage-drop"), locale)}`,
      misconceptions: [
        {
          id: "phase-factor-missing",
          value: (p, v) =>
            minimumCrossSection(1, num(p, "resistivity"), num(p, "length"), num(p, "current"), num(p, "powerFactor"), prior(v, "permitted-voltage-drop")),
        },
        {
          id: "phase-factor-wrong-system",
          value: (p, v) =>
            minimumCrossSection(
              phaseFactor(OTHER_SYSTEM[systemOf(p)]),
              num(p, "resistivity"),
              num(p, "length"),
              num(p, "current"),
              num(p, "powerFactor"),
              prior(v, "permitted-voltage-drop"),
            ),
        },
        {
          id: "limit-percent-used-as-volts",
          value: (p) =>
            minimumCrossSection(
              phaseFactor(systemOf(p)),
              num(p, "resistivity"),
              num(p, "length"),
              num(p, "current"),
              num(p, "powerFactor"),
              num(p, "limitPercent"),
            ),
        },
      ],
    },
    {
      id: "standard-cross-section",
      unit: "squareMillimetre",
      kind: "selection",
      formulaId: () => "standard-cross-section",
      options: () => SELECTABLE_SIZES.map((size) => ({ value: size })),
      expected: (_p, v) => nextStandardCrossSection(prior(v, "minimum-cross-section")) ?? Number.NaN,
      substitution: (_p, v, locale) => `S ≥ ${fmt(prior(v, "minimum-cross-section"), locale)} mm²`,
      misconceptions: [
        {
          id: "chose-below-minimum",
          value: (_p, v) => {
            const smaller = STANDARD_CROSS_SECTIONS_MM2.filter(
              (size) => size < prior(v, "minimum-cross-section"),
            );
            return smaller.length > 0 ? smaller[smaller.length - 1]! : null;
          },
        },
      ],
    },
    {
      id: "voltage-drop",
      unit: "volt",
      kind: "final",
      formulaId: () => "voltage-drop-direct",
      expected: (p, v) =>
        voltageDropFromResistance(
          phaseFactor(systemOf(p)),
          conductorResistance(num(p, "resistivity"), num(p, "length"), prior(v, "standard-cross-section")),
          num(p, "current"),
          num(p, "powerFactor"),
        ),
      substitution: (p, v, locale) =>
        `ΔU = ${FACTOR_LABEL[systemOf(p)]} · ${fmt(num(p, "resistivity"), locale)} · ${fmt(num(p, "length"), locale)} / ${fmt(prior(v, "standard-cross-section"), locale)} · ${fmt(num(p, "current"), locale)} · ${fmt(num(p, "powerFactor"), locale)}`,
      misconceptions: [
        {
          id: "phase-factor-missing",
          value: (p, v) =>
            conductorResistance(num(p, "resistivity"), num(p, "length"), prior(v, "standard-cross-section")) *
            num(p, "current") *
            num(p, "powerFactor"),
        },
      ],
    },
    percentStep(true),
  ],
};

export const VOLTAGE_DROP_TEMPLATES: readonly TaskTemplate[] = [
  singlePhaseBasic,
  phaseAndPowerFactor,
  crossSectionSelection,
];
