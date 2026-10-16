import { z } from "zod";
import { PHASE_SYSTEMS } from "../calc/voltage-drop.js";
import { CONDUCTOR_MATERIALS } from "../reference/conductors.js";

/**
 * Request shape for the voltage-drop calculator. The material is selected by
 * name here and resolved to a resistivity by the caller, so the engine itself
 * keeps taking resistivity explicitly.
 */
export const voltageDropRequestSchema = z.object({
  current_A: z.number().positive().max(10_000),
  length_m: z.number().positive().max(10_000),
  crossSection_mm2: z.number().positive().max(1000),
  material: z.enum(CONDUCTOR_MATERIALS),
  nominalVoltage_V: z.number().positive().max(1000),
  system: z.enum(PHASE_SYSTEMS),
  powerFactor: z.number().positive().max(1).optional(),
});

export type VoltageDropRequest = z.infer<typeof voltageDropRequestSchema>;
