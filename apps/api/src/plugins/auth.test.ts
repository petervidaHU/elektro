import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";

/**
 * The guards are the server-side security boundary. These tests run the real
 * `registerGuards` (via the test app) - without a database or a live
 * better-auth session.
 */
const guarded: FastifyPluginAsync = async (app) => {
  app.get("/user", async (request) => ({ role: app.requireUser(request).role }));
  app.get("/teacher", async (request) => ({ role: app.requireRole(request, "teacher").role }));
  app.get("/admin", async (request) => ({ role: app.requireRole(request, "admin").role }));
};

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildTestApp(guarded, {});
});

afterAll(async () => {
  await app.close();
});

const call = (url: string, headers = {}) => app.inject({ method: "GET", url, headers });

describe("requireUser", () => {
  it("rejects anonymous requests with a 401 code", async () => {
    const response = await call("/user");
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "UNAUTHENTICATED" });
  });

  it("returns the session user", async () => {
    expect((await call("/user", as("s", "student"))).json()).toEqual({ role: "student" });
  });
});

describe("requireRole", () => {
  it("lets a role through for its own level and below", async () => {
    expect((await call("/admin", as("a", "admin"))).json()).toEqual({ role: "admin" });
    expect((await call("/teacher", as("a", "admin"))).json()).toEqual({ role: "admin" });
    expect((await call("/teacher", as("t", "teacher"))).json()).toEqual({ role: "teacher" });
  });

  it("blocks students from teacher-only and admin-only routes", async () => {
    for (const url of ["/teacher", "/admin"]) {
      const response = await call(url, as("s", "student"));
      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({ code: "FORBIDDEN" });
    }
  });

  it("blocks teachers from admin-only routes", async () => {
    expect((await call("/admin", as("t", "teacher"))).statusCode).toBe(403);
  });

  it("answers 401 - not 403 - when there is no session at all", async () => {
    expect((await call("/admin")).statusCode).toBe(401);
  });
});
