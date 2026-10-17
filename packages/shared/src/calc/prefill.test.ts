import { describe, expect, it } from "vitest";
import { CALCULATOR_IDS } from "./catalogue.js";
import { PREFILL_FIELDS, prefillQuery, readPrefill, validatePrefill } from "./prefill.js";

describe("calculator pre-fill (lesson examples open a calculator with values)", () => {
  it("defines the fields of every calculator", () => {
    for (const id of CALCULATOR_IDS) {
      expect(Object.keys(PREFILL_FIELDS[id]).length, id).toBeGreaterThan(0);
    }
  });

  it("accepts known numeric and choice fields", () => {
    expect(validatePrefill("ohms-law", { unknown: "current", voltage: "230", resistance: "46" })).toEqual({ ok: true, errors: [] });
    expect(validatePrefill("voltage-drop", { system: "three-phase", material: "copper", current: "16", length: "25", crossSection: "2,5" }).ok).toBe(true);
  });

  it("rejects unknown fields, bad choices and non-numbers", () => {
    expect(validatePrefill("ohms-law", { colour: "red" }).errors).toEqual([{ field: "colour", reason: "unknown-field" }]);
    expect(validatePrefill("ohms-law", { unknown: "power" }).errors).toEqual([{ field: "unknown", reason: "invalid-value" }]);
    expect(validatePrefill("ohms-law", { voltage: "abc" }).errors).toEqual([{ field: "voltage", reason: "invalid-value" }]);
    expect(validatePrefill("ohms-law", { voltage: "-5" }).ok).toBe(false);
  });

  it("enforces ranges", () => {
    expect(validatePrefill("power-ac-single", { powerFactor: "1.5" }).ok).toBe(false);
    expect(validatePrefill("power-ac-single", { powerFactor: "0.8" }).ok).toBe(true);
  });

  it("builds a query string with decimal points, in field order of the spec", () => {
    expect(prefillQuery("ohms-law", { resistance: "4,6", voltage: "230" })).toBe("voltage=230&resistance=4.6");
  });

  it("reads only valid fields from a query string, ignoring everything else", () => {
    const search = new URLSearchParams("voltage=230&unknown=power&resistance=x&evil=1&current=5");
    expect(readPrefill("ohms-law", search)).toEqual({ voltage: "230", current: "5" });
  });
});
