import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import {
  buildTask,
  expectedFor,
  priorValues,
  type SessionSummary,
  type SessionView,
  type StepState,
} from "@elektro/shared";
import { createFakeProgress, createMemoryPracticeRepository } from "../practice/memory-repository.js";
import { as, buildTestApp } from "../test/test-app.js";
import { practiceRoutes } from "./practice.js";

/**
 * Practice API (plan §2.5, K4): the server builds every task from its seed and
 * checks every answer - the client only sends numbers. Authorization: a
 * student works on their own sessions; teachers may read anyone's.
 */
let app: FastifyInstance;
let repo: ReturnType<typeof createMemoryPracticeRepository>;
let progress: ReturnType<typeof createFakeProgress>;

beforeEach(async () => {
  repo = createMemoryPracticeRepository();
  progress = createFakeProgress("mastered");
  app = await buildTestApp(practiceRoutes, { repo, progress });
});

afterEach(async () => {
  await app.close();
});

const anna = as("anna", "student");
const bela = as("bela", "student");
const teacher = as("tanar", "teacher");

async function start(headers = anna, body: object = { topicId: "voltage-drop" }): Promise<SessionView> {
  const response = await app.inject({ method: "POST", url: "/practice/sessions", headers, payload: body });
  expect(response.statusCode).toBe(201);
  return (response.json() as { session: SessionView }).session;
}

/** The right answer for the current step, worked out as a student would. */
function rightAnswer(view: SessionView): { stepId: string; answer: number } {
  const current = view.current!;
  const task = buildTask(current.templateId, current.seed);
  const stepIndex = current.steps.findIndex((step) => step.state.accepted === null);
  const states: StepState[] = current.steps.map((step) => step.state);
  return {
    stepId: current.steps[stepIndex]!.id,
    answer: expectedFor(task, stepIndex, priorValues(states.slice(0, stepIndex))),
  };
}

async function answer(view: SessionView, stepId: string, value: number, headers = anna) {
  return app.inject({
    method: "POST",
    url: `/practice/sessions/${view.id}/answer`,
    headers,
    payload: { taskIndex: view.currentTaskIndex, stepId, answer: value },
  });
}

/** Solves the whole session correctly, step by step, through the API. */
async function solveAll(view: SessionView): Promise<SessionView> {
  let current = view;
  while (current.currentTaskIndex !== -1) {
    const { stepId, answer: value } = rightAnswer(current);
    const response = await answer(current, stepId, value);
    expect(response.statusCode).toBe(200);
    current = (response.json() as { session: SessionView }).session;
  }
  return current;
}

describe("starting a session", () => {
  it("is for signed-in users only", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/practice/sessions",
      payload: { topicId: "voltage-drop" },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "UNAUTHENTICATED" });
  });

  it("plans 5 tasks by default, or 3 / 10 on request, with rising difficulty", async () => {
    expect((await start()).taskCount).toBe(5);
    expect((await start(anna, { topicId: "voltage-drop", taskCount: 3 })).tasks.map((t) => t.difficulty)).toEqual([1, 2, 3]);
    const invalid = await app.inject({
      method: "POST",
      url: "/practice/sessions",
      headers: anna,
      payload: { topicId: "voltage-drop", taskCount: 4 },
    });
    expect(invalid.statusCode).toBe(400);
  });

  it("refuses topics without practice tasks", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/practice/sessions",
      headers: anna,
      payload: { topicId: "measurement-report" },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ code: "PRACTICE_NOT_AVAILABLE" });
  });

  it("offers the active session for resuming, and abandons it when a new one starts", async () => {
    const first = await start();
    const active = await app.inject({
      method: "GET",
      url: "/practice/sessions/active?topicId=voltage-drop",
      headers: anna,
    });
    expect((active.json() as { session: SessionView }).session.id).toBe(first.id);

    const second = await start();
    const old = await app.inject({ method: "GET", url: `/practice/sessions/${first.id}`, headers: anna });
    expect((old.json() as { session: SessionView }).session.status).toBe("abandoned");
    expect(second.id).not.toBe(first.id);
  });
});

describe("answering", () => {
  it("checks the answer on the server and moves to the next step", async () => {
    const view = await start();
    const { stepId, answer: value } = rightAnswer(view);

    const response = await answer(view, stepId, value);
    expect(response.statusCode).toBe(200);
    const body = response.json() as { result: { verdict: string }; session: SessionView };
    expect(body.result.verdict).toBe("correct");
    expect(body.session.current!.steps[0]!.state.accepted).toBe(value);
    expect(body.session.current!.steps[1]!.locked).toBe(false);
  });

  it("answers a wrong value with 'incorrect' and keeps the step open", async () => {
    const view = await start();
    const { stepId } = rightAnswer(view);
    const body = (await answer(view, stepId, 123456)).json() as {
      result: { verdict: string };
      session: SessionView;
    };
    expect(body.result.verdict).toBe("incorrect");
    expect(body.session.current!.steps[0]!.state.accepted).toBeNull();
  });

  it("refuses a step that is not the current one", async () => {
    const view = await start();
    const later = view.current!.steps[1]!.id;
    const response = await answer(view, later, 1);
    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ code: "PRACTICE_STEP_LOCKED" });
  });

  it("refuses a task other than the current one", async () => {
    const view = await start();
    const response = await app.inject({
      method: "POST",
      url: `/practice/sessions/${view.id}/answer`,
      headers: anna,
      payload: { taskIndex: 2, stepId: "voltage-drop", answer: 1 },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ code: "PRACTICE_STEP_LOCKED" });
  });

  it("gives hints one level at a time and the solution after two wrong tries", async () => {
    const view = await start();
    const { stepId } = rightAnswer(view);
    const url = `/practice/sessions/${view.id}`;
    const step = { taskIndex: 0, stepId };

    const hint = await app.inject({ method: "POST", url: `${url}/hint`, headers: anna, payload: step });
    expect((hint.json() as { session: SessionView }).session.current!.steps[0]!.hints).toHaveLength(1);

    const locked = await app.inject({ method: "POST", url: `${url}/solution`, headers: anna, payload: step });
    expect(locked.statusCode).toBe(409);
    expect(locked.json()).toEqual({ code: "PRACTICE_SOLUTION_LOCKED" });

    await answer(view, stepId, 123456);
    await answer(view, stepId, 654321);
    const revealed = await app.inject({ method: "POST", url: `${url}/solution`, headers: anna, payload: step });
    expect(revealed.statusCode).toBe(200);
    const shown = (revealed.json() as { session: SessionView }).session.current!.steps[0]!;
    expect(shown.solution).not.toBeNull();
    expect(shown.state.solutionShown).toBe(true);
  });
});

describe("viewing a task", () => {
  it("returns a finished task for its recap, but no task beyond the current one", async () => {
    const view = await start(anna, { topicId: "voltage-drop", taskCount: 3 });
    let current = view;
    while (current.currentTaskIndex === 0) {
      const { stepId, answer: value } = rightAnswer(current);
      current = ((await answer(current, stepId, value)).json() as { session: SessionView }).session;
    }

    const recap = await app.inject({ method: "GET", url: `/practice/sessions/${view.id}?task=0`, headers: anna });
    expect(recap.statusCode).toBe(200);
    const task = (recap.json() as { task: { index: number; outcome: string } }).task;
    expect(task).toMatchObject({ index: 0, outcome: "unaided" });

    const ahead = await app.inject({ method: "GET", url: `/practice/sessions/${view.id}?task=2`, headers: anna });
    expect(ahead.statusCode).toBe(409);
    expect(ahead.json()).toEqual({ code: "PRACTICE_STEP_LOCKED" });
  });
});

describe("whose session", () => {
  it("hides a student's session from another student", async () => {
    const view = await start(anna);
    const read = await app.inject({ method: "GET", url: `/practice/sessions/${view.id}`, headers: bela });
    expect(read.statusCode).toBe(404);
    const { stepId, answer: value } = rightAnswer(view);
    expect((await answer(view, stepId, value, bela)).statusCode).toBe(404);
  });

  it("lets a teacher read any session but not answer in it", async () => {
    const view = await start(anna);
    const read = await app.inject({ method: "GET", url: `/practice/sessions/${view.id}`, headers: teacher });
    expect(read.statusCode).toBe(200);
    const { stepId, answer: value } = rightAnswer(view);
    expect((await answer(view, stepId, value, teacher)).statusCode).toBe(403);
  });

  it("answers 404 for an unknown or malformed session id", async () => {
    for (const id of ["00000000-0000-4000-8000-000000000000", "not-a-uuid"]) {
      const response = await app.inject({ method: "GET", url: `/practice/sessions/${id}`, headers: anna });
      expect(response.statusCode).toBe(404);
    }
  });
});

describe("finishing", () => {
  it("refuses to finish before every task is done", async () => {
    const view = await start();
    const response = await app.inject({
      method: "POST",
      url: `/practice/sessions/${view.id}/finish`,
      headers: anna,
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ code: "PRACTICE_NOT_COMPLETE" });
  });

  it("finishes a solved session, updates progress and summarises it", async () => {
    const view = await solveAll(await start(anna, { topicId: "voltage-drop", taskCount: 3 }));
    expect(view.currentTaskIndex).toBe(-1);
    // Progress is recomputed after every completed task.
    expect(progress.recomputed).toHaveLength(3);

    const finished = await app.inject({
      method: "POST",
      url: `/practice/sessions/${view.id}/finish`,
      headers: anna,
    });
    expect(finished.statusCode).toBe(200);
    const summary = (finished.json() as { summary: SessionSummary }).summary;
    expect(summary).toMatchObject({ status: "finished", unaided: 3, withHelp: 0, masteryAfter: "mastered" });

    const again = await answer({ ...view, currentTaskIndex: 0 }, "voltage-drop", 1);
    expect(again.statusCode).toBe(409);
    expect(again.json()).toEqual({ code: "PRACTICE_SESSION_CLOSED" });

    const read = await app.inject({
      method: "GET",
      url: `/practice/sessions/${view.id}/summary`,
      headers: teacher,
    });
    expect((read.json() as { summary: SessionSummary }).summary.unaided).toBe(3);
  });
});
