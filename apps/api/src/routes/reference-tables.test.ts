import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";
import { referenceTableRoutes } from "./reference-tables.js";

/**
 * Who may touch reference tables. Role checks and body validation run before
 * any database access, so they are tested without a database.
 */
const BODY = {
  key: "example-table",
  title: "Példa",
  source: "Saját példa",
  columns: [{ id: "a", label: "A" }],
  rows: [[1]],
};

async function status(
  route: { method: "GET" | "POST" | "PUT" | "DELETE"; url: string; payload?: object },
  headers: Record<string, string>,
) {
  const app: FastifyInstance = await buildTestApp(referenceTableRoutes, {});
  try {
    return (await app.inject({ ...route, headers })).statusCode;
  } finally {
    await app.close();
  }
}

describe("staff-only reference table routes", () => {
  const routes = [
    { method: "GET", url: "/reference-tables" },
    { method: "POST", url: "/reference-tables", payload: BODY },
    { method: "PUT", url: "/reference-tables/example-table", payload: BODY },
    { method: "POST", url: "/reference-tables/example-table/verify", payload: { version: 1 } },
    { method: "GET", url: "/reference-tables/example-table/events" },
  ] as const;

  it.each(routes)("$method $url", async (route) => {
    expect(await status(route, {})).toBe(401);
    expect(await status(route, as("s", "student"))).toBe(403);
  });
});

describe("removing a table", () => {
  it("is admin-only", async () => {
    const route = { method: "DELETE", url: "/reference-tables/example-table" } as const;
    expect(await status(route, {})).toBe(401);
    expect(await status(route, as("s", "student"))).toBe(403);
    expect(await status(route, as("t", "teacher"))).toBe(403);
  });
});

describe("validation happens before the database", () => {
  it("rejects a table without a source and a verify without a version", async () => {
    expect(
      await status({ method: "POST", url: "/reference-tables", payload: { ...BODY, source: "" } }, as("t", "teacher")),
    ).toBe(400);
    expect(
      await status({ method: "POST", url: "/reference-tables/example-table/verify", payload: {} }, as("t", "teacher")),
    ).toBe(400);
  });
});
