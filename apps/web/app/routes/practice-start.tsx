import { useState } from "react";
import { Alert, Button, Card, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useLoaderData, useNavigation } from "react-router";
import {
  DEFAULT_LOCALE,
  DEFAULT_SESSION_LENGTH,
  hasPractice,
  isLocale,
  isTopicId,
  SESSION_LENGTHS,
  type SessionView,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/practice-start";

/** Practice start (plan J3.1): how many tasks, or resume the unfinished session. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  if (!isTopicId(params.topicId) || !hasPractice(params.topicId)) {
    throw new Response(null, { status: 404 });
  }
  const query = new URLSearchParams({ locale, topicId: params.topicId });
  const { session } = await apiFetch<{ session: SessionView | null }>(
    request,
    `/api/practice/sessions/active?${query.toString()}`,
  );
  return { topicId: params.topicId, active: session };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const taskCount = Number(form.get("taskCount"));
  const { session } = await apiFetch<{ session: SessionView }>(
    request,
    `/api/practice/sessions?locale=${locale}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topicId: params.topicId, taskCount }),
    },
  );
  return redirect(localePath(locale, `practice/s/${session.id}`));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const topicId = (data as { topicId?: string } | undefined)?.topicId ?? "";
    return [
      { labelKey: "nav.lessons", path: "syllabus" },
      { labelKey: `topic.${topicId}`, path: `topics/${topicId}` },
      { labelKey: "topicHub.practice" },
    ];
  },
};

export default function PracticeStart() {
  const { t } = useTranslation();
  const { topicId, active } = useLoaderData<typeof loader>();
  const { locale } = useLayoutData();
  const navigation = useNavigation();
  const [length, setLength] = useState<string>(String(DEFAULT_SESSION_LENGTH));
  const done = active ? active.tasks.filter((task) => task.outcome !== "in_progress").length : 0;

  return (
    <Stack gap="lg" maw={520}>
      <Title order={2}>{t("practice.start.title", { topic: t(`topic.${topicId}`) })}</Title>
      <Text>{t("practice.start.intro")}</Text>

      {active && (
        <Alert variant="light" color="blue">
          <Stack gap="sm">
            <Text size="sm">{t("practice.start.resumeHint", { done, total: active.taskCount })}</Text>
            <Button component={Link} to={localePath(locale, `practice/s/${active.id}`)}>
              {t("practice.start.resume")}
            </Button>
          </Stack>
        </Alert>
      )}

      <Card withBorder padding="md" radius="md">
        <Form method="post">
          <Stack gap="md">
            <div>
              <Text fw={500} mb={4} id="task-count-label">
                {t("practice.start.length")}
              </Text>
              <SegmentedControl
                value={length}
                onChange={setLength}
                aria-labelledby="task-count-label"
                data={SESSION_LENGTHS.map((count) => ({ value: String(count), label: String(count) }))}
              />
              <input type="hidden" name="taskCount" value={length} />
            </div>
            <Button type="submit" loading={navigation.state === "submitting"} fullWidth>
              {t("practice.start.start")}
            </Button>
          </Stack>
        </Form>
      </Card>
    </Stack>
  );
}
