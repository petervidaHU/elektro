import type { FastifyReply } from "fastify";
import { ERROR_CODES, type ApiErrorBody, type ErrorCode } from "@elektro/shared";
import type { z } from "zod";

/**
 * The API answers with error *codes*; the frontend turns a code into a
 * localised message via i18next. Never put human-readable text here.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, string[]>;

  constructor(statusCode: number, code: ErrorCode, details?: Record<string, string[]>) {
    super(code);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    if (details) {
      this.details = details;
    }
  }

  toBody(): ApiErrorBody {
    return this.details ? { code: this.code, details: this.details } : { code: this.code };
  }
}

export const unauthenticated = () => new HttpError(401, ERROR_CODES.UNAUTHENTICATED);
export const forbidden = () => new HttpError(403, ERROR_CODES.FORBIDDEN);
export const notFound = () => new HttpError(404, ERROR_CODES.NOT_FOUND);

export function validationFailed(error: z.ZodError): HttpError {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (details[key] ??= []).push(issue.code);
  }

  return new HttpError(400, ERROR_CODES.VALIDATION_FAILED, details);
}

/** Parses a payload with a zod schema, throwing a coded 400 on failure. */
export function parseBody<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw validationFailed(result.error);
  }
  return result.data;
}

export function sendError(reply: FastifyReply, error: HttpError): FastifyReply {
  return reply.code(error.statusCode).send(error.toBody());
}
