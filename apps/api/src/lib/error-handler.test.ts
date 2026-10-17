import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fastify, { type FastifyInstance } from "fastify";
import { installErrorHandler } from "./error-handler.js";

/**
 * Fastify's own client errors (bad or empty body, wrong media type, too large)
 * are the client's fault: they keep their 4xx status and leave as a code.
 */
let app: FastifyInstance;

beforeEach(async () => {
  app = fastify({ logger: false, bodyLimit: 64 });
  installErrorHandler(app);
  app.delete("/thing", async (_request, reply) => reply.code(204).send());
  app.post("/thing", async () => ({ ok: true }));
  app.get("/boom", async () => {
    throw new Error("unexpected");
  });
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

describe("installErrorHandler", () => {
  it("answers 400 for an empty JSON body (e.g. DELETE with a JSON content-type)", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/thing",
      headers: { "content-type": "application/json" },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ code: "VALIDATION_FAILED" });
  });

  it("answers 400 for malformed JSON", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/thing",
      headers: { "content-type": "application/json" },
      payload: "{not json",
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ code: "VALIDATION_FAILED" });
  });

  it("keeps 415 for an unsupported media type and 413 for a too large body", async () => {
    const unsupported = await app.inject({
      method: "POST",
      url: "/thing",
      headers: { "content-type": "application/x-unknown" },
      payload: "x",
    });
    expect(unsupported.statusCode).toBe(415);
    expect(unsupported.json()).toEqual({ code: "VALIDATION_FAILED" });

    const tooLarge = await app.inject({
      method: "POST",
      url: "/thing",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ text: "x".repeat(200) }),
    });
    expect(tooLarge.statusCode).toBe(413);
    expect(tooLarge.json()).toEqual({ code: "VALIDATION_FAILED" });
  });

  it("still answers 500 for unexpected errors, without the message", async () => {
    const response = await app.inject({ method: "GET", url: "/boom" });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ code: "INTERNAL_ERROR" });
  });
});
