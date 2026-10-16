import { describe, expect, it } from "vitest";
import {
  CalculationInputError,
  calculateVoltageDrop,
  type VoltageDropInput,
  isWithinVoltageDropLimit,
  requiredCrossSectionForLimit,
} from "./voltage-drop.js";
import {
  nextStandardCrossSection,
  RESISTIVITY_AT_OPERATING_TEMPERATURE,
} from "../reference/conductors.js";
import { FORMULAS } from "./formulas.js";

const copper = RESISTIVITY_AT_OPERATING_TEMPERATURE.copper;

/** The engine returns `{ result, steps }`; most tests only need the result. */
const drop = (input: VoltageDropInput) => calculateVoltageDrop(input).result;

describe("calculateVoltageDrop", () => {
  it("computes the single-phase drop: dU = 2 * rho * L / S * I", () => {
    // 2 * 0.0225 * (25 / 2.5) * 16 = 7.2 V
    const result = drop({
      current_A: 16,
      length_m: 25,
      crossSection_mm2: 2.5,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    });

    expect(result.voltageDrop_V).toBeCloseTo(7.2, 10);
    expect(result.voltageDropPercent).toBeCloseTo((7.2 / 230) * 100, 10);
    expect(result.phaseFactor).toBe(2);
  });

  it("computes the three-phase drop with the sqrt(3) factor", () => {
    // sqrt(3) * 0.0225 * (30 / 4) * 20 = 5.84567... V
    const result = drop({
      current_A: 20,
      length_m: 30,
      crossSection_mm2: 4,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 400,
      system: "three-phase",
    });

    const expected = Math.sqrt(3) * copper * (30 / 4) * 20;
    expect(result.voltageDrop_V).toBeCloseTo(expected, 10);
    expect(result.voltageDropPercent).toBeCloseTo((expected / 400) * 100, 10);
    expect(result.phaseFactor).toBeCloseTo(Math.sqrt(3), 12);
  });

  it("scales the resistive drop with the power factor", () => {
    const base = {
      current_A: 16,
      length_m: 25,
      crossSection_mm2: 2.5,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    } as const;

    const unity = drop(base);
    const lagging = drop({ ...base, powerFactor: 0.8 });

    expect(lagging.voltageDrop_V).toBeCloseTo(unity.voltageDrop_V * 0.8, 10);
  });

  it("is inversely proportional to the cross-section", () => {
    const base = {
      current_A: 16,
      length_m: 25,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    } as const;

    const small = drop({ ...base, crossSection_mm2: 1.5 });
    const large = drop({ ...base, crossSection_mm2: 3 });

    expect(small.voltageDrop_V).toBeCloseTo(large.voltageDrop_V * 2, 10);
  });

  it("rejects non-positive and non-finite inputs, naming the field", () => {
    const base = {
      current_A: 16,
      length_m: 25,
      crossSection_mm2: 2.5,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    } as const;

    expect(() => drop({ ...base, current_A: 0 })).toThrow(
      CalculationInputError,
    );
    expect(() => drop({ ...base, length_m: -1 })).toThrow(
      CalculationInputError,
    );
    expect(() =>
      drop({ ...base, crossSection_mm2: Number.NaN }),
    ).toThrow(CalculationInputError);
    expect(() => drop({ ...base, powerFactor: 1.2 })).toThrow(
      CalculationInputError,
    );

    try {
      drop({ ...base, length_m: 0 });
      expect.unreachable("expected a CalculationInputError");
    } catch (error) {
      expect(error).toBeInstanceOf(CalculationInputError);
      expect((error as CalculationInputError).field).toBe("length_m");
    }
  });
});

describe("isWithinVoltageDropLimit", () => {
  it("compares the computed percentage against an explicit limit", () => {
    const result = drop({
      current_A: 16,
      length_m: 25,
      crossSection_mm2: 2.5,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    });

    // 7.2 V on 230 V is ~3.13%.
    expect(isWithinVoltageDropLimit(result, 4)).toBe(true);
    expect(isWithinVoltageDropLimit(result, 3)).toBe(false);
  });
});

describe("requiredCrossSectionForLimit", () => {
  it("returns the cross-section at which the drop exactly meets the limit", () => {
    const input = {
      current_A: 16,
      length_m: 25,
      resistivity_ohm_mm2_per_m: copper,
      nominalVoltage_V: 230,
      system: "single-phase",
    } as const;

    const required = requiredCrossSectionForLimit(input, 3);
    const atRequired = drop({
      ...input,
      crossSection_mm2: required,
    });

    expect(atRequired.voltageDropPercent).toBeCloseTo(3, 10);

    // Rounded up to the standard series, the drop must be below the limit.
    const standard = nextStandardCrossSection(required);
    expect(standard).toBeDefined();
    const atStandard = drop({
      ...input,
      crossSection_mm2: standard!,
    });
    expect(atStandard.voltageDropPercent).toBeLessThanOrEqual(3);
  });
});

describe("calculateVoltageDrop steps", () => {
  const singlePhase = {
    current_A: 16,
    length_m: 25,
    crossSection_mm2: 2.5,
    resistivity_ohm_mm2_per_m: copper,
    nominalVoltage_V: 230,
    system: "single-phase",
  } as const;

  it("returns the intermediate steps a student works through, in order", () => {
    const { steps } = calculateVoltageDrop(singlePhase);

    expect(steps.map((step) => step.id)).toEqual([
      "phase-factor",
      "conductor-resistance",
      "voltage-drop",
      "voltage-drop-percent",
    ]);
    expect(steps.map((step) => step.unit)).toEqual(["dimensionless", "ohm", "volt", "percent"]);
  });

  it("computes each step: b = 2, R = rho * L / S, dU = b * R * I * cos(phi), dU% = dU / Un * 100", () => {
    const { steps, result } = calculateVoltageDrop(singlePhase);
    const value = (id: string) => steps.find((step) => step.id === id)!.value;

    expect(value("phase-factor")).toBe(2);
    // 0.0225 * 25 / 2.5 = 0.225 ohm
    expect(value("conductor-resistance")).toBeCloseTo(0.225, 12);
    // 2 * 0.225 * 16 * 1 = 7.2 V
    expect(value("voltage-drop")).toBeCloseTo(7.2, 10);
    expect(value("voltage-drop")).toBe(result.voltageDrop_V);
    expect(value("voltage-drop-percent")).toBe(result.voltageDropPercent);
  });

  it("uses the three-phase phase-factor formula for three-phase circuits", () => {
    const { steps } = calculateVoltageDrop({
      ...singlePhase,
      nominalVoltage_V: 400,
      system: "three-phase",
    });

    expect(steps[0]).toMatchObject({ id: "phase-factor", formulaId: "phase-factor-three-phase" });
    expect(steps[0]!.value).toBeCloseTo(Math.sqrt(3), 12);
  });

  it("links every step to a formula in the registry", () => {
    for (const system of ["single-phase", "three-phase"] as const) {
      for (const step of calculateVoltageDrop({ ...singlePhase, system }).steps) {
        expect(FORMULAS, step.formulaId).toHaveProperty(step.formulaId);
      }
    }
  });
});
