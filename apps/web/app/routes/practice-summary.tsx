import { Badge, Button, Card, Group, List, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import {
  DEFAULT_LOCALE,
  isLocale,
  type SessionSummary,
  type TaskOutcome,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { MasteryBadge } from "../components/topic/topic-badges";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/practice-summary";

/** Session summary (plan J4): outcomes, mistakes to watch out for, mastery before/after. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  try {
    const { summary } = await apiFetch<{ summary: SessionSummary }>(
      request,
      `/api/practice/sessions/${encodeURIComponent(String(params.sessionId))}/summary`,
    );
    return { summary };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const topicId = (data as { summary?: SessionSummary } | undefined)?.summary?.topicId ?? "";
    return [
      { labelKey: `topic.${topicId}`, path: `topics/${topicId}` },
      { labelKey: "practiceSummary.title" },
    ];
  },
};

const OUTCOME: Record<TaskOutcome, { color: string; mark: string }> = {
  unaided: { color: "green", mark: "✓" },
  with_help: { color: "blue", mark: "✓" },
  solution_shown: { color: "orange", mark: "↺" },
  in_progress: { color: "gray", mark: "…" },
};

export default function PracticeSummary() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { summary } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg" maw={640}>
      <Stack gap={4}>
        <Title order={2}>{t("practiceSummary.title")}</Title>
        <Text size="xl" fw={700} data-testid="summary-headline">
          {t("practiceSummary.headline", { unaided: summary.unaided, total: summary.taskCount })}
        </Text>
      </Stack>

      <Group gap="xs">
        <Text size="sm">{t("practiceSummary.masteryLabel")}</Text>
        <MasteryBadge level={summary.masteryBefore} />
        <Text size="sm">→</Text>
        <MasteryBadge level={summary.masteryAfter} />
      </Group>

      <Stack gap="xs" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {summary.tasks.map((task) => (
          <Card key={task.index} component="li" withBorder padding="sm" radius="md">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600}>{t("practiceSummary.task", { n: task.index + 1 })}</Text>
              <Badge color={OUTCOME[task.outcome].color} variant="light">
                {OUTCOME[task.outcome].mark} {t(`practiceSummary.outcome.${task.outcome}`)}
              </Badge>
            </Group>
            {(task.wrongTries > 0 || task.hintsUsed > 0) && (
              <Text size="sm" c="dimmed" mt={4}>
                {[
                  task.wrongTries > 0 ? t("practiceSummary.wrongTries", { count: task.wrongTries }) : null,
                  task.hintsUsed > 0 ? t("practiceSummary.hints", { count: task.hintsUsed }) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            )}
          </Card>
        ))}
      </Stack>

      <Card withBorder padding="md" radius="md">
        <Text fw={600} mb="xs">
          {t("practiceSummary.watchOut")}
        </Text>
        {summary.misconceptions.length === 0 ? (
          <Text size="sm">{t("practiceSummary.noMistakes")}</Text>
        ) : (
          <List spacing="xs">
            {summary.misconceptions.map((item) => (
              <List.Item key={item.id}>
                <Text size="sm">
                  {t(`misconception.${item.id}`)}{" "}
                  <Text span c="dimmed">
                    ({t("practiceSummary.count", { count: item.count })})
                  </Text>
                </Text>
              </List.Item>
            ))}
          </List>
        )}
      </Card>

      <Stack gap="sm">
        <Button component={Link} to={localePath(locale, `practice/${summary.topicId}`)}>
          {t("practiceSummary.again")}
        </Button>
        <Button component={Link} to={localePath(locale, `topics/${summary.topicId}`)} variant="light">
          {t("practiceSummary.toTopic")}
        </Button>
        <Button component={Link} to={localePath(locale, "progress")} variant="default">
          {t("practiceSummary.toProgress")}
        </Button>
      </Stack>
    </Stack>
  );
}
