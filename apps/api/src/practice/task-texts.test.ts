import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@elektro/shared";
import hu from "../../../web/app/i18n/locales/hu/common.json" with { type: "json" };
import { collectTaskTexts, scenarioKeysOf } from "./task-texts.js";

describe("collectTaskTexts", () => {
  it("finds the scenario, step and hint texts of every template in the hu resources", () => {
    for (const template of TEMPLATES) {
      const texts = collectTaskTexts(template, hu);
      expect(Object.keys(texts.stepLabels)).toEqual(template.steps.map((step) => step.id));
      expect(Object.keys(texts.hints)).toEqual(template.steps.map((step) => step.id));
      expect(Object.keys(texts.scenarios).length).toBeGreaterThan(0);
    }
  });

  it("discovers every scenario variant a template can produce", () => {
    const template = TEMPLATES.find((item) => item.id.startsWith("voltage-drop.phase-and-power-factor"))!;
    expect(scenarioKeysOf(template).length).toBeGreaterThan(1);
  });

  it("refuses to sync a template with a missing text", () => {
    expect(() => collectTaskTexts(TEMPLATES[0]!, {})).toThrow(/Missing/);
  });
});
