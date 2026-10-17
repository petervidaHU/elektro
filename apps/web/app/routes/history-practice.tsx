import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, type SessionView, type TaskView } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { TaskReplay } from "../components/history/session-replay";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/history-practice";

/**
 * Read-only replay of a practice session (plan §3.3): the owner's own, or any
 * student's for a teacher. The API decides who may read it.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  try {
    return await apiFetch<{ session: SessionView; tasks: TaskView[] }>(
      request,
      `/api/practice/sessions/${encodeURIComponent(String(params.sessionId))}/replay?locale=${locale}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [{ labelKey: "history.title", path: "history" }, { labelKey: "replay.title" }],
};

export default function HistoryPractice() {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();
  const { session, tasks } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Stack gap={2}>
        <Title order={2}>{t("replay.title")}</Title>
        <Text c="dimmed">{t("topic." + session.topicId)}</Text>
      </Stack>

      {tasks.length === 0 ? (
        <Text>{t("replay.empty")}</Text>
      ) : (
        tasks.map((task) => <TaskReplay key={task.index} task={task} locale={locale} />)
      )}

      <Group>
        {session.status === "finished" && (
          <Button component={Link} to={localePath(locale, `practice/s/${session.id}/summary`)} variant="light">
            {t("replay.toSummary")}
          </Button>
        )}
        <Button component={Link} to={localePath(locale, user && user.role !== "student" ? "teacher/students" : "history")} variant="default">
          {t("replay.back")}
        </Button>
      </Group>
    </Stack>
  );
}
