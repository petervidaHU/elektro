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
} as const satisfies Record<string, Formula>;

export type FormulaId = keyof typeof FORMULAS;

export function isFormulaId(value: unknown): value is FormulaId {
  return typeof value === "string" && Object.hasOwn(FORMULAS, value);
}
