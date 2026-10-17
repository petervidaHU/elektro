import { describe, expect, it } from "vitest";
import { calculateConnectionPower } from "../../calc/installation.js";
import { buildTask, expectedFor } from "../checker.js";
import { hasPractice } from "../registry.js";
import { INSTALLATION_TEMPLATES, PHASE_FALLBACK } from "./installation.js";

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

function solve(templateId: string, seed: number) {
  const task = buildTask(templateId, seed);
  const prior: Record<string, number> = {};
  task.template.steps.forEach((spec, index) => {
    prior[spec.id] = expectedFor(task, index, prior);
  });
  return { task, values: prior };
}

describe("installation templates", () => {
  it("make their topics practisable", () => {
    expect(hasPractice("service-connection-and-metering")).toBe(true);
    expect(hasPractice("distribution-boards")).toBe(true);
  });

  it("produce finite, positive step values for every seed", () => {
    for (const template of INSTALLATION_TEMPLATES) {
      for (const seed of SEEDS) {
        for (const [id, value] of Object.entries(solve(template.id, seed).values)) {
          expect(Number.isFinite(value) && value > 0, `${template.id}/${id} seed ${seed}`).toBe(true);
        }
      }
    }
  });

  it("margin task: the demand stays below the capacity and agrees with the engine", () => {
    for (const seed of SEEDS) {
      const { task, values } = solve("connection-power.margin", seed);
      const engine = calculateConnectionPower({
        system: "three-phase",
        voltage_V: 400,
        mainBreaker_A: Number(task.params["mainBreaker"]),
        demandPower_W: Number(task.params["demand"]),
      }).result;
      expect(values["power-margin"]).toBeCloseTo(engine.margin_W!, 9);
    }
  });

  it("imbalance task: the most loaded phase is unique and the imbalance is the spread", () => {
    for (const seed of SEEDS) {
      const { values } = solve("phase-balancing.imbalance", seed);
      const sums = [values["phase-current-l1"]!, values["phase-current-l2"]!, values["phase-current-l3"]!];
      expect(sums.filter((s) => s === Math.max(...sums))).toHaveLength(1);
      expect(values["most-loaded-phase"]).toBe(sums.indexOf(Math.max(...sums)) + 1);
      expect(values["phase-imbalance"]).toBe(Math.max(...sums) - Math.min(...sums));
    }
  });

  it("worked example: 10+4 / 6 / 8+10 A gives 14, 6, 18 A and a 12 A spread", () => {
    const template = INSTALLATION_TEMPLATES.find((t) => t.id === "phase-balancing.imbalance")!;
    const task = { template, params: PHASE_FALLBACK };
    const prior: Record<string, number> = {};
    template.steps.forEach((spec, index) => (prior[spec.id] = expectedFor(task, index, prior)));
    expect([prior["phase-current-l1"], prior["phase-current-l2"], prior["phase-current-l3"]]).toEqual([14, 6, 18]);
    expect(prior["most-loaded-phase"]).toBe(3);
    expect(prior["phase-imbalance"]).toBe(12);
  });
});
