import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, MODULES, topicsByModule, type ContentStatus, type TopicId } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-intros";

interface IntroState {
  topicId: TopicId;
  latest: { version: number; status: ContentStatus };
  liveVersion: number | null;
}

/** Topic intros: every topic by module with the state of its intro. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { intros } = await apiFetch<{ intros: IntroState[] }>(request, `/api/manage/intros?locale=${locale}`);
  return { states: Object.fromEntries(intros.map((item) => [item.topicId, item])) as Partial<Record<TopicId, IntroState>> };
}

export default function TeacherIntros() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { states } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("intros.title")}</Title>
      <TeacherTabs />
      <Text size="sm" c="dimmed">{t("intros.hint")}</Text>
      {MODULES.map((module) => (
        <Stack key={module} gap="xs" component="section">
          <Title order={3} size="h5">{t(`module.${module}`)}</Title>
          {topicsByModule(module).map((topic) => {
            const state = states[topic.id];
            return (
              <Card key={topic.id} component={Link} to={localePath(locale, `teacher/intros/${topic.id}`)} withBorder padding="sm" radius="md" data-topic-id={topic.id}>
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={500}>{t(`topic.${topic.id}`)}</Text>
                  {state ? (
                    <Badge variant="light" color={state.latest.status === "approved" ? "green" : "yellow"}>
                      {t(`lessons.status.${state.latest.status}`)}
                    </Badge>
                  ) : (
                    <Badge variant="light" color="gray">{t("intros.none")}</Badge>
                  )}
                </Group>
              </Card>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}
