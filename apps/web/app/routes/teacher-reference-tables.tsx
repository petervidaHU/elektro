import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, type TableStatus } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-reference-tables";

interface ListedTable {
  key: string;
  latest: { version: number; title: string; source: string; status: TableStatus };
  liveVersion: number | null;
}

/** Reference tables (plan §3.3 `/teacher/reference-tables`): status at a glance. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { tables } = await apiFetch<{ tables: ListedTable[] }>(request, "/api/reference-tables");
  return { tables };
}

export default function TeacherReferenceTables() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { tables } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("referenceTables.title")}</Title>
      <TeacherTabs />
      <Text size="sm" c="dimmed">{t("referenceTables.intro")}</Text>
      <Button component={Link} to={localePath(locale, "teacher/reference-tables/new")} maw={320}>
        {t("referenceTables.new")}
      </Button>

      {tables.length === 0 ? (
        <Text data-testid="tables-empty">{t("referenceTables.empty")}</Text>
      ) : (
        tables.map((table) => (
          <Card
            key={table.key}
            component={Link}
            to={localePath(locale, `teacher/reference-tables/${table.key}`)}
            withBorder
            padding="md"
            radius="md"
            data-table-key={table.key}
          >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{table.latest.title}</Text>
                <Text size="sm" c="dimmed" style={{ overflowWrap: "anywhere" }}>{table.key}</Text>
                <Text size="sm" c="dimmed">{t("referenceTables.source", { source: table.latest.source })}</Text>
              </Stack>
              <Stack gap={4} align="flex-end">
                <Badge color={table.latest.status === "verified" ? "green" : "orange"} variant="light">
                  {t(`referenceTables.status.${table.latest.status}`)}
                </Badge>
                {table.latest.status === "unverified" && table.liveVersion !== null && (
                  <Text size="xs" c="dimmed">{t("referenceTables.liveStill", { version: table.liveVersion })}</Text>
                )}
              </Stack>
            </Group>
          </Card>
        ))
      )}
    </Stack>
  );
}
