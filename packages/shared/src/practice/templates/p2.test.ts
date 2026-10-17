import { describe, expect, it } from "vitest";
import { calculateAcImpedance } from "../../calc/p2.js";
import { buildTask, expectedFor } from "../checker.js";
import { hasPractice, templatesForTopic } from "../registry.js";
import { P2_TEMPLATES } from "./p2.js";

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

function solve(templateId: string, seed: number) {
  const task = buildTask(templateId, seed);
  const prior: Record<string, number> = {};
  task.template.steps.forEach((spec, index) => {
    prior[spec.id] = expectedFor(task, index, prior);
  });
  return { task, values: prior };
}

function solveWith(templateId: string, params: Record<string, number>) {
  const template = P2_TEMPLATES.find((item) => item.id === templateId)!;
  const task = { template, params };
  const prior: Record<string, number> = {};
  template.steps.forEach((spec, index) => (prior[spec.id] = expectedFor(task, index, prior)));
  return prior;
}

describe("P2 templates", () => {
  it("make their topics practisable", () => {
    for (const topic of ["electric-field-and-capacitors", "magnetism-and-induction", "voltage-sources", "transformers", "electric-motors", "measuring-instruments", "lighting-circuits", "continuity-of-pe", "installation-planning", "overcurrent-protection"] as const) {
      expect(hasPractice(topic), topic).toBe(true);
      expect(templatesForTopic(topic).length).toBeGreaterThan(0);
    }
  });

  it("produce finite, positive step values for every seed", () => {
    for (const template of P2_TEMPLATES) {
      for (const seed of SEEDS) {
        for (const [id, value] of Object.entries(solve(template.id, seed).values)) {
          expect(Number.isFinite(value) && value > 0, `${template.id}/${id} seed ${seed}`).toBe(true);
        }
      }
    }
  });

  it("have unique ids and a version", () => {
    expect(new Set(P2_TEMPLATES.map((t) => t.id)).size).toBe(P2_TEMPLATES.length);
    expect(P2_TEMPLATES.every((t) => t.version >= 1)).toBe(true);
  });

  it("worked examples by hand", () => {
    expect(solveWith("capacitors.series", { capacitance1: 6, capacitance2: 3 })["capacitance"]).toBeCloseTo(2, 12);
    // 100 uF at 10 V: Q = 1 mC, W = 5 mJ.
    const charge = solveWith("capacitors.charge-energy", { capacitance: 100, voltage: 10 });
    expect(charge["charge"]).toBeCloseTo(1, 12);
    expect(charge["energy"]).toBeCloseTo(5, 12);
    // 1 kΩ · 100 µF = 100 ms, 5τ = 500 ms.
    expect(solveWith("capacitors.time-constant", { capacitance: 100, resistance: 1000, voltage: 12 })["full-charge-time"]).toBeCloseTo(500, 9);
    // 500 mH at 2 A: 1 J = 1000 mJ; τ = 100 mH / 20 Ω = 5 ms.
    expect(solveWith("inductors.energy", { inductance: 500, current: 2 })["energy"]).toBeCloseTo(1000, 9);
    expect(solveWith("inductors.time-constant", { inductance: 100, resistance: 20 })["time-constant"]).toBe(5);
    // 4-pole-pair... 1500 min^-1 with 2 pole pairs, rotor 1425: slip 5 %.
    const slip = solveWith("motor.slip", { frequency: 50, polePairs: 2, rotorSpeed: 1425 });
    expect(slip["synchronous-speed"]).toBe(1500);
    expect(slip["slip"]).toBeCloseTo(5, 12);
    // 24 m² at 300 lx with 1500 lm luminaires: 7200 lm -> 5 luminaires (4,8 rounded up).
    expect(solveWith("illuminance.luminaires", { area: 24, target: 300, luminaireFlux: 1500 })["luminaire-count"]).toBe(5);
    // 230 V / 12 V, 10 A: 12 * 10 / 230.
    expect(solveWith("transformer.primary-current", { primaryVoltage: 230, secondaryVoltage: 12, secondaryCurrent: 10 })["primary-current"]).toBeCloseTo(120 / 230, 12);
  });

  it("the RL task agrees with the calculator engine", () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const { task, values } = solve("ac-impedance.rl", seed);
      const p = task.params;
      const engine = calculateAcImpedance({
        resistance_ohm: Number(p["resistance"]),
        inductance_H: Number(p["inductance"]) / 1000,
        frequency_Hz: Number(p["frequency"]),
        voltage_V: Number(p["voltage"]),
      }).result;
      expect(values["impedance"]).toBeCloseTo(engine.impedance_ohm, 9);
      expect(values["current"]).toBeCloseTo(engine.current_A, 9);
    }
  });
});
