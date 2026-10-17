import { describe, expect, it } from "vitest";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";
import { learningRoutes } from "./learning.js";
import { monitoringRoutes } from "./monitoring.js";
import { reportRoutes } from "./reports.js";
import { reviewRoutes } from "./review.js";

/**
 * Who may call the M2 routes. The role checks run before any database access,
 * so they are tested without a database; one case per role.
 */
type Role = "student" | "teacher" | "admin";

const REPORT = { targetKind: "lesson", targetId: "x", category: "typo", locale: "hu" };

async function status(
  routes: FastifyPluginAsync,
  route: { method: "GET" | "POST"; url: string; payload?: object },
  headers: Record<string, string>,
) {
  const app: FastifyInstance = await buildTestApp(routes, {});
  try {
    return (await app.inject({ ...route, headers })).statusCode;
  } finally {
    await app.close();
  }
}

const guest = {};
const student = as("s", "student");

describe("own learning data needs a login", () => {
  it.each([
    ["GET /history", "GET", "/history?locale=hu"],
    ["GET /dashboard", "GET", "/dashboard?locale=hu"],
  ] as const)("%s", async (_name, method, url) => {
    expect(await status(learningRoutes, { method, url }, guest)).toBe(401);
  });
});

describe("teacher monitoring is for teachers and admins", () => {
  const routes = [
    "/teacher/students",
    "/teacher/students/some-student",
    "/teacher/students/some-student/history?locale=hu",
    "/teacher/insights",
  ];

  it.each(routes)("GET %s", async (url) => {
    const route = { method: "GET", url } as const;
    expect(await status(monitoringRoutes, route, guest)).toBe(401);
    expect(await status(monitoringRoutes, route, student)).toBe(403);
  });
});

describe("problem reports", () => {
  it("POST /reports needs a login (students may report)", async () => {
    const route = { method: "POST", url: "/reports", payload: REPORT } as const;
    expect(await status(reportRoutes, route, guest)).toBe(401);
  });

  it("GET /teacher/reports is for teachers and admins", async () => {
    const route = { method: "GET", url: "/teacher/reports" } as const;
    expect(await status(reportRoutes, route, guest)).toBe(401);
    expect(await status(reportRoutes, route, student)).toBe(403);
  });

  it("rejects an invalid report before touching the database", async () => {
    const route = { method: "POST", url: "/reports", payload: { ...REPORT, category: "spam" } } as const;
    expect(await status(reportRoutes, route, student)).toBe(400);
  });
});

describe("review queue and review screen", () => {
  it.each(["/manage/review?locale=hu", "/manage/lessons/some-lesson/review?locale=hu"])(
    "GET %s is for teachers and admins",
    async (url) => {
      const route = { method: "GET", url } as const;
      expect(await status(reviewRoutes, route, guest)).toBe(401);
      expect(await status(reviewRoutes, route, student)).toBe(403);
    },
  );
});

describe("roles are ranked", () => {
  it("lets a teacher and an admin past the guard (then fails on the missing database, not 401/403)", async () => {
    const roles: Role[] = ["teacher", "admin"];
    for (const role of roles) {
      const code = await status(reportRoutes, { method: "GET", url: "/teacher/reports" }, as("u", role));
      expect([401, 403]).not.toContain(code);
    }
  });
});
