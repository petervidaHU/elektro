import { describe, expect, it } from "vitest";
import { createI18n } from "../i18n/i18n";
import { formatStepValue, formatTolerance, scenarioValues } from "./practice-format";

const { t } = createI18n("hu");

describe("formatStepValue", () => {
  it("formats with the unit and the Hungarian decimal comma", () => {
    expect(formatStepValue(7.2, "volt", "hu", t)).toBe("7,2 V");
    expect(formatStepValue(0.225, "ohm", "hu", t)).toBe("0,225 Ω");
    expect(formatStepValue(2.5, "squareMillimetre", "hu", t)).toBe("2,5 mm²");
  });

  it("formats percentages and dimensionless values", () => {
    expect(formatStepValue(3.1304, "percent", "hu", t)).toBe("3,13%");
    expect(formatStepValue(Math.sqrt(3), "dimensionless", "hu", t)).toBe("1,732");
  });
});

describe("formatTolerance", () => {
  it("shows relative tolerances in percent", () => {
    expect(formatTolerance({ relative: 0.01 }, "hu", t)).toBe("1%");
  });

  it("shows absolute tolerances of percentages in percentage points", () => {
    expect(formatTolerance({ absolute: 0.05 }, "hu", t, "percent")).toBe("0,05 százalékpont");
  });

  it("returns null for exact choices", () => {
    expect(formatTolerance({ absolute: 0 }, "hu", t)).toBeNull();
  });
});

describe("scenarioValues", () => {
  it("formats every given value and translates the material for the scenario text", () => {
    const values = scenarioValues(
      [
        { id: "current", value: 16, unit: "ampere" },
        { id: "powerFactor", value: 0.9, unit: "dimensionless" },
      ],
      { material: "copper" },
      "hu",
      t,
    );
    expect(values).toEqual({ current: "16 A", powerFactor: "0,9", material: "réz" });
  });
});
