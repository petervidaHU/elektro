import { Card, List, Progress, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { compareTopics, DEFAULT_LOCALE, formatPercent, isLocale, type TopicInsight } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-insights";

/** How many of the hardest steps and top mistakes to list per topic. */
const TOP = 5;

/** Insights (plan J7): hardest steps and most common misconceptions per topic. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const data = await apiFetch<{ attempts: number; topics: TopicInsight[] }>(request, "/api/teacher/insights");
  return { attempts: data.attempts, topics: [...data.topics].sort((a, b) => compareTopics(a.topicId, b.topicId)) };
}

export default function TeacherInsights() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { attempts, topics } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("teacher.insights.title")}</Title>
      <TeacherTabs />
      <Text size="sm" c="dimmed">
        {t("teacher.insights.hint", { count: attempts })}
      </Text>

      {topics.length === 0 ? (
        <Text data-testid="insights-empty">{t("teacher.insights.empty")}</Text>
      ) : (
        topics.map((topic) => (
          <Card key={topic.topicId} withBorder padding="md" radius="md" data-topic-id={topic.topicId}>
            <Stack gap="sm">
              <Title order={3} size="h4">
                {t(`topic.${topic.topicId}`)}
              </Title>

              <Text fw={600} size="sm">
                {t("teacher.insights.hardestSteps")}
              </Text>
              {topic.steps.slice(0, TOP).map((step) => (
                <Stack key={`${step.templateId}/${step.stepId}`} gap={2}>
                  <Text size="sm">
                    {t(`calcStep.${step.stepId}`)}{" "}
                    <Text span c="dimmed">
                      ({t("teacher.insights.stepStats", { errors: step.withErrors, attempts: step.attempts })} ·{" "}
                      {formatPercent(step.errorRate * 100, locale, { maximumFractionDigits: 0 })})
                    </Text>
                  </Text>
                  <Progress value={step.errorRate * 100} color="orange" size="xs" aria-hidden="true" />
                </Stack>
              ))}

              <Text fw={600} size="sm">
                {t("teacher.insights.misconceptions")}
              </Text>
              {topic.misconceptions.length === 0 ? (
                <Text size="sm" c="dimmed">
                  {t("practiceSummary.noMistakes")}
                </Text>
              ) : (
                <List spacing={4}>
                  {topic.misconceptions.slice(0, TOP).map((item) => (
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
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}
