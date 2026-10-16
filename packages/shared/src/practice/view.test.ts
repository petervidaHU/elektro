import { describe, expect, it } from "vitest";
import { initialSteps, priorValues, revealSolution, submitAnswer, takeHint } from "./attempt.js";
import { buildTask, expectedFor } from "./checker.js";
import { planSession } from "./session.js";
import type { StepState } from "./types.js";
import { buildSessionView, summarizeSession, type AttemptRecord, type SessionRecord } from "./view.js";

let seed = 100;
const tasks = planSession("voltage-drop", 3, () => ++seed);
const session: SessionRecord = {
  id: "s1",
  topicId: "voltage-drop",
  taskCount: 3,
  status: "active",
  tasks,
  masteryAtStart: "none",
};

/** Solves a task perfectly, optionally with a hint on the first step. */
function solved(index: number, options: { hint?: boolean; reveal?: boolean } = {}): AttemptRecord {
  const planned = tasks[index]!;
  const task = buildTask(planned.templateId, planned.seed);
  let steps: StepState[] = initialSteps(task.template);
  task.template.steps.forEach((spec, stepIndex) => {
    if (stepIndex === 0 && options.hint) {
      const hinted = takeHint(task, steps, spec.id);
      if (hinted.ok) steps = hinted.steps;
    }
    if (stepIndex === 0 && options.reveal) {
      for (const wrong of [-1, -2]) {
        // Used on the difficulty-3 task, whose first step is numeric.
        const result = submitAnswer(task, steps, spec.id, wrong);
        if (result.ok) steps = result.steps;
      }
      const revealed = revealSolution(task, steps, spec.id);
      if (revealed.ok) steps = revealed.steps;
      return;
    }
    const result = submitAnswer(task, steps, spec.id, expectedFor(task, stepIndex, priorValues(steps)));
    if (result.ok) steps = result.steps;
  });
  return { taskIndex: index, steps };
}

describe("buildSessionView", () => {
  it("shows the first unfinished task as current, with its givens and steps", () => {
    const view = buildSessionView(session, [solved(0)], "hu");

    expect(view.currentTaskIndex).toBe(1);
    expect(view.tasks.map((task) => task.outcome)).toEqual(["unaided", "in_progress", "in_progress"]);
    expect(view.current?.index).toBe(1);
    expect(view.current?.givens.length).toBeGreaterThan(0);
    expect(view.current?.steps[0]?.locked).toBe(false);
    expect(view.current?.steps[1]?.locked).toBe(true);
    expect(view.current?.steps[0]?.tolerance).toBeDefined();
  });

  it("includes the hints taken so far and a revealed solution", () => {
    const view = buildSessionView(session, [solved(0, { hint: true })], "hu");
    // Task 0 is done; look at it through the task list outcome.
    expect(view.tasks[0]?.outcome).toBe("with_help");

    const planned = tasks[1]!;
    const task = buildTask(planned.templateId, planned.seed);
    const hinted = takeHint(task, initialSteps(task.template), task.template.steps[0]!.id);
    if (!hinted.ok) throw new Error(hinted.error);
    const current = buildSessionView(session, [solved(0), { taskIndex: 1, steps: hinted.steps }], "hu").current!;
    expect(current.steps[0]?.hints).toEqual([{ type: "text", stepId: task.template.steps[0]!.id }]);
    expect(current.steps[0]?.solution).toBeNull();
  });

  it("has no current task when all are done", () => {
    const view = buildSessionView(session, [solved(0), solved(1), solved(2)], "hu");
    expect(view.currentTaskIndex).toBe(-1);
    expect(view.current).toBeNull();
  });
});

describe("summarizeSession", () => {
  it("counts outcomes and collects the misconceptions seen", () => {
    // Task 0 solved unaided, but its first answer was a known mistake.
    const first = solved(0);
    const withMistake: AttemptRecord = {
      ...first,
      steps: first.steps.map((step, i) =>
        i === 0 ? { ...step, misconceptions: ["resistance-inverted", null] } : step,
      ),
    };

    const summary = summarizeSession(
      { ...session, status: "finished" },
      [withMistake, solved(1, { hint: true }), solved(2, { reveal: true })],
      "practising",
    );

    expect(summary.unaided).toBe(1);
    expect(summary.withHelp).toBe(1);
    expect(summary.solutionShown).toBe(1);
    expect(summary.misconceptions).toEqual([{ id: "resistance-inverted", count: 1 }]);
    expect(summary.masteryBefore).toBe("none");
    expect(summary.masteryAfter).toBe("practising");
    expect(summary.tasks).toHaveLength(3);
  });
});
