import { useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Group, Select, SegmentedControl, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  compareTopics,
  filterHistory,
  groupByDay,
  type HistoryEntry,
  type HistoryKind,
  type Locale,
  type TopicId,
} from "@elektro/shared";
import { localePath } from "../../i18n/locale";

/** Days are grouped in the learners' time zone, not UTC. */
const TIME_ZONE: Record<Locale, string> = { hu: "Europe/Budapest" };

const ICON: Record<HistoryKind, string> = { lesson: "📖", practice: "✏️" };

/**
 * The activity feed (plan J6): reverse-chronological, grouped by day, typed,
 * filterable by type and topic, each entry linking to its page or replay.
 * Used by "my history" and, read-only, by the teacher's student detail.
 */
export function HistoryFeed({
  entries,
  locale,
  emptyAction,
  compact = false,
}: {
  entries: HistoryEntry[];
  locale: Locale;
  /** No filters: for the few latest entries on the dashboard. */
  compact?: boolean;
  /** Where the empty state leads (plan §3.5: every list has a next action). */
  emptyAction?: { to: string; label: string };
}) {
  const { t } = useTranslation();
  const [kind, setKind] = useState<"all" | HistoryKind>("all");
  const [topicId, setTopicId] = useState<string | null>(null);

  const topics = useMemo(
    () => [...new Set(entries.map((entry) => entry.topicId))].sort(compareTopics),
    [entries],
  );
  const days = useMemo(
    () =>
      groupByDay(
        filterHistory(entries, {
          ...(kind === "all" ? {} : { kind }),
          ...(topicId ? { topicId: topicId as TopicId } : {}),
        }),
        TIME_ZONE[locale],
      ),
    [entries, kind, topicId, locale],
  );

  if (entries.length === 0) {
    return (
      <Stack gap="sm" align="flex-start" data-testid="history-empty">
        <Text>{t("history.empty")}</Text>
        {emptyAction && (
          <Button component={Link} to={emptyAction.to}>
            {emptyAction.label}
          </Button>
        )}
      </Stack>
    );
  }

  const dayFormat = new Intl.DateTimeFormat(locale, {
    timeZone: TIME_ZONE[locale],
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const timeFormat = new Intl.DateTimeFormat(locale, {
    timeZone: TIME_ZONE[locale],
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Stack gap="md">
      {!compact && (
      <Stack gap="xs">
        <SegmentedControl
          fullWidth
          value={kind}
          onChange={(value) => setKind(value as "all" | HistoryKind)}
          aria-label={t("history.filterKind")}
          data={[
            { value: "all", label: t("history.kind.all") },
            { value: "lesson", label: t("history.kind.lesson") },
            { value: "practice", label: t("history.kind.practice") },
          ]}
        />
        <Select
          value={topicId}
          onChange={setTopicId}
          clearable
          placeholder={t("history.allTopics")}
          aria-label={t("history.filterTopic")}
          data={topics.map((id) => ({ value: id, label: t(`topic.${id}`) }))}
        />
      </Stack>
      )}

      {days.length === 0 && <Text c="dimmed">{t("history.noMatch")}</Text>}

      {days.map((day) => (
        <Stack key={day.day} gap="xs" component="section" aria-label={day.day}>
          <Text fw={600} size="sm" c="dimmed">
            {dayFormat.format(new Date(day.entries[0]!.at))}
          </Text>
          {day.entries.map((entry) => (
            <Card
              key={`${entry.kind}-${entry.kind === "practice" ? entry.sessionId : entry.slug}`}
              component={Link}
              to={
                entry.kind === "practice"
                  ? localePath(locale, `history/practice/${entry.sessionId}`)
                  : localePath(locale, `lessons/${entry.slug}`)
              }
              withBorder
              padding="sm"
              radius="md"
              data-entry-kind={entry.kind}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={2}>
                  <Text fw={600}>
                    <span aria-hidden="true">{ICON[entry.kind]} </span>
                    {entry.kind === "practice"
                      ? t("history.practice", { topic: t(`topic.${entry.topicId}`) })
                      : entry.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {entry.kind === "practice"
                      ? t("history.practiceResult", { unaided: entry.unaided, total: entry.taskCount })
                      : t("history.lessonTopic", { topic: t(`topic.${entry.topicId}`) })}
                  </Text>
                </Stack>
                <Stack gap={4} align="flex-end">
                  <Text size="xs" c="dimmed">
                    {timeFormat.format(new Date(entry.at))}
                  </Text>
                  <Badge variant="light" color={statusColor(entry)}>
                    {t(`history.status.${statusKey(entry)}`)}
                  </Badge>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function statusKey(entry: HistoryEntry): string {
  if (entry.kind === "lesson") return entry.completed ? "lessonDone" : "lessonOpened";
  return entry.status === "finished" ? "finished" : entry.status === "active" ? "active" : "abandoned";
}

function statusColor(entry: HistoryEntry): string {
  const key = statusKey(entry);
  return key === "lessonDone" || key === "finished" ? "green" : key === "abandoned" ? "gray" : "blue";
}

/** The privacy notice shown at the top of the history (plan J6). */
export function HistoryPrivacyNotice() {
  const { t } = useTranslation();
  return (
    <Alert variant="light" color="gray" data-testid="history-privacy">
      {t("privacy.notice")}
    </Alert>
  );
}
