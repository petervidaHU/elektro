import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  Code,
  Group,
  Progress,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import {
  DEFAULT_LOCALE,
  ERROR_CODES,
  FORMULAS,
  isLocale,
  parseLocaleNumber,
  type ErrorCode,
  type Hint,
  type Locale,
  type SessionSummary,
  type SessionView,
  type StepView,
  type TaskView,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { NumericKeypad } from "../components/numeric-keypad/numeric-keypad";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { formatStepValue, formatTolerance, scenarioValues } from "../lib/practice-format";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/practice-session";

/**
 * The practice task screen (plan J3). Every verdict, hint and solution comes
 * from the API; this page only collects numbers and choices - touch only, with
 * the on-screen keypad.
 *
 * `?task=N` shows task N; after the last step of a task the page stays on it
 * (recap) until the student moves on.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  const url = new URL(request.url);
  const requested = url.searchParams.get("task");
  const query = new URLSearchParams({ locale });
  if (requested !== null) query.set("task", requested);

  try {
    const data = await apiFetch<{ session: SessionView; task?: TaskView }>(
      request,
      `/api/practice/sessions/${encodeURIComponent(String(params.sessionId))}?${query.toString()}`,
    );
    const task = data.task ?? data.session.current;
    if (!task) {
      // Every task is done and none was asked for: show the last one's recap.
      throw redirect(`?task=${data.session.taskCount - 1}`);
    }
    return { session: data.session, task };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    if (error instanceof ApiError && error.status === 409) {
      throw redirect(url.pathname);
    }
    throw error;
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const base = `/api/practice/sessions/${encodeURIComponent(String(params.sessionId))}`;
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const taskIndex = Number(form.get("taskIndex"));
  const stepId = String(form.get("stepId") ?? "");
  const post = <T,>(path: string, body: object) =>
    apiFetch<T>(request, `${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  try {
    if (intent === "finish") {
      await post<{ summary: SessionSummary }>("/finish", {});
      return redirect(localePath(locale, `practice/s/${String(params.sessionId)}/summary`));
    }

    let session: SessionView;
    if (intent === "answer") {
      const answer = Number(form.get("answer"));
      if (!Number.isFinite(answer)) return { errorCode: ERROR_CODES.VALIDATION_FAILED as ErrorCode };
      ({ session } = await post<{ session: SessionView }>("/answer", { taskIndex, stepId, answer, locale }));
    } else if (intent === "hint" || intent === "solution") {
      ({ session } = await post<{ session: SessionView }>(`/${intent}`, { taskIndex, stepId, locale }));
    } else {
      return { errorCode: ERROR_CODES.VALIDATION_FAILED as ErrorCode };
    }

    // The task was just completed: stay on it for the recap.
    if (session.currentTaskIndex !== taskIndex) {
      return redirect(`?task=${taskIndex}`);
    }
    return null;
  } catch (error) {
    if (error instanceof ApiError) return { errorCode: error.body.code as ErrorCode };
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const topicId = (data as { session?: SessionView } | undefined)?.session?.topicId ?? "";
    return [
      { labelKey: `topic.${topicId}`, path: `topics/${topicId}` },
      { labelKey: "topicHub.practice" },
    ];
  },
};

export default function PracticeSession() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { session, task } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const done = task.outcome !== "in_progress";
  const allDone = session.currentTaskIndex === -1;
  const finished = session.tasks.filter((item) => item.outcome !== "in_progress").length;

  return (
    <Stack
      gap="md"
      maw={640}
      data-template-id={task.templateId}
      data-seed={task.seed}
      data-task-index={task.index}
    >
      <Stack gap={6}>
        <Group justify="space-between">
          <Title order={2}>{t("practice.task.title", { n: task.index + 1, total: session.taskCount })}</Title>
          <Badge variant="light">
            {t("practice.task.difficulty", { level: t(`practice.difficulty.${task.difficulty}`) })}
          </Badge>
        </Group>
        <Progress value={(finished / session.taskCount) * 100} size="sm" aria-hidden="true" />
      </Stack>

      <Text style={{ lineHeight: 1.6 }}>
        {t(`practiceScenario.${task.scenarioKey}`, scenarioValues(task.givens, task.params, locale, t))}
      </Text>

      <Card withBorder padding="sm" radius="md">
        <Text fw={600} size="sm" mb={4}>
          {t("practice.task.given")}
        </Text>
        <Table>
          <Table.Tbody>
            {task.givens.map((given) => (
              <Table.Tr key={given.id}>
                <Table.Td>{t(`given.${given.id}`)}</Table.Td>
                <Table.Td ta="right" fw={600} style={{ whiteSpace: "nowrap" }}>
                  {formatStepValue(given.value, given.unit, locale, t)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {session.topicId === "voltage-drop" && (
        <Alert variant="light" color="gray">
          {t("practice.resistivityNote")}
        </Alert>
      )}

      {actionData && "errorCode" in actionData && (
        <Alert color="red" variant="light" role="alert">
          {t(`error.${actionData.errorCode}`)}
        </Alert>
      )}

      <Stack gap="sm" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {task.steps.map((step) => (
          <StepCard key={step.id} step={step} taskIndex={task.index} locale={locale} />
        ))}
      </Stack>

      {done && (
        <Card withBorder padding="md" radius="md">
          <Stack gap="sm">
            <Text fw={600} c="green">
              ✓ {t("practice.task.done")}
            </Text>
            {allDone ? (
              <Form method="post">
                <input type="hidden" name="intent" value="finish" />
                <Button type="submit" fullWidth>
                  {t("practice.task.finish")}
                </Button>
              </Form>
            ) : (
              <Button component={Link} to={`?task=${session.currentTaskIndex}`}>
                {t("practice.task.next")}
              </Button>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

function StepCard({ step, taskIndex, locale }: { step: StepView; taskIndex: number; locale: Locale }) {
  const { t } = useTranslation();
  const resolved = step.state.accepted !== null;
  const status = step.locked ? "locked" : resolved ? "done" : "active";
  const label = t(`calcStep.${step.id}`);

  return (
    <Card
      component="li"
      withBorder
      padding="md"
      radius="md"
      data-step-id={step.id}
      data-step-state={status}
      style={step.locked ? { opacity: 0.55 } : undefined}
      aria-label={label}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600}>{label}</Text>
          {resolved && (
            <Text fw={700} c={step.state.solutionShown ? "orange" : "green"} style={{ whiteSpace: "nowrap" }}>
              {step.state.solutionShown ? "↺" : "✓"} {formatAnswer(step, step.state.accepted!, locale, t)}
            </Text>
          )}
        </Group>

        {step.locked && (
          <Text size="sm" c="dimmed">
            {t("practice.step.locked")}
          </Text>
        )}

        {status === "active" && (
          // Remounted after every answer, so the keypad starts empty again.
          <ActiveStep key={step.state.answers.length} step={step} taskIndex={taskIndex} locale={locale} />
        )}

        {status === "done" && step.state.solutionShown && (
          <Text size="sm" c="orange">
            {t("practice.step.solutionShown", { value: formatAnswer(step, step.state.accepted!, locale, t) })}
          </Text>
        )}

        {step.hints.length > 0 && <Hints hints={step.hints} />}
      </Stack>
    </Card>
  );
}

function formatAnswer(step: StepView, value: number, locale: Locale, t: ReturnType<typeof useTranslation>["t"]) {
  const option = step.options?.find((item) => item.value === value);
  return option?.label ?? formatStepValue(value, step.unit, locale, t);
}

function ActiveStep({ step, taskIndex, locale }: { step: StepView; taskIndex: number; locale: Locale }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const [text, setText] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const answer = step.options ? (choice === null ? null : Number(choice)) : parseLocaleNumber(text, locale);

  const tolerance = formatTolerance(step.tolerance, locale, t, step.kind);
  const lastVerdict = step.state.verdicts.at(-1);
  const lastMisconception = step.state.misconceptions.at(-1);
  const unit =
    step.unit === "dimensionless" ? undefined : step.unit === "percent" ? "%" : t(`unit.${step.unit}`);
  const common = (
    <>
      <input type="hidden" name="taskIndex" value={taskIndex} />
      <input type="hidden" name="stepId" value={step.id} />
    </>
  );

  return (
    <Stack gap="sm">
      {lastVerdict && (
        <Alert
          role="status"
          variant="light"
          color={lastVerdict === "correct" ? "green" : lastVerdict === "close" ? "yellow" : "red"}
          title={t(`practice.feedback.${lastVerdict}`)}
        >
          {lastMisconception ? t(`misconception.${lastMisconception}`) : null}
        </Alert>
      )}

      <Form method="post">
        {common}
        <input type="hidden" name="intent" value="answer" />
        <input type="hidden" name="answer" value={answer ?? ""} />
        <Stack gap="sm">
          {step.options ? (
            <OptionPicker step={step} value={choice} onChange={setChoice} locale={locale} />
          ) : (
            <NumericKeypad
              value={text}
              onChange={setText}
              locale={locale}
              label={t("practice.step.answer")}
              unit={unit}
              description={tolerance ? t("practice.step.tolerance", { value: tolerance }) : undefined}
            />
          )}
          {step.options && <Text size="sm" c="dimmed">{t("practice.step.toleranceExact")}</Text>}
          <Button type="submit" disabled={answer === null} loading={busy} fullWidth>
            {t("practice.step.check")}
          </Button>
        </Stack>
      </Form>

      <Group grow>
        <Form method="post">
          {common}
          <input type="hidden" name="intent" value="hint" />
          <Button type="submit" variant="light" fullWidth disabled={step.state.hintsUsed >= 3 || busy}>
            {t("practice.step.hint")} ({step.state.hintsUsed}/3)
          </Button>
        </Form>
        {step.canRevealSolution && (
          <Form method="post">
            {common}
            <input type="hidden" name="intent" value="solution" />
            <Button type="submit" variant="light" color="orange" fullWidth disabled={busy}>
              {t("practice.step.solution")}
            </Button>
          </Form>
        )}
      </Group>
    </Stack>
  );
}

function OptionPicker(props: {
  step: StepView;
  value: string | null;
  onChange: (value: string) => void;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const options = (props.step.options ?? []).map((option) => ({
    value: String(option.value),
    label: option.label ?? formatStepValue(option.value, props.step.unit, props.locale, t),
  }));

  // Few options: a segmented control; many (e.g. cross-sections): chips.
  return options.length <= 4 ? (
    <SegmentedControl
      value={props.value ?? ""}
      onChange={props.onChange}
      data={options}
      aria-label={t("practice.step.choose")}
    />
  ) : (
    <Chip.Group multiple={false} value={props.value ?? ""} onChange={props.onChange}>
      <Group gap="xs" role="radiogroup" aria-label={t("practice.step.choose")}>
        {options.map((option) => (
          <Chip key={option.value} value={option.value} size="md" styles={{ label: { minHeight: 44 } }}>
            {option.label}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
  );
}

function Hints({ hints }: { hints: Hint[] }) {
  const { t } = useTranslation();
  return (
    <Stack gap={6}>
      {hints.map((hint, index) => (
        <Alert key={index} variant="light" color="blue" p="xs">
          {hint.type === "text" && <Text size="sm">{t(`practiceHint.${hint.stepId}`)}</Text>}
          {hint.type === "formula" && (
            <Group gap="xs">
              <Text size="sm">{t("practice.hint.formula")}</Text>
              <Code>{FORMULAS[hint.formulaId].expression}</Code>
            </Group>
          )}
          {hint.type === "substitution" && (
            <Group gap="xs">
              <Text size="sm">{t("practice.hint.substitution")}</Text>
              <Code>{hint.text}</Code>
            </Group>
          )}
        </Alert>
      ))}
    </Stack>
  );
}
