import { describe, expect, it } from "vitest";
import { FORMULAS, isFormulaId } from "./formulas.js";

describe("formula registry", () => {
  it("gives every formula a non-empty, language-neutral expression", () => {
    for (const [id, formula] of Object.entries(FORMULAS)) {
      expect(formula.expression.trim(), id).not.toBe("");
      // Only symbols and maths: no words that would need translating.
      expect(formula.expression, id).not.toMatch(/[a-zA-Z]{4,}/);
    }
  });

  it("recognises registered formula IDs only", () => {
    expect(isFormulaId("voltage-drop")).toBe(true);
    expect(isFormulaId("no-such-formula")).toBe(false);
  });
});
