import fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { ERROR_CODES } from "@elektro/shared";
import { env, type Env } from "./env.js";
import authPlugin from "./plugins/auth.js";
import { HttpError, sendError, validationFailed } from "./lib/http-error.js";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import { calcRoutes } from "./routes/calc.js";
import { contentRoutes } from "./routes/content.js";
import { healthRoutes } from "./routes/health.js";
import { meRoutes } from "./routes/me.js";
import { topicRoutes } from "./routes/topics.js";

/** JSON logs in production, pretty logs in development, silence in tests. */
function loggerOptions(nodeEnv: Env["NODE_ENV"]): FastifyServerOptions["logger"] {
  switch (nodeEnv) {
    case "production":
      return { level: "info" };
    case "test":
      return false;
    default:
      return {
        level: "debug",
        transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss" } },
      };
  }
}

/**
 * Builds the Fastify instance that serves the API under `/api/*`.
 *
 * In production the same instance also serves the React Router SSR handler for
 * every other route (see `main.ts`): one process, one port, one container.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const config = env();

  const app = fastify({
    trustProxy: config.TRUST_PROXY,
    logger: loggerOptions(config.NODE_ENV),
  });

  await app.register(helmet, {
    // The SSR pages and Mantine ship inline styles; a tailored CSP is a
    // deployment task, not a default.
    contentSecurityPolicy: false,
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    global: false,
    max: 20,
    timeWindow: "1 minute",
  });

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

  // Everything the API owns lives under /api, in its own encapsulated context
  // so that unknown /api paths answer with a code instead of the SSR page.
  await app.register(
    async (api) => {
      api.setNotFoundHandler(async (_request, reply) =>
        reply.code(404).send({ code: ERROR_CODES.NOT_FOUND }),
      );

      // better-auth's own handler, rate limited; it reads the raw body itself.
      await api.register(
        async (scope) => {
          scope.addHook("onRequest", scope.rateLimit());
          await scope.register(authRoutes);
        },
        { prefix: "/auth" },
      );

      await api.register(authPlugin);
      await api.register(healthRoutes);
      await api.register(meRoutes);
      await api.register(topicRoutes);
      await api.register(calcRoutes);
      await api.register(contentRoutes);
      await api.register(adminRoutes);
    },
    { prefix: "/api" },
  );

  return app;
}
