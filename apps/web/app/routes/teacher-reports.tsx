import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import {
  DEFAULT_LOCALE,
  isLocale,
  type ReportCategory,
  type ReportTargetKind,
} from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-reports";

interface ReportRow {
  id: string;
  targetKind: ReportTargetKind;
  targetId: string;
  targetVersion: number | null;
  category: ReportCategory;
  note: string | null;
  createdAt: string;
  reporterName: string | null;
}

/** Problem reports (plan J9 stub): a read-only list, newest first. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { reports } = await apiFetch<{ reports: ReportRow[] }>(request, "/api/teacher/reports");
  return { reports };
}

/** Where a report's target can be opened, if it has a page. */
function targetPath(report: ReportRow): string | null {
  switch (report.targetKind) {
    case "lesson":
      return `lessons/${report.targetId}`;
    case "calculator":
      return `calculators/${report.targetId}`;
    default:
      return null;
  }
}

export default function TeacherReports() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { reports } = useLoaderData<typeof loader>();
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("teacher.reports.title")}</Title>
      <TeacherTabs />

      {reports.length === 0 ? (
        <Text data-testid="reports-empty">{t("teacher.reports.empty")}</Text>
      ) : (
        reports.map((report) => {
          const path = targetPath(report);
          return (
            <Card key={report.id} withBorder padding="md" radius="md" data-report-id={report.id}>
              <Stack gap={4}>
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Text fw={600} style={{ overflowWrap: "anywhere" }}>
                    {t(`report.kinds.${report.targetKind}`)}: {report.targetId}
                    {report.targetVersion !== null && ` (${t("review.version", { version: report.targetVersion })})`}
                  </Text>
                  <Badge variant="light" color="orange">
                    {t(`report.categories.${report.category}`)}
                  </Badge>
                </Group>
                {report.note && <Text size="sm">{report.note}</Text>}
                <Text size="xs" c="dimmed">
                  {report.reporterName ?? t("teacher.reports.deletedReporter")} · {dateFormat.format(new Date(report.createdAt))}
                </Text>
                {path && (
                  <Text component={Link} to={localePath(locale, path)} size="sm" td="underline">
                    {t("teacher.reports.open")}
                  </Text>
                )}
              </Stack>
            </Card>
          );
        })
      )}
    </Stack>
  );
}
