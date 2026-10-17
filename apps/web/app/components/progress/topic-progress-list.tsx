import { Badge, Card, Group, Progress, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatPercent, getTopic, type Locale } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import type { TopicProgressRow } from "../../lib/progress";
import { MasteryBadge } from "../topic/topic-badges";

export type ProgressRowView = TopicProgressRow & { struggling?: boolean };

/**
 * Mastery per topic (plan J6). Shared by "my progress" and the teacher's
 * student detail, which shows the same cards read-only (`linkTopics` off,
 * struggling flag on).
 */
export function TopicProgressList({
  rows,
  locale,
  linkTopics = true,
}: {
  rows: ProgressRowView[];
  locale: Locale;
  linkTopics?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      {rows.map((row) => {
        const content = (
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  {t(`module.${getTopic(row.topicId).module}`)}
                </Text>
                <Text fw={600}>{t(`topic.${row.topicId}`)}</Text>
              </Stack>
              <Group gap={6} wrap="nowrap">
                {row.struggling && (
                  <Badge color="orange" variant="light">
                    {t("teacher.struggling")}
                  </Badge>
                )}
                <MasteryBadge level={row.masteryLevel} />
              </Group>
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
        );
        return linkTopics ? (
          <Card key={row.topicId} component={Link} to={localePath(locale, `topics/${row.topicId}`)} withBorder padding="md" radius="md" data-topic-id={row.topicId}>
            {content}
          </Card>
        ) : (
          <Card key={row.topicId} withBorder padding="md" radius="md" data-topic-id={row.topicId}>
            {content}
          </Card>
        );
      })}
    </>
  );
}
