import { describe, expect, it } from "vitest";
import {
  balancePhases,
  calculateConnectionPower,
  calculatePhaseLoad,
  suggestBalancing,
} from "./installation.js";
import { CalculationInputError } from "./voltage-drop.js";

describe("connection power: P = U*I (1-phase), P = sqrt(3)*U*I (3-phase)", () => {
  it("single-phase 230 V, 25 A main breaker gives 5750 W", () => {
    const { result } = calculateConnectionPower({ system: "single-phase", voltage_V: 230, mainBreaker_A: 25 });
    expect(result.availablePower_W).toBe(5750);
    expect(result.margin_W).toBeUndefined();
  });

  it("three-phase 400 V, 25 A per phase gives sqrt(3)*400*25", () => {
    const { result } = calculateConnectionPower({ system: "three-phase", voltage_V: 400, mainBreaker_A: 25 });
    expect(result.availablePower_W).toBeCloseTo(Math.sqrt(3) * 400 * 25, 9);
  });

  it("compares with the consumer demand", () => {
    const enough = calculateConnectionPower({ system: "single-phase", voltage_V: 230, mainBreaker_A: 25, demandPower_W: 5000 });
    expect(enough.result.margin_W).toBe(750);
    expect(enough.result.sufficient).toBe(true);
    expect(enough.steps.map((s) => s.id)).toEqual(["available-power", "power-margin"]);

    const short = calculateConnectionPower({ system: "single-phase", voltage_V: 230, mainBreaker_A: 16, demandPower_W: 5000 });
    expect(short.result.margin_W).toBe(3680 - 5000);
    expect(short.result.sufficient).toBe(false);
  });

  it("rejects non-positive input", () => {
    expect(() => calculateConnectionPower({ system: "single-phase", voltage_V: 0, mainBreaker_A: 16 })).toThrow(CalculationInputError);
    expect(() => calculateConnectionPower({ system: "single-phase", voltage_V: 230, mainBreaker_A: 16, demandPower_W: -1 })).toThrow(CalculationInputError);
  });
});

describe("phase load", () => {
  const circuits = [
    { current_A: 10, phase: 0 },
    { current_A: 6, phase: 0 },
    { current_A: 16, phase: 1 },
    { current_A: 4, phase: 2 },
    { current_A: 2, phase: 2 },
  ] as const;

  it("sums the current per phase and finds the most and least loaded", () => {
    const { result, steps } = calculatePhaseLoad([...circuits]);
    expect(result.phaseCurrents_A).toEqual([16, 16, 6]);
    expect(result.leastLoadedPhase).toBe(2);
    expect(result.imbalance_A).toBe(10);
    expect(steps.map((s) => s.id)).toEqual(["phase-current-l1", "phase-current-l2", "phase-current-l3", "phase-imbalance"]);
  });

  it("picks the first phase on a tie for most loaded", () => {
    expect(calculatePhaseLoad([...circuits]).result.mostLoadedPhase).toBe(0);
  });

  it("rejects an unknown phase and an empty list", () => {
    expect(() => calculatePhaseLoad([{ current_A: 1, phase: 3 }])).toThrow(CalculationInputError);
    expect(() => calculatePhaseLoad([])).toThrow(CalculationInputError);
  });
});

describe("suggested balancing", () => {
  it("spreads equal circuits evenly", () => {
    const phases = suggestBalancing([16, 16, 16, 10, 10, 10]);
    const sums = [0, 0, 0];
    [16, 16, 16, 10, 10, 10].forEach((c, i) => (sums[phases[i]!]! += c));
    expect(sums).toEqual([26, 26, 26]);
  });

  it("never does worse than putting everything on one phase, and keeps circuit order", () => {
    const currents = [10, 10, 10, 10];
    const phases = suggestBalancing(currents);
    expect(phases).toHaveLength(4);
    const { result } = balancePhases(currents);
    expect(result.after.imbalance_A).toBe(10);
  });

  it("balancePhases reports before and after", () => {
    const { result } = balancePhases([16, 16, 16, 10, 10, 10]);
    expect(result.suggestedPhases).toHaveLength(6);
    expect(result.after.imbalance_A).toBe(0);
  });
});
