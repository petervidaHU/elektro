import { Button, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { compareTopics, DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import { TopicProgressList } from "../components/progress/topic-progress-list";
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
      <Button component={Link} to={localePath(locale, "history")} variant="light" maw={320}>
        {t("progressPage.toHistory")}
      </Button>

      {topics.length === 0 ? (
        <Stack gap="sm" align="flex-start">
          <Text>{t("progressPage.empty")}</Text>
          <Button component={Link} to={localePath(locale, "syllabus")}>
            {t("progressPage.toSyllabus")}
          </Button>
        </Stack>
      ) : (
        <TopicProgressList rows={topics} locale={locale} />
      )}
    </Stack>
  );
}
