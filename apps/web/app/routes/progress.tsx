import { Button, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { compareTopics, DEFAULT_LOCALE, formatPercent, getTopic, isLocale } from "@elektro/shared";
import { MasteryBadge } from "../components/topic/topic-badges";
import { localePath } from "../i18n/locale";
import { getProgress } from "../lib/progress";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/progress";

/** My progress (plan J6, U8 basic): every topic with activity, in syllabus order. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  const rows = await getProgress(request, true);
  return {
    topics: rows
      .filter((row) => row.masteryLevel !== "none")
      .sort((a, b) => compareTopics(a.topicId, b.topicId)),
  };
}

export default function ProgressPage() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { topics } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg" maw={720}>
      <Title order={2}>{t("progressPage.title")}</Title>

      {topics.length === 0 ? (
        <Stack gap="sm" align="flex-start">
          <Text>{t("progressPage.empty")}</Text>
          <Button component={Link} to={localePath(locale, "syllabus")}>
            {t("progressPage.toSyllabus")}
          </Button>
        </Stack>
      ) : (
        topics.map((row) => (
          <Card
            key={row.topicId}
            component={Link}
            to={localePath(locale, `topics/${row.topicId}`)}
            withBorder
            padding="md"
            radius="md"
            data-topic-id={row.topicId}
          >
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    {t(`module.${getTopic(row.topicId).module}`)}
                  </Text>
                  <Text fw={600}>{t(`topic.${row.topicId}`)}</Text>
                </Stack>
                <MasteryBadge level={row.masteryLevel} />
              </Group>
              {row.lessonsTotal > 0 && (
                <Stack gap={2}>
                  <Text size="sm">
                    {t("progressPage.lessons", { done: row.lessonsCompleted, total: row.lessonsTotal })}
                  </Text>
                  <Progress value={(row.lessonsCompleted / row.lessonsTotal) * 100} size="xs" aria-hidden="true" />
                </Stack>
              )}
              {row.tasksCompleted > 0 && (
                <Text size="sm">
                  {t("progressPage.tasks", { count: row.tasksCompleted })}
                  {row.unaidedRate !== null &&
                    ` · ${t("progressPage.unaided", { rate: formatPercent(row.unaidedRate * 100, locale, { maximumFractionDigits: 0 }) })}`}
                </Text>
              )}
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}
