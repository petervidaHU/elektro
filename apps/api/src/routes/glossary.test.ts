import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { as, buildTestApp } from "../test/test-app.js";
import { glossaryRoutes } from "./glossary.js";
import { topicIntroRoutes } from "./topic-intros.js";

/** Who may write glossary terms and topic intros; roles and bodies are checked before the database. */
type Route = { method: "GET" | "POST" | "PUT" | "DELETE"; url: string; payload?: object };

async function status(routes: typeof glossaryRoutes, route: Route, headers: Record<string, string>) {
  const app: FastifyInstance = await buildTestApp(routes, {});
  try {
    return (await app.inject({ ...route, headers })).statusCode;
  } finally {
    await app.close();
  }
}

const TERM = { key: "voltage-drop", locale: "hu", term: "Feszültségesés", definition: "A vezeték ellenállásán eső feszültség." };
const TRANSLATION = { locale: "hu", term: "Feszültségesés", definition: "x" };
const REVIEW = { action: "approve", locale: "hu" };

describe("glossary", () => {
  const staffRoutes: Route[] = [
    { method: "GET", url: "/manage/glossary?locale=hu" },
    { method: "POST", url: "/glossary", payload: TERM },
    { method: "PUT", url: "/glossary/voltage-drop/translations", payload: TRANSLATION },
    { method: "POST", url: "/glossary/voltage-drop/review", payload: REVIEW },
    { method: "GET", url: "/manage/glossary/voltage-drop/review?locale=hu" },
  ];

  it.each(staffRoutes)("$method $url is for teachers and admins", async (route) => {
    expect(await status(glossaryRoutes, route, {})).toBe(401);
    expect(await status(glossaryRoutes, route, as("s", "student"))).toBe(403);
  });

  it("removing a term is admin-only", async () => {
    const route: Route = { method: "DELETE", url: "/glossary/voltage-drop" };
    expect(await status(glossaryRoutes, route, as("t", "teacher"))).toBe(403);
    expect(await status(glossaryRoutes, route, as("s", "student"))).toBe(403);
  });

  it("rejects an empty definition before the database", async () => {
    const route: Route = { method: "POST", url: "/glossary", payload: { ...TERM, definition: "" } };
    expect(await status(glossaryRoutes, route, as("t", "teacher"))).toBe(400);
  });
});

describe("topic intros", () => {
  const staffRoutes: Route[] = [
    { method: "GET", url: "/manage/intros?locale=hu" },
    { method: "PUT", url: "/topic-intros/voltage-drop", payload: { locale: "hu", text: "Röviden." } },
    { method: "POST", url: "/topic-intros/voltage-drop/review", payload: REVIEW },
    { method: "GET", url: "/manage/intros/voltage-drop/review?locale=hu" },
  ];

  it.each(staffRoutes)("$method $url is for teachers and admins", async (route) => {
    expect(await status(topicIntroRoutes, route, {})).toBe(401);
    expect(await status(topicIntroRoutes, route, as("s", "student"))).toBe(403);
  });

  it("removing an intro is admin-only", async () => {
    const route: Route = { method: "DELETE", url: "/topic-intros/voltage-drop" };
    expect(await status(topicIntroRoutes, route, as("t", "teacher"))).toBe(403);
  });

  it("rejects an unknown topic and empty text before the database", async () => {
    const bad: Route = { method: "PUT", url: "/topic-intros/not-a-topic", payload: { locale: "hu", text: "x" } };
    expect(await status(topicIntroRoutes, bad, as("t", "teacher"))).toBe(400);
    const empty: Route = { method: "PUT", url: "/topic-intros/voltage-drop", payload: { locale: "hu", text: "" } };
    expect(await status(topicIntroRoutes, empty, as("t", "teacher"))).toBe(400);
  });
});
