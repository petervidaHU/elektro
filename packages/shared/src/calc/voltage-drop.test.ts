import { describe, expect, it } from "vitest";
import {
  CalculationInputError,
  calculateVoltageDrop,
  isWithinVoltageDropLimit,
  requiredCrossSectionForLimit,
} from "./voltage-drop.js";
import {
  nextStandardCrossSection,
  RESISTIVITY_AT_OPERATING_TEMPERATURE,
} from "../reference/conductors.js";

const copper = RESISTIVITY_AT_OPERATING_TEMPERATURE.copper;

describe("calculateVoltageDrop", () => {
  it("computes the single-phase drop: dU = 2 * rho * L / S * I", () => {
    // 2 * 0.0225 * (25 / 2.5) * 16 = 7.2 V
    const result = calculateVoltageDrop({
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
    const result = calculateVoltageDrop({
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

    const unity = calculateVoltageDrop(base);
    const lagging = calculateVoltageDrop({ ...base, powerFactor: 0.8 });

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

    const small = calculateVoltageDrop({ ...base, crossSection_mm2: 1.5 });
    const large = calculateVoltageDrop({ ...base, crossSection_mm2: 3 });

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

    expect(() => calculateVoltageDrop({ ...base, current_A: 0 })).toThrow(
      CalculationInputError,
    );
    expect(() => calculateVoltageDrop({ ...base, length_m: -1 })).toThrow(
      CalculationInputError,
    );
    expect(() =>
      calculateVoltageDrop({ ...base, crossSection_mm2: Number.NaN }),
    ).toThrow(CalculationInputError);
    expect(() => calculateVoltageDrop({ ...base, powerFactor: 1.2 })).toThrow(
      CalculationInputError,
    );

    try {
      calculateVoltageDrop({ ...base, length_m: 0 });
      expect.unreachable("expected a CalculationInputError");
    } catch (error) {
      expect(error).toBeInstanceOf(CalculationInputError);
      expect((error as CalculationInputError).field).toBe("length_m");
    }
  });
});

describe("isWithinVoltageDropLimit", () => {
  it("compares the computed percentage against an explicit limit", () => {
    const result = calculateVoltageDrop({
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
    const atRequired = calculateVoltageDrop({
      ...input,
      crossSection_mm2: required,
    });

    expect(atRequired.voltageDropPercent).toBeCloseTo(3, 10);

    // Rounded up to the standard series, the drop must be below the limit.
    const standard = nextStandardCrossSection(required);
    expect(standard).toBeDefined();
    const atStandard = calculateVoltageDrop({
      ...input,
      crossSection_mm2: standard!,
    });
    expect(atStandard.voltageDropPercent).toBeLessThanOrEqual(3);
  });
});
