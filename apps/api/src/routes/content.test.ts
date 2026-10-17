import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";
import { contentRoutes } from "./content.js";

/**
 * Authorization of the lesson routes. The role checks run before any database
 * access, so they are tested without one.
 */
let app: FastifyInstance;

beforeEach(async () => {
  app = await buildTestApp(contentRoutes, {});
});

afterEach(async () => {
  await app.close();
});

describe("DELETE /lessons/:slug", () => {
  it("is admin-only", async () => {
    const cases = [
      { headers: {}, status: 401 },
      { headers: as("s", "student"), status: 403 },
      { headers: as("t", "teacher"), status: 403 },
    ];
    for (const { headers, status } of cases) {
      const response = await app.inject({ method: "DELETE", url: "/lessons/any", headers });
      expect(response.statusCode).toBe(status);
    }
  });
});

describe("POST /lessons/:slug/progress", () => {
  it("needs a signed-in user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/lessons/any/progress",
      payload: { locale: "hu", event: "open" },
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("POST /lessons/:slug/review", () => {
  it("is for teachers and admins", async () => {
    for (const { headers, status } of [
      { headers: {}, status: 401 },
      { headers: as("s", "student"), status: 403 },
    ]) {
      const response = await app.inject({
        method: "POST",
        url: "/lessons/any/review",
        headers,
        payload: { action: "approve", locale: "hu" },
      });
      expect(response.statusCode).toBe(status);
    }
  });
});

describe("GET /lessons/:slug/reviews", () => {
  it("is for teachers and admins: the log holds reviewer names and emails", async () => {
    for (const { headers, status } of [
      { headers: {}, status: 401 },
      { headers: as("s", "student"), status: 403 },
    ]) {
      const response = await app.inject({
        method: "GET",
        url: "/lessons/any/reviews",
        headers,
      });
      expect(response.statusCode).toBe(status);
    }
  });
});

describe("GET /admin/lessons/:slug/reviews", () => {
  it("is admin-only: it reveals deleted reviewers' names and emails", async () => {
    for (const { headers, status } of [
      { headers: {}, status: 401 },
      { headers: as("s", "student"), status: 403 },
      { headers: as("t", "teacher"), status: 403 },
    ]) {
      const response = await app.inject({
        method: "GET",
        url: "/admin/lessons/any/reviews",
        headers,
      });
      expect(response.statusCode).toBe(status);
    }
  });
});

describe("content management of lessons", () => {
  const teacherRoutes = [
    { method: "GET", url: "/manage/lessons?locale=hu" },
    { method: "PATCH", url: "/lessons/any", payload: { topicId: "ohms-law" } },
    { method: "PUT", url: "/lessons/order", payload: { topicId: "ohms-law", slugs: ["a"] } },
  ] as const;

  it("lists, edits and orders lessons for teachers and admins only", async () => {
    for (const route of teacherRoutes) {
      for (const { headers, status } of [
        { headers: {}, status: 401 },
        { headers: as("s", "student"), status: 403 },
      ]) {
        const response = await app.inject({ ...route, headers });
        expect(response.statusCode, `${route.method} ${route.url}`).toBe(status);
      }
    }
  });

  it("archives and restores lessons for admins only", async () => {
    for (const url of ["/lessons/any/archive", "/lessons/any/restore"]) {
      for (const { headers, status } of [
        { headers: {}, status: 401 },
        { headers: as("s", "student"), status: 403 },
        { headers: as("t", "teacher"), status: 403 },
      ]) {
        const response = await app.inject({ method: "POST", url, headers });
        expect(response.statusCode, url).toBe(status);
      }
    }
  });
});
