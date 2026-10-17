import { describe, expect, it } from "vitest";
import { buildTask, expectedFor, misconceptionCandidates } from "../checker.js";
import { hasPractice, templatesForTopic } from "../registry.js";
import { PHYSICS_TEMPLATES } from "./physics.js";

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

function solve(templateId: string, seed: number) {
  const task = buildTask(templateId, seed);
  const prior: Record<string, number> = {};
  task.template.steps.forEach((spec, index) => {
    prior[spec.id] = expectedFor(task, index, prior);
  });
  return { task, values: prior };
}

describe("physics templates", () => {
  it("make their topics practisable", () => {
    for (const topic of ["ohms-law", "series-parallel-circuits", "power-and-energy", "ac-fundamentals", "three-phase-systems"] as const) {
      expect(hasPractice(topic), topic).toBe(true);
      expect(templatesForTopic(topic).length).toBeGreaterThan(1);
    }
  });

  it("produce finite, positive step values for every seed", () => {
    for (const template of PHYSICS_TEMPLATES) {
      for (const seed of SEEDS) {
        for (const [id, value] of Object.entries(solve(template.id, seed).values)) {
          expect(Number.isFinite(value) && value > 0, `${template.id}/${id} seed ${seed}`).toBe(true);
        }
      }
    }
  });

  it("worked example: 24 V over 6 + 12 ohm in series", () => {
    // Worked by hand: series R = 6 + 12 = 18 ohm, I = 24 / 18 = 1,333 A, U2 = 16 V.
    const task = { template: PHYSICS_TEMPLATES.find((t) => t.id === "series-parallel.series-divider")!, params: { voltage: 24, resistance1: 6, resistance2: 12 } };
    const prior: Record<string, number> = {};
    task.template.steps.forEach((spec, index) => {
      prior[spec.id] = expectedFor(task, index, prior);
    });
    expect(prior["total-resistance"]).toBe(18);
    expect(prior["current"]).toBeCloseTo(24 / 18, 12);
    expect(prior["voltage"]).toBeCloseTo(16, 12);
  });

  it("misconception values are finite wherever they apply", () => {
    for (const template of PHYSICS_TEMPLATES) {
      for (const seed of SEEDS.slice(0, 60)) {
        const { task, values } = solve(template.id, seed);
        task.template.steps.forEach((_spec, index) => {
          const prior: Record<string, number> = {};
          task.template.steps.slice(0, index).forEach((s) => (prior[s.id] = values[s.id]!));
          for (const candidate of misconceptionCandidates(task, index, prior)) {
            expect(Number.isFinite(candidate.value)).toBe(true);
          }
        });
      }
    }
  });
});
