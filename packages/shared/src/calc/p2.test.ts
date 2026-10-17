import { describe, expect, it } from "vitest";
import {
  calculateAcImpedance,
  calculateAcValues,
  calculateCapacitors,
  calculateInductors,
  calculateVoltageSource,
  solveCharge,
  solveTransformer,
} from "./p2.js";
import { CalculationInputError } from "./voltage-drop.js";

/** Textbook identities with hand-checkable numbers. */
const hz50 = 2 * Math.PI * 50;

describe("series RLC impedance", () => {
  it("R = 30 ohm with X_L = 40 ohm gives Z = 50 ohm, cos phi = 0.6, phi = 53.13 deg", () => {
    const { result } = calculateAcImpedance({ resistance_ohm: 30, inductance_H: 40 / hz50, frequency_Hz: 50, voltage_V: 100 });
    expect(result.inductiveReactance_ohm).toBeCloseTo(40, 9);
    expect(result.impedance_ohm).toBeCloseTo(50, 9);
    expect(result.current_A).toBeCloseTo(2, 9);
    expect(result.powerFactor).toBeCloseTo(0.6, 9);
    expect(result.phaseAngle_deg).toBeCloseTo(53.130102, 5);
    expect(result.resistorVoltage_V).toBeCloseTo(60, 9);
    expect(result.inductorVoltage_V).toBeCloseTo(80, 9);
  });

  it("capacitive reactance X_C = 1 / (2 pi f C) and a negative phase angle", () => {
    const c = 1 / (hz50 * 40);
    const { result } = calculateAcImpedance({ resistance_ohm: 30, capacitance_F: c, frequency_Hz: 50, voltage_V: 100 });
    expect(result.capacitiveReactance_ohm).toBeCloseTo(40, 9);
    expect(result.impedance_ohm).toBeCloseTo(50, 9);
    expect(result.phaseAngle_deg).toBeCloseTo(-53.130102, 5);
  });

  it("resonance: X_L = X_C leaves Z = R and phi = 0", () => {
    const l = 40 / hz50;
    const c = 1 / (hz50 * 40);
    const { result } = calculateAcImpedance({ resistance_ohm: 25, inductance_H: l, capacitance_F: c, frequency_Hz: 50, voltage_V: 50 });
    expect(result.impedance_ohm).toBeCloseTo(25, 9);
    expect(result.phaseAngle_deg).toBeCloseTo(0, 9);
  });

  it("a pure resistor has no reactance", () => {
    const { result } = calculateAcImpedance({ resistance_ohm: 10, frequency_Hz: 50, voltage_V: 20 });
    expect(result.impedance_ohm).toBe(10);
    expect(result.current_A).toBe(2);
  });

  it("rejects non-positive input", () => {
    expect(() => calculateAcImpedance({ resistance_ohm: 0, frequency_Hz: 50, voltage_V: 1 })).toThrow(CalculationInputError);
    expect(() => calculateAcImpedance({ resistance_ohm: 1, inductance_H: 0.1, frequency_Hz: 0, voltage_V: 1 })).toThrow(CalculationInputError);
  });
});

describe("capacitors", () => {
  it("series: 1/C = sum of 1/Ci; parallel: sum", () => {
    expect(calculateCapacitors({ mode: "parallel", capacitances_F: [1e-6, 2e-6, 3e-6], voltage_V: 10 }).result.capacitance_F).toBeCloseTo(6e-6, 15);
    expect(calculateCapacitors({ mode: "series", capacitances_F: [6e-6, 3e-6], voltage_V: 10 }).result.capacitance_F).toBeCloseTo(2e-6, 15);
  });

  it("Q = C U, W = C U^2 / 2, tau = R C", () => {
    const { result } = calculateCapacitors({ mode: "single", capacitances_F: [100e-6], voltage_V: 10, resistance_ohm: 1000 });
    expect(result.charge_C).toBeCloseTo(1e-3, 12);
    expect(result.energy_J).toBeCloseTo(5e-3, 12);
    expect(result.timeConstant_s).toBeCloseTo(0.1, 12);
  });

  it("charging and discharging voltage at time t", () => {
    const { result } = calculateCapacitors({ mode: "single", capacitances_F: [100e-6], voltage_V: 10, resistance_ohm: 1000, time_s: 0.1 });
    expect(result.chargingVoltage_V).toBeCloseTo(10 * (1 - Math.exp(-1)), 9);
    expect(result.dischargingVoltage_V).toBeCloseTo(10 * Math.exp(-1), 9);
  });

  it("needs two or more capacitors for series and parallel", () => {
    expect(() => calculateCapacitors({ mode: "series", capacitances_F: [1e-6], voltage_V: 1 })).toThrow(CalculationInputError);
  });
});

describe("inductors", () => {
  it("series sums, parallel takes the reciprocal sum (no mutual coupling)", () => {
    expect(calculateInductors({ mode: "series", inductances_H: [1, 2], current_A: 1 }).result.inductance_H).toBe(3);
    expect(calculateInductors({ mode: "parallel", inductances_H: [6, 3], current_A: 1 }).result.inductance_H).toBeCloseTo(2, 12);
  });

  it("W = L I^2 / 2, tau = L / R and the rising current", () => {
    const { result } = calculateInductors({ mode: "single", inductances_H: [0.5], current_A: 2, resistance_ohm: 5, voltage_V: 10, time_s: 0.1 });
    expect(result.energy_J).toBeCloseTo(1, 12);
    expect(result.timeConstant_s).toBeCloseTo(0.1, 12);
    expect(result.risingCurrent_A).toBeCloseTo((10 / 5) * (1 - Math.exp(-1)), 9);
  });
});

describe("real voltage source", () => {
  it("E = 12 V, Ri = 1 ohm, R = 5 ohm: I = 2 A, U = 10 V", () => {
    const { result } = calculateVoltageSource({ emf_V: 12, internalResistance_ohm: 1, loadResistance_ohm: 5 });
    expect(result.current_A).toBe(2);
    expect(result.terminalVoltage_V).toBe(10);
    expect(result.loadPower_W).toBe(20);
    expect(result.efficiency).toBeCloseTo(5 / 6, 12);
  });

  it("short-circuit current E / Ri and the matched load R = Ri with P_max = E^2 / (4 Ri)", () => {
    const { result } = calculateVoltageSource({ emf_V: 12, internalResistance_ohm: 2 });
    expect(result.shortCircuitCurrent_A).toBe(6);
    expect(result.matchedLoad_ohm).toBe(2);
    expect(result.maxPower_W).toBe(18);
  });
});

describe("ideal transformer", () => {
  it("finds the missing one of U1, U2, N1, N2 from the ratio", () => {
    expect(solveTransformer({ primaryVoltage_V: 230, primaryTurns: 1000, secondaryTurns: 100 }).result.secondaryVoltage_V).toBeCloseTo(23, 12);
    expect(solveTransformer({ primaryVoltage_V: 230, secondaryVoltage_V: 23, primaryTurns: 1000 }).result.secondaryTurns).toBeCloseTo(100, 9);
  });

  it("currents are inversely proportional to the voltages", () => {
    const { result } = solveTransformer({ primaryVoltage_V: 230, secondaryVoltage_V: 23, primaryTurns: 1000, secondaryCurrent_A: 10 });
    expect(result.primaryCurrent_A).toBeCloseTo(1, 12);
    expect(result.turnsRatio).toBeCloseTo(10, 12);
  });

  it("needs exactly three of the four", () => {
    expect(() => solveTransformer({ primaryVoltage_V: 230, primaryTurns: 1000 })).toThrow(CalculationInputError);
  });
});

describe("charge and current", () => {
  it("Q = I t, solved for any one", () => {
    expect(solveCharge({ current_A: 2, time_s: 30 }).result.charge_C).toBe(60);
    expect(solveCharge({ charge_C: 60, time_s: 30 }).result.current_A).toBe(2);
    expect(solveCharge({ charge_C: 60, current_A: 2 }).result.time_s).toBe(30);
  });
});

describe("AC values", () => {
  it("peak = rms * sqrt(2) and back", () => {
    expect(calculateAcValues({ rms_V: 230 }).result.peak_V).toBeCloseTo(230 * Math.SQRT2, 9);
    expect(calculateAcValues({ peak_V: 325 }).result.rms_V).toBeCloseTo(325 / Math.SQRT2, 9);
  });

  it("f = 1 / T and the angular frequency", () => {
    const { result } = calculateAcValues({ rms_V: 230, period_s: 0.02 });
    expect(result.frequency_Hz).toBeCloseTo(50, 9);
    expect(result.angularFrequency_rad_s).toBeCloseTo(2 * Math.PI * 50, 9);
    expect(calculateAcValues({ rms_V: 1, frequency_Hz: 50 }).result.period_s).toBeCloseTo(0.02, 12);
  });
});
