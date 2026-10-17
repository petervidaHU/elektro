import { Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, type HistoryEntry } from "@elektro/shared";
import { HistoryFeed, HistoryPrivacyNotice } from "../components/history/history-feed";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/history";

/** My history (plan J6): the activity feed with a short privacy notice on top. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireUser(request, locale);
  const { entries } = await apiFetch<{ entries: HistoryEntry[] }>(request, `/api/history?locale=${locale}`);
  return { entries };
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { entries } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg" maw={720}>
      <Title order={2}>{t("history.title")}</Title>
      <HistoryPrivacyNotice />
      <HistoryFeed
        entries={entries}
        locale={locale}
        emptyAction={{ to: localePath(locale, "syllabus"), label: t("history.startFirst") }}
      />
    </Stack>
  );
}
