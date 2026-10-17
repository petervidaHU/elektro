import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, type ContentStatus } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-glossary";

interface ManagedTerm {
  key: string;
  latest: { version: number; term: string; status: ContentStatus };
  live: { version: number } | null;
}

/** Glossary management: every term with its state; new and edit forms are linked from here. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { terms } = await apiFetch<{ terms: ManagedTerm[] }>(request, `/api/manage/glossary?locale=${locale}`);
  return { terms };
}

export default function TeacherGlossary() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { terms } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("glossary.manage.title")}</Title>
      <TeacherTabs />
      <Button component={Link} to={localePath(locale, "teacher/glossary/new")} maw={320}>
        {t("glossary.manage.new")}
      </Button>
      {terms.length === 0 ? (
        <Text data-testid="glossary-manage-empty">{t("glossary.empty")}</Text>
      ) : (
        terms.map((entry) => (
          <Card key={entry.key} component={Link} to={localePath(locale, `teacher/glossary/${entry.key}`)} withBorder padding="md" radius="md" data-term-key={entry.key}>
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{entry.latest.term}</Text>
                <Text size="sm" c="dimmed" style={{ overflowWrap: "anywhere" }}>
                  {entry.key} · {t("review.version", { version: entry.latest.version })}
                </Text>
                {entry.live && entry.live.version !== entry.latest.version && (
                  <Text size="xs" c="dimmed">{t("glossary.manage.liveStill", { version: entry.live.version })}</Text>
                )}
              </Stack>
              <Badge variant="light" color={entry.latest.status === "approved" ? "green" : "yellow"}>
                {t(`lessons.status.${entry.latest.status}`)}
              </Badge>
            </Group>
          </Card>
        ))
      )}
    </Stack>
  );
}
