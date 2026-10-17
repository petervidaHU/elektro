import { Alert, Badge, Button, Card, Group, List, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import {
  DEFAULT_LOCALE,
  isLocale,
  PLANNED_CALCULATORS,
  requirementStates,
  unmetRequirements,
  type TableStatus,
} from "@elektro/shared";
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
  // What each planned calculator still waits for (plan K9).
  const blocked = PLANNED_CALCULATORS.map((calculator) => ({
    id: calculator.id,
    states: requirementStates(calculator.requiresTables, tables),
  })).filter((item) => unmetRequirements(item.states).length > 0);
  return { tables, blocked };
}

export default function TeacherReferenceTables() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { tables, blocked } = useLoaderData<typeof loader>();

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("referenceTables.title")}</Title>
      <TeacherTabs />
      <Text size="sm" c="dimmed">{t("referenceTables.intro")}</Text>
      {blocked.map((item) => (
        <Alert key={item.id} color="orange" variant="light" title={t("referenceTables.missing.title", { calculator: t(`calculators.planned.${item.id}`) })} data-testid="missing-tables">
          <Text size="sm" mb="xs">{t("referenceTables.missing.hint")}</Text>
          <List spacing="xs" listStyleType="none" p={0}>
            {item.states.map((state) => (
              <List.Item key={state.key} data-requirement={state.key} data-state={state.state}>
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <Text size="sm" fw={600}>{state.state === "verified" ? "✓" : state.state === "unverified" ? "⚠" : "✗"}</Text>
                  <Stack gap={0}>
                    <Text size="sm">{t(`referenceTables.required.${state.key}`)}</Text>
                    <Text size="xs" c="dimmed">{t(`referenceTables.missing.${state.state}`)}</Text>
                  </Stack>
                  {state.state === "missing" && (
                    <Button component={Link} to={localePath(locale, `teacher/reference-tables/new?key=${state.key}`)} size="compact-sm" variant="light" ml="auto">
                      {t("referenceTables.missing.create")}
                    </Button>
                  )}
                  {state.state === "unverified" && (
                    <Button component={Link} to={localePath(locale, `teacher/reference-tables/${state.key}`)} size="compact-sm" variant="light" ml="auto">
                      {t("referenceTables.missing.open")}
                    </Button>
                  )}
                </Group>
              </List.Item>
            ))}
          </List>
        </Alert>
      ))}
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
