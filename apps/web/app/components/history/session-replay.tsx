import { Alert, Badge, Card, Code, Group, Stack, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  FORMULAS,
  type Hint,
  type Locale,
  type StepView,
  type TaskOutcome,
  type TaskView,
} from "@elektro/shared";
import { formatStepValue, scenarioValues } from "../../lib/practice-format";

const OUTCOME_COLOR: Record<TaskOutcome, string> = {
  unaided: "green",
  with_help: "blue",
  solution_shown: "orange",
  in_progress: "gray",
};

const VERDICT_MARK = { correct: "✓", close: "≈", incorrect: "✗" } as const;

function formatAnswer(step: StepView, value: number, locale: Locale, t: ReturnType<typeof useTranslation>["t"]) {
  return step.options?.find((option) => option.value === value)?.label ?? formatStepValue(value, step.unit, locale, t);
}

/**
 * Read-only replay of one task (plan §3.3 `/history/practice/:id`): the
 * scenario as the student saw it, then every step with each answer, its
 * verdict, the misconception it was traced to, the hints and the revealed
 * solution. The texts come from the task's own version via the API.
 */
export function TaskReplay({ task, locale }: { task: TaskView; locale: Locale }) {
  const { t } = useTranslation();

  return (
    <Card withBorder padding="md" radius="md" data-testid="replay-task" data-task-index={task.index}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700}>{t("replay.task", { n: task.index + 1 })}</Text>
          <Badge color={OUTCOME_COLOR[task.outcome]} variant="light">
            {t(`practiceSummary.outcome.${task.outcome}`)}
          </Badge>
        </Group>

        <Text style={{ lineHeight: 1.6 }}>
          {t(`practiceScenario.${task.scenarioKey}`, scenarioValues(task.givens, task.params, locale, t))}
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

        <Stack gap="xs" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {task.steps.map((step) => (
            <StepReplay key={step.id} step={step} locale={locale} />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

function StepReplay({ step, locale }: { step: StepView; locale: Locale }) {
  const { t } = useTranslation();
  const { state } = step;
  const reached = state.answers.length > 0 || state.hintsUsed > 0 || state.solutionShown;

  return (
    <Card component="li" withBorder padding="sm" radius="md" data-step-id={step.id} style={reached ? undefined : { opacity: 0.55 }}>
      <Stack gap={6}>
        <Text fw={600}>{t(`calcStep.${step.id}`)}</Text>

        {!reached && (
          <Text size="sm" c="dimmed">
            {t("replay.notReached")}
          </Text>
        )}

        {state.answers.map((answer, index) => {
          const verdict = state.verdicts[index]!;
          const misconception = state.misconceptions[index];
          return (
            <Stack key={index} gap={2}>
              <Text size="sm" data-verdict={verdict}>
                <Text span fw={700} c={verdict === "correct" ? "green" : verdict === "close" ? "yellow.8" : "red"}>
                  {VERDICT_MARK[verdict]}
                </Text>{" "}
                {t("replay.answer", { n: index + 1, value: formatAnswer(step, answer, locale, t) })}{" "}
                <Text span c="dimmed">
                  ({t(`replay.verdict.${verdict}`)})
                </Text>
              </Text>
              {misconception && (
                <Alert variant="light" color="orange" p="xs">
                  <Text size="sm">{t(`misconception.${misconception}`)}</Text>
                </Alert>
              )}
            </Stack>
          );
        })}

        {step.hints.length > 0 && <HintsReplay hints={step.hints} />}

        {state.solutionShown && state.accepted !== null && (
          <Text size="sm" c="orange">
            ↺ {t("practice.step.solutionShown", { value: formatAnswer(step, state.accepted, locale, t) })}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function HintsReplay({ hints }: { hints: Hint[] }) {
  const { t } = useTranslation();
  return (
    <Stack gap={4}>
      <Text size="xs" c="dimmed">
        {t("replay.hintsUsed", { count: hints.length })}
      </Text>
      {hints.map((hint, index) => (
        <Alert key={index} variant="light" color="blue" p="xs">
          {hint.type === "text" && <Text size="sm">{t(`practiceHint.${hint.stepId}`)}</Text>}
          {hint.type === "formula" && <Code>{FORMULAS[hint.formulaId].expression}</Code>}
          {hint.type === "substitution" && <Code>{hint.text}</Code>}
        </Alert>
      ))}
    </Stack>
  );
}
