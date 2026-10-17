import { describe, expect, it } from "vitest";
import { CalculationInputError } from "./voltage-drop.js";
import {
  currentFromVoltageResistance,
  parallelResistance,
  powerDc,
  powerThreePhase,
  powerSinglePhase,
  resistanceFromVoltageCurrent,
  seriesResistance,
  solveOhmsLaw,
  solveParallelBranches,
  solveSeriesCircuit,
  voltageFromCurrentResistance,
} from "./physics.js";

/** Textbook identities: values are exact, so they need no external source. */
describe("Ohm's law: U = I * R", () => {
  it("computes each quantity from the other two", () => {
    expect(voltageFromCurrentResistance(2, 115)).toBe(230);
    expect(currentFromVoltageResistance(230, 115)).toBe(2);
    expect(resistanceFromVoltageCurrent(230, 2)).toBe(115);
  });

  it("solveOhmsLaw returns the missing quantity with its step", () => {
    const { result, steps } = solveOhmsLaw({ voltage_V: 230, resistance_ohm: 46 });
    expect(result.current_A).toBe(5);
    expect(steps.map((s) => s.id)).toEqual(["current"]);
    expect(solveOhmsLaw({ voltage_V: 230, current_A: 5 }).result.resistance_ohm).toBe(46);
    expect(solveOhmsLaw({ current_A: 5, resistance_ohm: 46 }).result.voltage_V).toBe(230);
  });

  it("needs exactly two quantities and positive values", () => {
    expect(() => solveOhmsLaw({ voltage_V: 230 })).toThrow(CalculationInputError);
    expect(() => solveOhmsLaw({ voltage_V: 1, current_A: 1, resistance_ohm: 1 })).toThrow(CalculationInputError);
    expect(() => solveOhmsLaw({ voltage_V: 230, resistance_ohm: 0 })).toThrow(CalculationInputError);
  });
});

describe("series and parallel resistance", () => {
  it("adds in series and takes the reciprocal sum in parallel", () => {
    expect(seriesResistance([10, 20, 30])).toBe(60);
    expect(parallelResistance([10, 10])).toBeCloseTo(5, 12);
    expect(parallelResistance([6, 3])).toBeCloseTo(2, 12);
    expect(parallelResistance([30, 60, 20])).toBeCloseTo(10, 12);
  });

  it("rejects fewer than two or non-positive resistances", () => {
    expect(() => seriesResistance([10])).toThrow(CalculationInputError);
    expect(() => parallelResistance([10, 0])).toThrow(CalculationInputError);
  });

  it("series circuit: same current, voltage divides in proportion to R", () => {
    const { result } = solveSeriesCircuit({ supplyVoltage_V: 30, resistances_ohm: [10, 20] });
    expect(result.totalResistance_ohm).toBe(30);
    expect(result.current_A).toBe(1);
    expect(result.voltages_V).toEqual([10, 20]);
  });

  it("parallel circuit: same voltage, current divides inversely to R", () => {
    const { result } = solveParallelBranches({ supplyVoltage_V: 12, resistances_ohm: [6, 3] });
    expect(result.totalResistance_ohm).toBeCloseTo(2, 12);
    expect(result.branchCurrents_A[0]).toBeCloseTo(2, 12);
    expect(result.branchCurrents_A[1]).toBeCloseTo(4, 12);
    expect(result.totalCurrent_A).toBeCloseTo(6, 12);
  });
});

describe("DC power: P = U*I = I^2*R = U^2/R", () => {
  it("gives the same power from any two quantities", () => {
    expect(powerDc({ voltage_V: 230, current_A: 10 }).result.power_W).toBe(2300);
    expect(powerDc({ current_A: 10, resistance_ohm: 23 }).result.power_W).toBe(2300);
    expect(powerDc({ voltage_V: 230, resistance_ohm: 23 }).result.power_W).toBeCloseTo(2300, 9);
  });

  it("derives the missing quantities and the energy for a duration", () => {
    const { result } = powerDc({ voltage_V: 230, current_A: 10, duration_h: 2 });
    expect(result.resistance_ohm).toBe(23);
    expect(result.energy_kWh).toBeCloseTo(4.6, 12);
  });

  it("efficiency = useful / supplied power", () => {
    const { result } = powerDc({ voltage_V: 100, current_A: 10, usefulPower_W: 800 });
    expect(result.efficiency).toBeCloseTo(0.8, 12);
    expect(() => powerDc({ voltage_V: 100, current_A: 10, usefulPower_W: 2000 })).toThrow(CalculationInputError);
  });
});

describe("AC power", () => {
  it("single-phase: P = U I cos phi, S = U I, Q = sqrt(S^2 - P^2)", () => {
    const { result } = powerSinglePhase({ voltage_V: 230, current_A: 10, powerFactor: 0.8 });
    expect(result.apparentPower_VA).toBe(2300);
    expect(result.activePower_W).toBeCloseTo(1840, 9);
    expect(result.reactivePower_var).toBeCloseTo(1380, 9);
  });

  it("single-phase: current from power", () => {
    const { result } = powerSinglePhase({ voltage_V: 230, activePower_W: 1840, powerFactor: 0.8 });
    expect(result.current_A).toBeCloseTo(10, 9);
  });

  it("three-phase: P = sqrt(3) U I cos phi with line voltage", () => {
    const { result } = powerThreePhase({ lineVoltage_V: 400, current_A: 10, powerFactor: 1 });
    expect(result.activePower_W).toBeCloseTo(Math.sqrt(3) * 4000, 9);
    expect(result.apparentPower_VA).toBeCloseTo(Math.sqrt(3) * 4000, 9);
  });

  it("three-phase: line current from power", () => {
    const { result } = powerThreePhase({ lineVoltage_V: 400, activePower_W: 6928.203230275509, powerFactor: 1 });
    expect(result.current_A).toBeCloseTo(10, 9);
  });

  it("rejects a power factor outside (0, 1]", () => {
    expect(() => powerSinglePhase({ voltage_V: 230, current_A: 1, powerFactor: 1.2 })).toThrow(CalculationInputError);
  });
});
