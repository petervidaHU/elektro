/**
 * Formula registry. Lessons (`:::formula{id=...}`), calculators and practice
 * steps render formulas from here by ID, so the text a student reads and the
 * engine that checks them can never disagree.
 *
 * Expressions use standard symbols only (no words), so they need no
 * translation. Every formula must be implemented by an engine function with
 * unit tests; the source is documented on that function.
 */
interface Formula {
  expression: string;
}

export const FORMULAS = {
  // Source: MSZ HD 60364-5-52:2014, Annex G (see calc/voltage-drop.ts).
  "phase-factor-single-phase": { expression: "b = 2" },
  "phase-factor-three-phase": { expression: "b = √3" },
  "conductor-resistance": { expression: "R = ρ · L / S" },
  "voltage-drop": { expression: "ΔU = b · R · I · cos φ" },
  "voltage-drop-direct": { expression: "ΔU = b · ρ · L / S · I · cos φ" },
  "voltage-drop-percent": { expression: "ΔU% = ΔU / Uₙ · 100" },
  "permitted-voltage-drop": { expression: "ΔUₘₐₓ = ΔU%ₘₐₓ · Uₙ / 100" },
  "minimum-cross-section": { expression: "Sₘᵢₙ = b · ρ · L · I · cos φ / ΔUₘₐₓ" },
  "standard-cross-section": { expression: "S ≥ Sₘᵢₙ" },
  // Textbook physics (calc/physics.ts).
  "ohms-law-voltage": { expression: "U = I · R" },
  "ohms-law-current": { expression: "I = U / R" },
  "ohms-law-resistance": { expression: "R = U / I" },
  "series-resistance": { expression: "R = R₁ + R₂ + …" },
  "parallel-resistance": { expression: "1/R = 1/R₁ + 1/R₂ + …" },
  "power-dc": { expression: "P = U · I" },
  "power-dc-from-current": { expression: "P = I² · R" },
  "power-dc-from-voltage": { expression: "P = U² / R" },
  "energy": { expression: "W = P · t" },
  "efficiency": { expression: "η = Pₕ / P" },
  "apparent-power-single-phase": { expression: "S = U · I" },
  "active-power-single-phase": { expression: "P = U · I · cos φ" },
  "reactive-power": { expression: "Q = √(S² − P²)" },
  "apparent-power-three-phase": { expression: "S = √3 · U · I" },
  "active-power-three-phase": { expression: "P = √3 · U · I · cos φ" },
  "current-single-phase": { expression: "I = P / (U · cos φ)" },
  "current-three-phase": { expression: "I = P / (√3 · U · cos φ)" },
  "total-power": { expression: "P = P₁ + P₂ + …" },
  "daily-energy": { expression: "W = Σ (Pₙ · tₙ)" },
  "monthly-energy": { expression: "Wₘ = W · n" },
  "mixed-resistance": { expression: "R = R₁ + R₂ ∥ R₃" },
  "voltage-divider": { expression: "Uₙ = U · Rₙ / R" },
  "available-power-single-phase": { expression: "P = U · I" },
  "available-power-three-phase": { expression: "P = √3 · U · I" },
  "power-margin": { expression: "ΔP = Pₐ − Pᵢ" },
  "phase-current": { expression: "I_L = ΣIₙ" },
  "phase-imbalance": { expression: "ΔI = Iₘₐₓ − Iₘᵢₙ" },
  "most-loaded-phase": { expression: "I_L = max" },
  // P2 physics (calc/p2.ts).
  "inductive-reactance": { expression: "X_L = 2π · f · L" },
  "capacitive-reactance": { expression: "X_C = 1 / (2π · f · C)" },
  "series-impedance": { expression: "Z = √(R² + (X_L − X_C)²)" },
  "impedance-phase-angle": { expression: "tg φ = (X_L − X_C) / R" },
  "impedance-power-factor": { expression: "cos φ = R / Z" },
  "series-capacitance": { expression: "1/C = 1/C₁ + 1/C₂ + …" },
  "parallel-capacitance": { expression: "C = C₁ + C₂ + …" },
  "capacitor-charge": { expression: "Q = C · U" },
  "capacitor-energy": { expression: "W = C · U² / 2" },
  "rc-time-constant": { expression: "τ = R · C" },
  "capacitor-charging": { expression: "u = U · (1 − e^(−t/τ))" },
  "capacitor-discharging": { expression: "u = U · e^(−t/τ)" },
  "series-inductance": { expression: "L = L₁ + L₂ + …" },
  "parallel-inductance": { expression: "1/L = 1/L₁ + 1/L₂ + …" },
  "inductor-energy": { expression: "W = L · I² / 2" },
  "rl-time-constant": { expression: "τ = L / R" },
  "inductor-current-rise": { expression: "i = (U / R) · (1 − e^(−t/τ))" },
  "source-current": { expression: "I = E / (Rᵦ + R)" },
  "terminal-voltage": { expression: "U = E − Rᵦ · I" },
  "source-short-circuit-current": { expression: "I_k = E / Rᵦ" },
  "maximum-power-transfer": { expression: "P_max = E² / (4 · Rᵦ)" },
  "source-efficiency": { expression: "η = R / (R + Rᵦ)" },
  "turns-ratio": { expression: "U₁ / U₂ = N₁ / N₂" },
  "transformer-current": { expression: "I₁ / I₂ = N₂ / N₁" },
  "charge": { expression: "Q = I · t" },
  "peak-value": { expression: "Uₘ = U · √2" },
  "period-frequency": { expression: "f = 1 / T" },
  "angular-frequency": { expression: "ω = 2π · f" },
  "node-voltage": { expression: "U_ab = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂ + 1/R₃)" },
  "branch-current": { expression: "Iₙ = (Eₙ − U_ab) / Rₙ" },
  "wheatstone-balance": { expression: "R₁ / R₂ = R₃ / Rₓ" },
  "wheatstone-unknown": { expression: "Rₓ = R₂ · R₃ / R₁" },
  "wheatstone-bridge-voltage": { expression: "U_h = U · (R₂/(R₁+R₂) − Rₓ/(R₃+Rₓ))" },
  "shunt-resistor": { expression: "Rₚ = Rₘ · Iₘ / (I − Iₘ)" },
  "series-resistor": { expression: "Rₛ = U / Iₘ − Rₘ" },
  "meter-absolute-error": { expression: "Δ = M · p/100 + n · d" },
  "synchronous-speed": { expression: "nₛ = 60 · f / p" },
  "slip": { expression: "s = (nₛ − n) / nₛ" },
  "motor-rated-current": { expression: "I = P / (√3 · U · η · cos φ)" },
  "star-delta-start-current": { expression: "I_Y = I_Δ / 3" },
  "short-circuit-current": { expression: "I_k = U₀ / Z_s" },
  "maximum-loop-impedance": { expression: "Z_s,max = U₀ / Iₐ" },
  "illuminance": { expression: "E = Φ / A" },
  "luminaire-count": { expression: "N ≥ E · A / (Φₗ · η)" },
  "pe-expected-resistance": { expression: "R = ρ · L / S" },
  "pe-resistance-ratio": { expression: "k = R_mért / R" },
  "line-total": { expression: "Cₙ = nₙ · aₙ" },
  "material-total": { expression: "C = ΣCₙ" },
} as const satisfies Record<string, Formula>;

export type FormulaId = keyof typeof FORMULAS;

export function isFormulaId(value: unknown): value is FormulaId {
  return typeof value === "string" && Object.hasOwn(FORMULAS, value);
}
