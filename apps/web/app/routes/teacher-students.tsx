import { useState } from "react";
import { Badge, Card, Group, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-students";

interface StudentRow {
  id: string;
  name: string;
  email: string;
  lastActivityAt: string | null;
  topicsMastered: number;
  topicsPractising: number;
  struggling: boolean;
}

/** Students list (plan J7): sortable by last activity or progress, with the struggling flag. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { students } = await apiFetch<{ students: StudentRow[] }>(request, "/api/teacher/students");
  return { students };
}

type Sort = "activity" | "progress";

export default function TeacherStudents() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { students } = useLoaderData<typeof loader>();
  const [sort, setSort] = useState<Sort>("activity");

  const sorted = [...students].sort((a, b) =>
    sort === "activity"
      ? Date.parse(b.lastActivityAt ?? "1970-01-01") - Date.parse(a.lastActivityAt ?? "1970-01-01")
      : b.topicsMastered - a.topicsMastered || b.topicsPractising - a.topicsPractising,
  );
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Europe/Budapest" });

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("teacher.students.title")}</Title>
      <TeacherTabs />
      <SegmentedControl
        value={sort}
        onChange={(value) => setSort(value as Sort)}
        aria-label={t("teacher.students.sort")}
        data={[
          { value: "activity", label: t("teacher.students.byActivity") },
          { value: "progress", label: t("teacher.students.byProgress") },
        ]}
      />

      {sorted.length === 0 ? (
        <Text>{t("teacher.students.empty")}</Text>
      ) : (
        sorted.map((student) => (
          <Card
            key={student.id}
            component={Link}
            to={localePath(locale, `teacher/students/${student.id}`)}
            withBorder
            padding="md"
            radius="md"
            data-student-id={student.id}
          >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600} truncate>
                  {student.name}
                </Text>
                <Text size="sm" c="dimmed" truncate>
                  {student.email}
                </Text>
                <Text size="sm">
                  {t("teacher.students.progress", { mastered: student.topicsMastered, practising: student.topicsPractising })}
                </Text>
                <Text size="sm" c="dimmed">
                  {student.lastActivityAt
                    ? t("teacher.students.lastActivity", { date: dateFormat.format(new Date(student.lastActivityAt)) })
                    : t("teacher.students.noActivity")}
                </Text>
              </Stack>
              {student.struggling && (
                <Badge color="orange" variant="light">
                  {t("teacher.struggling")}
                </Badge>
              )}
            </Group>
          </Card>
        ))
      )}
    </Stack>
  );
}

