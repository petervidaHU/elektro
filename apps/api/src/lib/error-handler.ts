import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ERROR_CODES } from "@elektro/shared";
import { HttpError, sendError, validationFailed } from "./http-error.js";

/** Every error leaves the API as a code (never a message). */
export function installErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return sendError(reply, error);
    }
    if (error instanceof ZodError) {
      return sendError(reply, validationFailed(error));
    }
    // Everything else is a Fastify error (or an unexpected throw).
    const fastifyError = error as FastifyError;

    if (fastifyError.statusCode === 429) {
      return reply.code(429).send({ code: ERROR_CODES.RATE_LIMITED });
    }
    if (fastifyError.validation) {
      return reply.code(400).send({ code: ERROR_CODES.VALIDATION_FAILED });
    }

    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ code: ERROR_CODES.INTERNAL_ERROR });
  });
}
