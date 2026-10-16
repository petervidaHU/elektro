import { describe, expect, it } from "vitest";
import { calculateVoltageDrop } from "../../calc/voltage-drop.js";
import { nextStandardCrossSection, STANDARD_CROSS_SECTIONS_MM2 } from "../../reference/conductors.js";
import { buildTask, evaluateStep, expectedFor, misconceptionCandidates } from "../checker.js";
import { allowedDeviation, DEFAULT_TOLERANCES } from "../tolerance.js";
import { isGoodSelectionTask, SELECTION_FALLBACK, VOLTAGE_DROP_TEMPLATES } from "./voltage-drop.js";

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

/** Solves a task the way a perfect student would, step by step. */
function solve(templateId: string, seed: number) {
  const task = buildTask(templateId, seed);
  const prior: Record<string, number> = {};
  task.template.steps.forEach((spec, index) => {
    prior[spec.id] = expectedFor(task, index, prior);
  });
  return { task, values: prior };
}

describe("voltage-drop templates", () => {
  it("cover difficulties 1-3 for the voltage-drop topic", () => {
    expect(VOLTAGE_DROP_TEMPLATES.map((t) => t.difficulty).sort()).toEqual([1, 2, 3]);
    for (const template of VOLTAGE_DROP_TEMPLATES) {
      expect(template.topicId).toBe("voltage-drop");
    }
  });

  it("produce finite, positive step values for every seed", () => {
    for (const template of VOLTAGE_DROP_TEMPLATES) {
      for (const seed of SEEDS) {
        for (const value of Object.values(solve(template.id, seed).values)) {
          expect(Number.isFinite(value) && value > 0, `${template.id} seed ${seed}`).toBe(true);
        }
      }
    }
  });

  it("agree with the calculator engine on the final drop (no re-implemented maths)", () => {
    for (const id of ["voltage-drop.single-phase-basic", "voltage-drop.phase-and-power-factor"]) {
      for (const seed of SEEDS.slice(0, 50)) {
        const { task, values } = solve(id, seed);
        const p = task.params;
        const engine = calculateVoltageDrop({
          current_A: Number(p["current"]),
          length_m: Number(p["length"]),
          crossSection_mm2: Number(p["crossSection"]),
          resistivity_ohm_mm2_per_m: Number(p["resistivity"]),
          nominalVoltage_V: Number(p["nominalVoltage"]),
          system: p["system"] === "three-phase" ? "three-phase" : "single-phase",
          powerFactor: Number(p["powerFactor"]),
        }).result;

        expect(values["voltage-drop"]).toBeCloseTo(engine.voltageDrop_V, 9);
        expect(values["voltage-drop-percent"]).toBeCloseTo(engine.voltageDropPercent, 9);
      }
    }
  });

  it("selection task: the minimum is in the standard series and not ambiguous to round", () => {
    for (const seed of SEEDS) {
      const { values } = solve("voltage-drop.cross-section-selection", seed);
      const minimum = values["minimum-cross-section"]!;
      expect(minimum).toBeGreaterThan(STANDARD_CROSS_SECTIONS_MM2[0]);
      expect(minimum).toBeLessThanOrEqual(25);
      // A minimum within the 2 % tolerance of a size could be rounded either way.
      for (const size of STANDARD_CROSS_SECTIONS_MM2) {
        expect(Math.abs(minimum - size) / size).toBeGreaterThan(0.03);
      }
      expect(values["standard-cross-section"]).toBe(nextStandardCrossSection(minimum));
    }
  });

  it("selection task: the fallback parameters are a good task too", () => {
    expect(isGoodSelectionTask(SELECTION_FALLBACK)).toBe(true);
  });

  it("selection task: the voltage drop at the chosen size stays within the given limit", () => {
    for (const seed of SEEDS) {
      const { task, values } = solve("voltage-drop.cross-section-selection", seed);
      expect(values["voltage-drop-percent"]).toBeLessThanOrEqual(Number(task.params["limitPercent"]));
    }
  });

  it("offer the correct value among the options of selection steps", () => {
    for (const template of VOLTAGE_DROP_TEMPLATES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const { task, values } = solve(template.id, seed);
        task.template.steps.forEach((spec) => {
          if (spec.kind === "selection") {
            const options = spec.options?.(task.params).map((option) => option.value) ?? [];
            expect(options).toContain(values[spec.id]);
          }
        });
      }
    }
  });

  it("detect each known mistake, and only when it is clearly different from the right answer", () => {
    for (const template of VOLTAGE_DROP_TEMPLATES) {
      const fired = new Set<string>();
      for (const seed of SEEDS) {
        const { task, values } = solve(template.id, seed);
        const prior: Record<string, number> = {};
        task.template.steps.forEach((spec, index) => {
          const expected = values[spec.id]!;
          const tolerance = spec.tolerance ?? DEFAULT_TOLERANCES[spec.kind];
          for (const { id, value } of misconceptionCandidates(task, index, prior)) {
            expect(Math.abs(value - expected)).toBeGreaterThan(3 * allowedDeviation(expected, tolerance));
            expect(evaluateStep(task, index, prior, value).misconceptionId).toBe(id);
            fired.add(`${spec.id}/${id}`);
          }
          prior[spec.id] = expected;
        });
      }
      const declared = template.steps.flatMap((spec) =>
        (spec.misconceptions ?? []).map((misconception) => `${spec.id}/${misconception.id}`),
      );
      expect([...fired].sort(), template.id).toEqual([...new Set(declared)].sort());
    }
  });
});
