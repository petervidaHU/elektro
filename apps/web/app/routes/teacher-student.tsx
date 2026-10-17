import { Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { compareTopics, DEFAULT_LOCALE, isLocale, type HistoryEntry } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { HistoryFeed } from "../components/history/history-feed";
import { TopicProgressList, type ProgressRowView } from "../components/progress/topic-progress-list";
import { ApiError, apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-student";

/**
 * Student detail (plan J7): the same progress cards and history feed as the
 * student's own pages, read-only, each practice entry opening its replay.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const userId = encodeURIComponent(String(params.userId));
  try {
    const [detail, history] = await Promise.all([
      apiFetch<{ student: { id: string; name: string; email: string }; topics: ProgressRowView[] }>(
        request,
        `/api/teacher/students/${userId}`,
      ),
      apiFetch<{ entries: HistoryEntry[] }>(request, `/api/teacher/students/${userId}/history?locale=${locale}`),
    ]);
    return {
      student: detail.student,
      topics: detail.topics
        .filter((row) => row.masteryLevel !== "none")
        .sort((a, b) => compareTopics(a.topicId, b.topicId)),
      entries: history.entries,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const name = (data as { student?: { name: string } } | undefined)?.student?.name;
    return [
      { labelKey: "teacher.students.title", path: "teacher/students" },
      name ? { label: name } : { labelKey: "teacher.students.detail" },
    ];
  },
};

export default function TeacherStudent() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { student, topics, entries } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg" maw={720}>
      <Stack gap={2}>
        <Title order={2}>{student.name}</Title>
        <Text c="dimmed">{student.email}</Text>
      </Stack>

      <Title order={3} size="h4">
        {t("progressPage.title")}
      </Title>
      {topics.length === 0 ? (
        <Text>{t("progressPage.empty")}</Text>
      ) : (
        <TopicProgressList rows={topics} locale={locale} linkTopics={false} />
      )}

      <Title order={3} size="h4">
        {t("history.title")}
      </Title>
      <HistoryFeed entries={entries} locale={locale} />
    </Stack>
  );
}
