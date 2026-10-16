import { afterEach, describe, expect, it } from "vitest";
import fastify, { type FastifyInstance } from "fastify";
import type { AuthenticatedUser } from "../plugins/auth.js";
import { meRoutes } from "./me.js";

/**
 * `/api/me` tells the frontend who is signed in, so it can show the right
 * navigation. The session itself is resolved by the auth plugin; here it is
 * stubbed so the route is tested without a database.
 */
async function appWithSession(user: AuthenticatedUser | null): Promise<FastifyInstance> {
  const app = fastify({ logger: false });
  app.decorateRequest("currentUser", null);
  app.addHook("onRequest", async (request) => {
    request.currentUser = user;
  });
  await app.register(meRoutes);
  return app;
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
});

describe("GET /me", () => {
  it("answers a guest with user: null (not 401 - guests may browse)", async () => {
    app = await appWithSession(null);
    const response = await app.inject({ method: "GET", url: "/me" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ user: null });
  });

  it("returns the signed-in user's id, name, email and role", async () => {
    const student: AuthenticatedUser = {
      id: "u1",
      name: "Teszt Elek",
      email: "teszt@example.com",
      role: "student",
    };
    app = await appWithSession(student);
    const response = await app.inject({ method: "GET", url: "/me" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ user: student });
  });

  it("is never cached, because the answer depends on the session", async () => {
    app = await appWithSession(null);
    const response = await app.inject({ method: "GET", url: "/me" });

    expect(response.headers["cache-control"]).toBe("no-store");
  });
});
