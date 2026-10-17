import { Alert, Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import {
  getTopic,
  hasPractice,
  isTopicId,
  type ContentStatus,
  type Locale,
  type TopicId,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { MasteryBadge, TopicBadges } from "../components/topic/topic-badges";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { getProgress } from "../lib/progress";
import { loginPath } from "../lib/return-to";
import { getCurrentUser } from "../lib/session";
import { listCalculators } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/topic";

interface TopicLesson {
  slug: string;
  title: string;
  summary: string | null;
  status: ContentStatus;
  completed: boolean;
}

/**
 * Topic hub (plan §3.3, J1): the lessons, calculator, practice and simulator
 * of one topic, and the student's progress on it.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  if (!isTopicId(params.topicId)) {
    throw new Response(null, { status: 404 });
  }
  const topicId: TopicId = params.topicId;
  const user = await getCurrentUser(request);
  const query = new URLSearchParams({ locale: String(params.locale), topicId });

  const [{ lessons }, progress, calculators, intros] = await Promise.all([
    apiFetch<{ lessons: TopicLesson[] }>(request, `/api/lessons?${query.toString()}`),
    getProgress(request, user !== null),
    listCalculators(request, String(params.locale), topicId),
    // The intro is optional: a failing lookup never breaks the hub.
    apiFetch<{ intros: Partial<Record<TopicId, { text: string }>> }>(request, `/api/topic-intros?locale=${String(params.locale)}`)
      .then((data) => data.intros)
      .catch(() => ({}) as Partial<Record<TopicId, { text: string }>>),
  ]);

  return {
    topicId,
    lessons,
    calculators,
    intro: intros[topicId]?.text ?? null,
    progress: progress.find((row) => row.topicId === topicId) ?? null,
  };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => [
    { labelKey: "nav.lessons", path: "syllabus" },
    { labelKey: `topic.${(data as { topicId: string } | undefined)?.topicId ?? ""}` },
  ],
};

export default function TopicHub() {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();
  const { topicId, lessons, progress, calculators, intro } = useLoaderData<typeof loader>();
  const topic = getTopic(topicId);
  const practicePath = localePath(locale, `practice/${topicId}`);

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {t(`module.${topic.module}`)}
        </Text>
        <Title order={2}>{t(`topic.${topicId}`)}</Title>
        <TopicBadges topic={topic} />
        {intro && (
          <Text data-testid="topic-intro" style={{ lineHeight: 1.6 }}>
            {intro}
          </Text>
        )}
      </Stack>

      {topic.contentPhase > 1 && <Alert variant="light">{t("topicHub.comingSoon")}</Alert>}

      {progress && (
        <Group gap="xs">
          <Text size="sm">{t("topicHub.myProgress")}:</Text>
          <MasteryBadge level={progress.masteryLevel} />
        </Group>
      )}

      <Stack gap="sm" component="section" aria-labelledby="topic-lessons">
        <Title order={3} size="h4" id="topic-lessons">
          {t("topicHub.lessons")}
        </Title>
        {lessons.length === 0 ? (
          <Text c="dimmed">{t("topicHub.noLessons")}</Text>
        ) : (
          lessons.map((lesson) => (
            <Card
              key={lesson.slug}
              component={Link}
              to={localePath(locale, `lessons/${lesson.slug}`)}
              withBorder
              padding="md"
              radius="md"
            >
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Stack gap={2}>
                  <Text fw={600}>{lesson.title}</Text>
                  {lesson.summary && (
                    <Text size="sm" c="dimmed">
                      {lesson.summary}
                    </Text>
                  )}
                </Stack>
                {lesson.completed ? (
                  <Badge color="green" variant="light" style={{ flexShrink: 0 }}>
                    ✓ {t("topicHub.completed")}
                  </Badge>
                ) : (
                  lesson.status !== "approved" && (
                    <Badge color="yellow" variant="light" style={{ flexShrink: 0 }}>
                      {t(`lessons.status.${lesson.status}`)}
                    </Badge>
                  )
                )}
              </Group>
            </Card>
          ))
        )}
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        {calculators.map((calculator) => (
          <ToolCard
            key={calculator.id}
            to={localePath(locale, calculator.path)}
            title={calculator.title ?? t("topicHub.calculator")}
            description={t("topicHub.calculatorDescription")}
          />
        ))}
        {hasPractice(topicId) && (
          <ToolCard
            to={user ? practicePath : loginPath(locale, practicePath)}
            title={t("topicHub.practice")}
            description={t("topicHub.practiceDescription")}
            locked={!user}
          />
        )}
        <SimulatorCard locale={locale} signedIn={user !== null} />
      </SimpleGrid>
    </Stack>
  );
}

function ToolCard(props: { to: string; title: string; description: string; locked?: boolean }) {
  const { t } = useTranslation();
  return (
    <Card component={Link} to={props.to} withBorder padding="md" radius="md" style={{ minHeight: 96 }}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Text fw={600}>{props.title}</Text>
        {props.locked && (
          <Badge color="gray" variant="light">
            {t("topicHub.locked")}
          </Badge>
        )}
      </Group>
      <Text size="sm" c="dimmed" mt={4}>
        {props.description}
      </Text>
    </Card>
  );
}

/** Phase 4. Guests see it locked with a login prompt (plan Q10). */
function SimulatorCard({ locale, signedIn }: { locale: Locale; signedIn: boolean }) {
  const { t } = useTranslation();
  const simulator = localePath(locale, "simulator");
  return (
    <ToolCard
      to={signedIn ? simulator : loginPath(locale, simulator)}
      title={t("topicHub.simulator")}
      description={t("topicHub.simulatorDescription")}
      locked={!signedIn}
    />
  );
}
