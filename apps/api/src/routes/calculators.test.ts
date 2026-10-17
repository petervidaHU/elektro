import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";
import { calculatorRoutes } from "./calculators.js";

/**
 * Authorization of the calculator registry. The role checks run before any
 * database access, so they are tested without one.
 */
let app: FastifyInstance;

beforeEach(async () => {
  app = await buildTestApp(calculatorRoutes, {});
});

afterEach(async () => {
  await app.close();
});

const input = {
  topicId: "voltage-drop",
  published: true,
  locale: "hu",
  title: "Feszültségesés",
  description: "",
};

describe("calculator registry", () => {
  it("lets teachers and admins list, add, edit and order calculators", async () => {
    const routes = [
      { method: "GET", url: "/manage/calculators?locale=hu" },
      { method: "POST", url: "/calculators", payload: { ...input, id: "voltage-drop" } },
      { method: "PUT", url: "/calculators/voltage-drop", payload: input },
      { method: "PUT", url: "/calculators/order", payload: { ids: ["voltage-drop"] } },
    ] as const;

    for (const route of routes) {
      for (const { headers, status } of [
        { headers: {}, status: 401 },
        { headers: as("s", "student"), status: 403 },
      ]) {
        const response = await app.inject({ ...route, headers });
        expect(response.statusCode, `${route.method} ${route.url}`).toBe(status);
      }
    }
  });

  it("lets only admins remove a calculator from the list", async () => {
    for (const { headers, status } of [
      { headers: {}, status: 401 },
      { headers: as("s", "student"), status: 403 },
      { headers: as("t", "teacher"), status: 403 },
    ]) {
      const response = await app.inject({ method: "DELETE", url: "/calculators/voltage-drop", headers });
      expect(response.statusCode).toBe(status);
    }
  });

  it("answers 404 for a calculator that is not implemented in code", async () => {
    const response = await app.inject({ method: "GET", url: "/calculators/made-up?locale=hu" });
    expect(response.statusCode).toBe(404);
  });
});
