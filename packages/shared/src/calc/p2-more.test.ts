import { describe, expect, it } from "vitest";
import {
  calculateIlluminance,
  calculateMaterialList,
  calculateMeasurementError,
  calculateMotor,
  calculatePeContinuityCheck,
  calculateShortCircuit,
  solveKirchhoff,
  solveMeterRange,
  solveWheatstone,
} from "./p2-more.js";
import { CalculationInputError } from "./voltage-drop.js";

describe("two-source circuit (Kirchhoff)", () => {
  it("E1 = 10 V, E2 = 5 V, R1 = R2 = R3 = 10 ohm: U_ab = 5 V, currents 0.5, 0, 0.5 A", () => {
    const { result } = solveKirchhoff({ emf1_V: 10, resistance1_ohm: 10, emf2_V: 5, resistance2_ohm: 10, resistance3_ohm: 10 });
    // Millman: Uab = (1 + 0.5) / 0.3 = 5 V
    expect(result.nodeVoltage_V).toBeCloseTo(5, 12);
    expect(result.current1_A).toBeCloseTo(0.5, 12);
    expect(result.current2_A).toBeCloseTo(0, 12);
    expect(result.current3_A).toBeCloseTo(0.5, 12);
  });

  it("the node law holds: I1 + I2 = I3, also with a reversed source", () => {
    const { result } = solveKirchhoff({ emf1_V: 12, resistance1_ohm: 2, emf2_V: -6, resistance2_ohm: 3, resistance3_ohm: 4 });
    expect(result.current1_A + result.current2_A).toBeCloseTo(result.current3_A, 12);
  });
});

describe("Wheatstone bridge", () => {
  it("balance: R1 / R2 = R3 / Rx, so Rx = R2 R3 / R1", () => {
    expect(solveWheatstone({ resistance1_ohm: 100, resistance2_ohm: 200, resistance3_ohm: 300 }).result.unknownResistance_ohm).toBe(600);
  });

  it("the bridge voltage is zero at balance and non-zero otherwise", () => {
    const balanced = solveWheatstone({ resistance1_ohm: 100, resistance2_ohm: 200, resistance3_ohm: 300, supplyVoltage_V: 12 });
    expect(balanced.result.bridgeVoltage_V).toBeCloseTo(0, 12);
    const off = solveWheatstone({ resistance1_ohm: 100, resistance2_ohm: 200, resistance3_ohm: 300, unknownResistance_ohm: 700, supplyVoltage_V: 12 });
    expect(Math.abs(off.result.bridgeVoltage_V!)).toBeGreaterThan(0);
  });
});

describe("meter range extension", () => {
  it("shunt: Rs = Rm Im / (I - Im)", () => {
    // 1 mA, 100 ohm movement to 10 mA: Rs = 100 * 0.001 / 0.009
    expect(solveMeterRange({ kind: "ammeter", meterResistance_ohm: 100, meterCurrent_A: 0.001, targetRange: 0.01 }).result.resistor_ohm).toBeCloseTo(100 / 9, 9);
  });

  it("series resistor: Rv = U / Im - Rm", () => {
    expect(solveMeterRange({ kind: "voltmeter", meterResistance_ohm: 100, meterCurrent_A: 0.001, targetRange: 10 }).result.resistor_ohm).toBeCloseTo(9900, 9);
  });

  it("the new range must exceed the meter's own", () => {
    expect(() => solveMeterRange({ kind: "ammeter", meterResistance_ohm: 100, meterCurrent_A: 0.001, targetRange: 0.001 })).toThrow(CalculationInputError);
    expect(() => solveMeterRange({ kind: "voltmeter", meterResistance_ohm: 100, meterCurrent_A: 0.001, targetRange: 0.05 })).toThrow(CalculationInputError);
  });
});

describe("digital meter accuracy", () => {
  it("error = reading * p / 100 + digits * resolution", () => {
    // 230,0 V reading, 0,5 % + 2 digits, resolution 0,1 V: 1,15 + 0,2 = 1,35 V
    const { result } = calculateMeasurementError({ reading: 230, percentOfReading: 0.5, digits: 2, resolution: 0.1 });
    expect(result.absoluteError).toBeCloseTo(1.35, 12);
    expect(result.minimum).toBeCloseTo(228.65, 12);
    expect(result.maximum).toBeCloseTo(231.35, 12);
    expect(result.relativeErrorPercent).toBeCloseTo((1.35 / 230) * 100, 12);
  });
});

describe("motor basics", () => {
  it("synchronous speed n_s = 60 f / p and slip", () => {
    const { result } = calculateMotor({ frequency_Hz: 50, polePairs: 2, rotorSpeed_rpm: 1425 });
    expect(result.synchronousSpeed_rpm).toBe(1500);
    expect(result.slip).toBeCloseTo(0.05, 12);
  });

  it("rated current I = P / (sqrt(3) U eta cos phi)", () => {
    const { result } = calculateMotor({ ratedPower_W: 4000, voltage_V: 400, efficiency: 0.85, powerFactor: 0.8 });
    expect(result.ratedCurrent_A).toBeCloseTo(4000 / (Math.sqrt(3) * 400 * 0.85 * 0.8), 9);
  });

  it("star-delta start draws a third of the direct-on-line starting current", () => {
    const { result } = calculateMotor({ ratedPower_W: 4000, voltage_V: 400, efficiency: 0.85, powerFactor: 0.8, startingCurrentRatio: 6 });
    expect(result.directStartCurrent_A).toBeCloseTo(6 * result.ratedCurrent_A!, 9);
    expect(result.starDeltaStartCurrent_A).toBeCloseTo((6 * result.ratedCurrent_A!) / 3, 9);
  });

  it("rejects an efficiency above 1 and a rotor faster than the field", () => {
    expect(() => calculateMotor({ ratedPower_W: 1, voltage_V: 400, efficiency: 1.2, powerFactor: 0.8 })).toThrow(CalculationInputError);
    expect(() => calculateMotor({ frequency_Hz: 50, polePairs: 2, rotorSpeed_rpm: 1600 })).toThrow(CalculationInputError);
  });
});

describe("short-circuit current", () => {
  it("I_k = U0 / Zs, and whether a given trip current is reached", () => {
    const { result } = calculateShortCircuit({ phaseVoltage_V: 230, loopImpedance_ohm: 0.5, tripCurrent_A: 160 });
    expect(result.shortCircuitCurrent_A).toBe(460);
    expect(result.tripReached).toBe(true);
    expect(calculateShortCircuit({ phaseVoltage_V: 230, loopImpedance_ohm: 2, tripCurrent_A: 160 }).result.tripReached).toBe(false);
  });

  it("the highest loop impedance that still reaches a trip current is U0 / I_trip", () => {
    expect(calculateShortCircuit({ phaseVoltage_V: 230, loopImpedance_ohm: 1, tripCurrent_A: 115 }).result.maxLoopImpedance_ohm).toBe(2);
  });
});

describe("illuminance", () => {
  it("E = Phi / A, and the number of luminaires for a target (rounded up)", () => {
    const { result } = calculateIlluminance({ luminousFlux_lm: 3000, area_m2: 20, targetIlluminance_lx: 300, fluxPerLuminaire_lm: 1500 });
    expect(result.illuminance_lx).toBe(150);
    // 300 lx * 20 m2 = 6000 lm -> 4 luminaires of 1500 lm
    expect(result.luminairesNeeded).toBe(4);
  });

  it("a utilisation factor below 1 needs more luminaires", () => {
    const { result } = calculateIlluminance({ luminousFlux_lm: 3000, area_m2: 20, targetIlluminance_lx: 300, fluxPerLuminaire_lm: 1500, utilisationFactor: 0.8 });
    expect(result.luminairesNeeded).toBe(5);
  });
});

describe("PE continuity check", () => {
  it("expected R = rho L / S and the measured / expected ratio", () => {
    const { result } = calculatePeContinuityCheck({ resistivity_ohm_mm2_per_m: 0.0225, length_m: 20, crossSection_mm2: 2.5, measuredResistance_ohm: 0.27, allowedFactor: 1.5 });
    expect(result.expectedResistance_ohm).toBeCloseTo(0.18, 12);
    expect(result.ratio).toBeCloseTo(1.5, 12);
    expect(result.withinAllowed).toBe(true);
    expect(calculatePeContinuityCheck({ resistivity_ohm_mm2_per_m: 0.0225, length_m: 20, crossSection_mm2: 2.5, measuredResistance_ohm: 0.5, allowedFactor: 1.5 }).result.withinAllowed).toBe(false);
  });
});

describe("material list", () => {
  it("sums quantity * unit price per line and in total, with an optional reserve", () => {
    const { result } = calculateMaterialList({ lines: [{ quantity: 50, unitPrice: 120 }, { quantity: 10, unitPrice: 300 }] });
    expect(result.lineTotals).toEqual([6000, 3000]);
    expect(result.total).toBe(9000);
    expect(calculateMaterialList({ lines: [{ quantity: 50, unitPrice: 120 }], reservePercent: 10 }).result.totalWithReserve).toBeCloseTo(6600, 9);
  });
});
