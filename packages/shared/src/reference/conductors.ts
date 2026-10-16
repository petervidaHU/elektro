/**
 * Conductor reference data.
 *
 * !! VERIFY AGAINST THE COURSE TEXTBOOK BEFORE USING IN STUDENT-FACING CONTENT.
 *
 * The resistivity values below are the ones IEC/MSZ HD 60364-5-52 Annex G
 * prescribes for voltage-drop calculations, i.e. resistivity at the conductor's
 * normal operating temperature (1.25 x the value at 20 degC). A course textbook
 * may instead teach the 20 degC values (Cu ~0.0175, Al ~0.0278 ohm*mm2/m); the
 * two give results that differ by ~25%, so the training must agree on one.
 *
 * Nothing in the calculation engine reads these constants implicitly:
 * `calculateVoltageDrop` takes resistivity as an explicit input, so a wrong
 * table value can never silently change a result.
 *
 * Source: MSZ HD 60364-5-52:2014, Annex G (rho_1 = resistivity of the conductor
 * at normal operating temperature).
 */
export const CONDUCTOR_MATERIALS = ["copper", "aluminium"] as const;

export type ConductorMaterial = (typeof CONDUCTOR_MATERIALS)[number];

/**
 * Resistivity at normal operating temperature, in ohm*mm2/m.
 *
 * Source: MSZ HD 60364-5-52:2014, Annex G.
 */
export const RESISTIVITY_AT_OPERATING_TEMPERATURE: Record<ConductorMaterial, number> = {
  copper: 0.0225,
  aluminium: 0.036,
};

/**
 * Standard nominal cross-sections of the IEC 60228 series, in mm2.
 *
 * Source: MSZ EN 60228 (IEC 60228), conductors of insulated cables.
 */
export const STANDARD_CROSS_SECTIONS_MM2 = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
] as const;

export type StandardCrossSection = (typeof STANDARD_CROSS_SECTIONS_MM2)[number];

/**
 * Smallest standard cross-section that is at least `minimum_mm2`, or
 * `undefined` when the requirement exceeds the tabulated series.
 */
export function nextStandardCrossSection(minimum_mm2: number): number | undefined {
  return STANDARD_CROSS_SECTIONS_MM2.find((size) => size >= minimum_mm2);
}
