import type { FastifyPluginAsync } from "fastify";
import {
  calculateVoltageDrop,
  CalculationInputError,
  ERROR_CODES,
  RESISTIVITY_AT_OPERATING_TEMPERATURE,
  voltageDropRequestSchema,
} from "@elektro/shared";
import { HttpError, parseBody } from "../lib/http-error.js";

/**
 * Calculators run in `packages/shared`, so the same engine backs the API, the
 * SSR render and the client. This route exists for practice-task checking,
 * where the result must not be computed by the client alone.
 */
export const calcRoutes: FastifyPluginAsync = async (app) => {
  app.post("/calc/voltage-drop", async (request) => {
    const input = parseBody(voltageDropRequestSchema, request.body);

    try {
      return calculateVoltageDrop({
        current_A: input.current_A,
        length_m: input.length_m,
        crossSection_mm2: input.crossSection_mm2,
        resistivity_ohm_mm2_per_m: RESISTIVITY_AT_OPERATING_TEMPERATURE[input.material],
        nominalVoltage_V: input.nominalVoltage_V,
        system: input.system,
        ...(input.powerFactor === undefined ? {} : { powerFactor: input.powerFactor }),
      });
    } catch (error) {
      if (error instanceof CalculationInputError) {
        throw new HttpError(400, ERROR_CODES.CALCULATION_INPUT_INVALID, {
          [error.field]: ["invalid"],
        });
      }
      throw error;
    }
  });
};
