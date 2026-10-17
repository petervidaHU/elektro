import { useMemo } from "react";
import { Alert, Button, Card, List, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { hasPractice, lessonGoals, parseLessonBody } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { listCalculators } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import { loadLesson, type LessonData } from "./lesson";
import type { Route } from "./+types/lesson-summary";

/**
 * After a lesson (plan J5): what it taught - its goals - and where to go next:
 * the calculator, practice, the next lesson of the topic.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = String(params.locale);
  const slug = String(params.slug);
  const { lesson, read } = await loadLesson(request, locale, slug);
  const query = new URLSearchParams({ locale, topicId: lesson.topicId });
  const [{ lessons }, calculators] = await Promise.all([
    apiFetch<{ lessons: { slug: string; title: string }[] }>(request, `/api/lessons?${query.toString()}`),
    listCalculators(request, locale, lesson.topicId),
  ]);
  const index = lessons.findIndex((item) => item.slug === slug);
  return {
    lesson,
    read,
    calculator: calculators[0] ?? null,
    nextLesson: index >= 0 ? (lessons[index + 1] ?? null) : null,
  };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const lesson = (data as { lesson?: LessonData } | undefined)?.lesson;
    return [
      { labelKey: "nav.lessons", path: "syllabus" },
      ...(lesson ? [{ labelKey: `topic.${lesson.topicId}`, path: `topics/${lesson.topicId}` }] : []),
      { labelKey: "lessonSummary.title" },
    ];
  },
};

export default function LessonSummary() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { lesson, read, calculator, nextLesson } = useLoaderData<typeof loader>();
  const goals = useMemo(() => lessonGoals(parseLessonBody(lesson.body)), [lesson.body]);

  return (
    <Stack gap="lg" maw={640}>
      <Stack gap={4}>
        <Title order={2}>{t("lessonSummary.title")}</Title>
        <Text c="dimmed">{lesson.title}</Text>
      </Stack>

      {read?.completedAt && (
        <Alert color="green" variant="light">
          {t("lessonSummary.completed")}
        </Alert>
      )}

      {goals.length > 0 && (
        <Card withBorder padding="md" radius="md">
          <Text fw={600} mb="xs">
            {t("lessonSummary.learned")}
          </Text>
          <List spacing="xs">
            {goals.map((goal) => (
              <List.Item key={goal}>{goal}</List.Item>
            ))}
          </List>
        </Card>
      )}

      <Stack gap="sm">
        <Title order={3} size="h4">
          {t("lesson.nextSteps")}
        </Title>
        {calculator && (
          <Button component={Link} to={localePath(locale, calculator.path)}>
            {t("lesson.toCalculator")}
          </Button>
        )}
        {hasPractice(lesson.topicId) && (
          <Button component={Link} to={localePath(locale, `practice/${lesson.topicId}`)} variant="light">
            {t("lesson.toPractice")}
          </Button>
        )}
        {nextLesson && (
          <Button component={Link} to={localePath(locale, `lessons/${nextLesson.slug}`)} variant="light">
            {t("lesson.nextLesson", { title: nextLesson.title })}
          </Button>
        )}
        <Button component={Link} to={localePath(locale, `topics/${lesson.topicId}`)} variant="default">
          {t("lesson.toTopic")}
        </Button>
      </Stack>
    </Stack>
  );
}
