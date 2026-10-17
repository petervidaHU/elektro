import type { CalcResult } from "./types.js";
import { CalculationInputError } from "./voltage-drop.js";

/**
 * Installation-side physics (plan §2.2, K13): the power a service connection
 * can supply and how circuits load the three phases. Textbook identities only.
 */

function positive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new CalculationInputError(field);
  return value;
}

export interface ConnectionPowerInput {
  system: "single-phase" | "three-phase";
  /** 230 V line-to-neutral (single-phase) or line-to-line (three-phase), V. */
  voltage_V: number;
  /** Rated current of the meter-point breaker, A (per phase). */
  mainBreaker_A: number;
  /** Consumer demand to compare with (e.g. from `load-demand`), W. */
  demandPower_W?: number;
}

export interface ConnectionPowerResult {
  availablePower_W: number;
  margin_W?: number;
  sufficient?: boolean;
}

/**
 * Available power of the connection: P = U*I (single-phase) or
 * P = sqrt(3)*U*I (three-phase, balanced), at the full rating of the
 * meter-point breaker. The breaker rating is an input, never a table lookup.
 */
export function calculateConnectionPower(input: ConnectionPowerInput): CalcResult<ConnectionPowerResult> {
  const k = input.system === "three-phase" ? Math.sqrt(3) : 1;
  const available = k * positive(input.voltage_V, "voltage_V") * positive(input.mainBreaker_A, "mainBreaker_A");
  const steps: CalcResult<ConnectionPowerResult>["steps"] = [
    {
      id: "available-power",
      value: available,
      unit: "watt",
      formulaId: input.system === "three-phase" ? "available-power-three-phase" : "available-power-single-phase",
    },
  ];
  const result: ConnectionPowerResult = { availablePower_W: available };

  if (input.demandPower_W !== undefined) {
    const margin = available - positive(input.demandPower_W, "demandPower_W");
    result.margin_W = margin;
    result.sufficient = margin >= 0;
    steps.push({ id: "power-margin", value: margin, unit: "watt", formulaId: "power-margin" });
  }
  return { result, steps };
}

/** A circuit's design current and the phase (0 = L1, 1 = L2, 2 = L3) it is connected to. */
export interface PhaseCircuit {
  current_A: number;
  phase: number;
}

export interface PhaseLoadResult {
  phaseCurrents_A: [number, number, number];
  mostLoadedPhase: number;
  leastLoadedPhase: number;
  /** I_max - I_min, A. */
  imbalance_A: number;
}

const PHASE_STEP_IDS = ["phase-current-l1", "phase-current-l2", "phase-current-l3"] as const;

function loadOf(circuits: readonly PhaseCircuit[]): PhaseLoadResult {
  const sums: [number, number, number] = [0, 0, 0];
  for (const circuit of circuits) {
    if (!Number.isInteger(circuit.phase) || circuit.phase < 0 || circuit.phase > 2) {
      throw new CalculationInputError("phase");
    }
    sums[circuit.phase]! += positive(circuit.current_A, "current_A");
  }
  const max = Math.max(...sums);
  const min = Math.min(...sums);
  return {
    phaseCurrents_A: sums,
    mostLoadedPhase: sums.indexOf(max),
    leastLoadedPhase: sums.indexOf(min),
    imbalance_A: max - min,
  };
}

/** Current per phase as the plain sum of its circuits, the most loaded phase, and the imbalance. */
export function calculatePhaseLoad(circuits: readonly PhaseCircuit[]): CalcResult<PhaseLoadResult> {
  if (circuits.length === 0) throw new CalculationInputError("circuits");
  const result = loadOf(circuits);
  return {
    result,
    steps: [
      ...result.phaseCurrents_A.map((value, index) => ({
        id: PHASE_STEP_IDS[index]!,
        value,
        unit: "ampere" as const,
        formulaId: "phase-current" as const,
      })),
      { id: "phase-imbalance", value: result.imbalance_A, unit: "ampere", formulaId: "phase-imbalance" },
    ],
  };
}

/**
 * A more even split: the greedy "largest first onto the least loaded phase"
 * rule. Returns the phase (0-2) of each circuit in the input order. A
 * suggestion, not an optimum: it is what an installer does by hand.
 */
export function suggestBalancing(currents_A: readonly number[]): number[] {
  const sums = [0, 0, 0];
  const phases = new Array<number>(currents_A.length).fill(0);
  const order = currents_A
    .map((current, index) => ({ current: positive(current, "current_A"), index }))
    .sort((a, b) => b.current - a.current || a.index - b.index);

  for (const { current, index } of order) {
    const phase = sums.indexOf(Math.min(...sums));
    sums[phase]! += current;
    phases[index] = phase;
  }
  return phases;
}

export interface BalancingResult {
  suggestedPhases: number[];
  after: PhaseLoadResult;
}

/** The suggested split and the load it would give. */
export function balancePhases(currents_A: readonly number[]): CalcResult<BalancingResult> {
  if (currents_A.length === 0) throw new CalculationInputError("circuits");
  const suggestedPhases = suggestBalancing(currents_A);
  const after = calculatePhaseLoad(currents_A.map((current_A, i) => ({ current_A, phase: suggestedPhases[i]! })));
  return { result: { suggestedPhases, after: after.result }, steps: after.steps };
}
