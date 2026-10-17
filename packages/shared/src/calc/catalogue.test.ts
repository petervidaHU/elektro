import { describe, expect, it } from "vitest";
import { isTopicId } from "../syllabus/topics.js";
import { CALCULATOR_IDS, getCalculatorDefinition, isCalculatorId } from "./catalogue.js";

describe("calculator catalogue", () => {
  it("lists every calculator implemented in code, with a valid topic and a unique page", () => {
    const paths = CALCULATOR_IDS.map((id) => getCalculatorDefinition(id).path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const id of CALCULATOR_IDS) {
      expect(isTopicId(getCalculatorDefinition(id).defaultTopicId)).toBe(true);
    }
  });

  it("knows the voltage-drop calculator", () => {
    expect(getCalculatorDefinition("voltage-drop")).toEqual({
      id: "voltage-drop",
      defaultTopicId: "voltage-drop",
      path: "calculators/voltage-drop",
    });
  });

  it("recognises calculator ids", () => {
    expect(isCalculatorId("voltage-drop")).toBe(true);
    expect(isCalculatorId("made-up")).toBe(false);
  });
});
