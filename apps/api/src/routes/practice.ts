import { randomInt } from "node:crypto";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  buildSessionView,
  buildTask,
  buildTaskView,
  ERROR_CODES,
  hasAtLeastRole,
  hasPractice,
  initialSteps,
  localeSchema,
  planSession,
  practiceAnswerSchema,
  practiceStepSchema,
  revealSolution,
  startPracticeSessionSchema,
  submitAnswer,
  summarizeSession,
  takeHint,
  taskOutcome,
  topicIdSchema,
  type AttemptError,
  type Locale,
  type StepState,
  type Task,
} from "@elektro/shared";
import { forbidden, HttpError, notFound, parseBody } from "../lib/http-error.js";
import type { PracticeRepository, ProgressService, StoredSession } from "../practice/repository.js";

export interface PracticeRouteOptions extends Record<string, unknown> {
  repo: PracticeRepository;
  progress: ProgressService;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const idParamsSchema = z.object({ id: z.string() });
const localeQuerySchema = z.object({ locale: localeSchema.default("hu") });
const sessionQuerySchema = localeQuerySchema.extend({
  /** A finished (or the current) task, e.g. for the recap after its last step. */
  task: z.coerce.number().int().min(0).max(100).optional(),
});
const activeQuerySchema = localeQuerySchema.extend({ topicId: topicIdSchema });

const ATTEMPT_ERROR_STATUS: Record<AttemptError, number> = {
  PRACTICE_STEP_LOCKED: 409,
  PRACTICE_STEP_DONE: 409,
  PRACTICE_SOLUTION_LOCKED: 409,
  PRACTICE_NO_MORE_HINTS: 409,
  VALIDATION_FAILED: 400,
};

/**
 * Practice sessions (docs/DEVELOPMENT_PLAN.md §2.5, K4).
 *
 * Every task is rebuilt from its template and seed, and every answer is
 * checked here - the client sends numbers, never verdicts. A student works on
 * their own sessions only; teachers may read anyone's (plan decision: teacher
 * visibility) but never answer in them.
 */
export const practiceRoutes: FastifyPluginAsync<PracticeRouteOptions> = async (app, { repo, progress }) => {
  async function loadSession(
    request: FastifyRequest,
    mode: "read" | "write",
  ): Promise<StoredSession> {
    const user = app.requireUser(request);
    const { id } = parseBody(idParamsSchema, request.params);
    const session = UUID.test(id) ? await repo.findSession(id) : null;

    if (!session) {
      throw notFound();
    }
    if (session.userId !== user.id) {
      // Other students must not learn the session exists.
      if (!hasAtLeastRole(user.role, "teacher")) throw notFound();
      if (mode === "write") throw forbidden();
    }
    if (mode === "write" && session.status !== "active") {
      throw new HttpError(409, ERROR_CODES.PRACTICE_SESSION_CLOSED);
    }
    return session;
  }

  async function view(session: StoredSession, locale: Locale) {
    return buildSessionView(session, await repo.listAttempts(session.id), locale);
  }

  /** Runs one step transition on the current task and persists it. */
  async function stepAction<Input extends { taskIndex: number; stepId: string; locale: Locale }, T extends object>(
    request: FastifyRequest,
    schema: z.ZodType<Input>,
    transition: (task: Task, steps: StepState[], input: Input) =>
      | ({ ok: true; steps: StepState[] } & T)
      | { ok: false; error: AttemptError },
  ) {
    // Who may touch the session is checked before the body is validated.
    const session = await loadSession(request, "write");
    const input = parseBody(schema, request.body);
    const attempts = await repo.listAttempts(session.id);
    const { currentTaskIndex } = buildSessionView(session, attempts, input.locale);

    if (input.taskIndex !== currentTaskIndex) {
      const done = currentTaskIndex === -1 || input.taskIndex < currentTaskIndex;
      throw new HttpError(409, done ? ERROR_CODES.PRACTICE_STEP_DONE : ERROR_CODES.PRACTICE_STEP_LOCKED);
    }

    const planned = session.tasks[input.taskIndex]!;
    const task = buildTask(planned.templateId, planned.seed);
    const steps =
      attempts.find((attempt) => attempt.taskIndex === input.taskIndex)?.steps ??
      initialSteps(task.template);

    const result = transition(task, steps, input);
    if (!result.ok) {
      throw new HttpError(ATTEMPT_ERROR_STATUS[result.error], result.error);
    }

    const outcome = taskOutcome(result.steps, task.template.steps.length);
    await repo.saveAttempt(session, input.taskIndex, result.steps, outcome);
    if (outcome !== "in_progress") {
      await progress.recompute(session.userId, session.topicId);
    }

    const { ok: _ok, steps: _steps, ...extra } = result;
    return { ...extra, session: await view(session, input.locale) };
  }

  app.post("/practice/sessions", async (request, reply) => {
    const user = app.requireUser(request);
    const input = parseBody(startPracticeSessionSchema, request.body);
    const { locale } = parseBody(localeQuerySchema, request.query);

    if (!hasPractice(input.topicId)) {
      throw new HttpError(409, ERROR_CODES.PRACTICE_NOT_AVAILABLE);
    }

    const session = await repo.createSession({
      userId: user.id,
      topicId: input.topicId,
      tasks: planSession(input.topicId, input.taskCount, () => randomInt(0, 2 ** 32 - 1)),
      masteryAtStart: await progress.current(user.id, input.topicId),
    });

    return reply.code(201).send({ session: await view(session, locale) });
  });

  /** The session to resume, if the student left one unfinished. */
  app.get("/practice/sessions/active", async (request) => {
    const user = app.requireUser(request);
    const { topicId, locale } = parseBody(activeQuerySchema, request.query);
    const session = await repo.findActiveSession(user.id, topicId);
    return { session: session ? await view(session, locale) : null };
  });

  app.get("/practice/sessions/:id", async (request, reply) => {
    const session = await loadSession(request, "read");
    const { locale, task } = parseBody(sessionQuerySchema, request.query);
    const attempts = await repo.listAttempts(session.id);
    const sessionView = buildSessionView(session, attempts, locale);
    reply.header("cache-control", "no-store");

    if (task === undefined) {
      return { session: sessionView };
    }
    const reachable =
      task < session.tasks.length &&
      (sessionView.currentTaskIndex === -1 || task <= sessionView.currentTaskIndex);
    if (!reachable) {
      throw new HttpError(409, ERROR_CODES.PRACTICE_STEP_LOCKED);
    }
    return {
      session: sessionView,
      task: buildTaskView(
        session.tasks[task]!,
        task,
        attempts.find((attempt) => attempt.taskIndex === task),
        locale,
      ),
    };
  });

  app.post("/practice/sessions/:id/answer", async (request) =>
    stepAction(request, practiceAnswerSchema, (task, steps, input) =>
      submitAnswer(task, steps, input.stepId, input.answer),
    ),
  );

  app.post("/practice/sessions/:id/hint", async (request) =>
    stepAction(request, practiceStepSchema, (task, steps, input) =>
      takeHint(task, steps, input.stepId),
    ),
  );

  app.post("/practice/sessions/:id/solution", async (request) =>
    stepAction(request, practiceStepSchema, (task, steps, input) =>
      revealSolution(task, steps, input.stepId),
    ),
  );

  app.post("/practice/sessions/:id/finish", async (request) => {
    const session = await loadSession(request, "write");
    const attempts = await repo.listAttempts(session.id);

    if (buildSessionView(session, attempts, "hu").currentTaskIndex !== -1) {
      throw new HttpError(409, ERROR_CODES.PRACTICE_NOT_COMPLETE);
    }

    await repo.finishSession(session.id);
    const masteryAfter = await progress.recompute(session.userId, session.topicId);
    return { summary: summarizeSession({ ...session, status: "finished" }, attempts, masteryAfter) };
  });

  app.get("/practice/sessions/:id/summary", async (request) => {
    const session = await loadSession(request, "read");
    const masteryAfter = await progress.current(session.userId, session.topicId);
    return { summary: summarizeSession(session, await repo.listAttempts(session.id), masteryAfter) };
  });
};
