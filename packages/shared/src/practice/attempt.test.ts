import { describe, expect, it } from "vitest";
import { buildTask, expectedFor } from "./checker.js";
import {
  currentStepIndex,
  initialSteps,
  priorValues,
  revealSolution,
  submitAnswer,
  takeHint,
} from "./attempt.js";

const task = buildTask("voltage-drop.single-phase-basic", 2024);
const [resistance, drop] = task.template.steps.map((_spec, index) => index);
const expected = (index: number, prior = {}) => expectedFor(task, index, prior);

describe("attempt state", () => {
  it("starts with every step open and the first one current", () => {
    const steps = initialSteps(task.template);
    expect(steps.map((step) => step.stepId)).toEqual([
      "conductor-resistance",
      "voltage-drop",
      "voltage-drop-percent",
    ]);
    expect(currentStepIndex(steps)).toBe(0);
  });

  it("records a wrong and then a right answer; the right one is accepted", () => {
    let steps = initialSteps(task.template);
    const wrong = submitAnswer(task, steps, "conductor-resistance", 999);
    expect(wrong.ok && wrong.result.verdict).toBe("incorrect");
    steps = wrong.ok ? wrong.steps : steps;

    const right = submitAnswer(task, steps, "conductor-resistance", expected(resistance!));
    expect(right.ok && right.result.verdict).toBe("correct");
    steps = right.ok ? right.steps : steps;

    expect(steps[0]).toMatchObject({ answers: [999, expected(resistance!)], verdicts: ["incorrect", "correct"] });
    expect(steps[0]!.accepted).toBe(expected(resistance!));
    expect(currentStepIndex(steps)).toBe(1);
  });

  it("accepts the student's own rounding and builds later steps on it", () => {
    const rounded = Number(expected(resistance!).toPrecision(2));
    const result = submitAnswer(task, initialSteps(task.template), "conductor-resistance", rounded);
    if (!result.ok) throw new Error(result.error);
    expect(priorValues(result.steps)).toEqual({ "conductor-resistance": rounded });
    // The next step is checked against the student's R, not the exact one.
    const next = submitAnswer(task, result.steps, "voltage-drop", expected(drop!, priorValues(result.steps)));
    expect(next.ok && next.result.verdict).toBe("correct");
  });

  it("refuses answers to a later step before the earlier ones", () => {
    expect(submitAnswer(task, initialSteps(task.template), "voltage-drop", 1)).toEqual({
      ok: false,
      error: "PRACTICE_STEP_LOCKED",
    });
  });

  it("refuses answers to a step already done", () => {
    const done = submitAnswer(task, initialSteps(task.template), "conductor-resistance", expected(resistance!));
    if (!done.ok) throw new Error(done.error);
    expect(submitAnswer(task, done.steps, "conductor-resistance", 1)).toEqual({
      ok: false,
      error: "PRACTICE_STEP_DONE",
    });
  });

  it("refuses a selection answer that is not one of the options", () => {
    const selection = buildTask("voltage-drop.phase-and-power-factor", 7);
    expect(submitAnswer(selection, initialSteps(selection.template), "phase-factor", 3)).toEqual({
      ok: false,
      error: "VALIDATION_FAILED",
    });
  });

  it("gives up to three hints, then refuses", () => {
    let steps = initialSteps(task.template);
    for (let level = 1; level <= 3; level++) {
      const hint = takeHint(task, steps, "conductor-resistance");
      if (!hint.ok) throw new Error(hint.error);
      steps = hint.steps;
      expect(steps[0]!.hintsUsed).toBe(level);
    }
    expect(takeHint(task, steps, "conductor-resistance")).toEqual({
      ok: false,
      error: "PRACTICE_NO_MORE_HINTS",
    });
  });

  it("reveals the solution only after two wrong tries, and accepts it", () => {
    let steps = initialSteps(task.template);
    expect(revealSolution(task, steps, "conductor-resistance")).toEqual({
      ok: false,
      error: "PRACTICE_SOLUTION_LOCKED",
    });
    for (const answer of [100, 200]) {
      const result = submitAnswer(task, steps, "conductor-resistance", answer);
      if (!result.ok) throw new Error(result.error);
      steps = result.steps;
    }
    const revealed = revealSolution(task, steps, "conductor-resistance");
    if (!revealed.ok) throw new Error(revealed.error);
    expect(revealed.steps[0]).toMatchObject({
      solutionShown: true,
      accepted: expected(resistance!),
    });
    expect(currentStepIndex(revealed.steps)).toBe(1);
  });

  it("does not count a 'close' answer as a wrong try towards the solution", () => {
    let steps = initialSteps(task.template);
    const close = expected(resistance!) * 1.04;
    for (let i = 0; i < 2; i++) {
      const result = submitAnswer(task, steps, "conductor-resistance", close);
      if (!result.ok) throw new Error(result.error);
      expect(result.result.verdict).toBe("close");
      steps = result.steps;
    }
    expect(revealSolution(task, steps, "conductor-resistance").ok).toBe(false);
  });

  it("reports no current step once every step is resolved", () => {
    let steps = initialSteps(task.template);
    task.template.steps.forEach((spec, index) => {
      const result = submitAnswer(task, steps, spec.id, expectedFor(task, index, priorValues(steps)));
      if (!result.ok) throw new Error(result.error);
      steps = result.steps;
    });
    expect(currentStepIndex(steps)).toBe(-1);
  });
});
