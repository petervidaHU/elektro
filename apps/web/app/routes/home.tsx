import { Badge, Button, Card, Group, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import {
  DEFAULT_LOCALE,
  examReadiness,
  formatPercent,
  isLocale,
  recommendNext,
  type HistoryEntry,
  type Locale,
  type TopicId,
  type TopicStates,
} from "@elektro/shared";
import { HistoryFeed } from "../components/history/history-feed";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import type { TopicProgressRow } from "../lib/progress";
import { loginPath, registerPath } from "../lib/return-to";
import { getCurrentUser } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/home";

interface DashboardData {
  activeSession: { id: string; topicId: TopicId; taskCount: number; done: number } | null;
  unfinishedLesson: { slug: string; topicId: TopicId; title: string } | null;
  topics: TopicProgressRow[];
  availableTopics: TopicId[];
  recent: HistoryEntry[];
}

/** Guests get the landing page; signed-in users their dashboard (plan J2). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await getCurrentUser(request);
  if (!user) {
    return { dashboard: null };
  }
  const dashboard = await apiFetch<DashboardData>(request, `/api/dashboard?locale=${locale}`);
  const states: TopicStates = Object.fromEntries(
    dashboard.topics.map((row) => [
      row.topicId,
      { masteryLevel: row.masteryLevel, tasksCompleted: row.tasksCompleted, unaidedRate: row.unaidedRate },
    ]),
  );
  return {
    dashboard: {
      activeSession: dashboard.activeSession,
      unfinishedLesson: dashboard.unfinishedLesson,
      recommended: recommendNext(states, dashboard.availableTopics),
      readiness: examReadiness(states),
      recent: dashboard.recent,
    },
  };
}

/** The three v1 modules. The simulator needs a login (plan §3.3). */
const MODULES = [
  { path: "syllabus", key: "lessons", requiresLogin: false },
  { path: "calculators", key: "calculators", requiresLogin: false },
  { path: "simulator", key: "simulator", requiresLogin: true },
] as const;

/**
 * `/:locale`: the landing page for guests, the dashboard once signed in
 * (docs/DEVELOPMENT_PLAN.md §3.4 J1/J2): continue where you left off,
 * recommended next, exam readiness and the last history entries.
 */
export default function Home() {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();
  const { dashboard } = useLoaderData<typeof loader>();

  return (
    <Stack gap="xl">
      {user ? (
        <Stack gap="sm">
          <Stack gap={4}>
            <Title order={2}>{t("dashboard.greeting", { name: user.name })}</Title>
            <Text c="dimmed">{t("dashboard.subtitle")}</Text>
          </Stack>
          {dashboard && <Dashboard data={dashboard} locale={locale} />}
        </Stack>
      ) : (
        <Stack gap="md">
          <Title order={2}>{t("landing.title")}</Title>
          <Text>{t("landing.intro")}</Text>
          <Stack gap="sm" maw={420}>
            <Button component={Link} to={registerPath(locale)} fullWidth>
              {t("landing.register")}
            </Button>
            <Button component={Link} to={loginPath(locale)} variant="default" fullWidth>
              {t("landing.login")}
            </Button>
          </Stack>
        </Stack>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {MODULES.map((module) => (
          <ModuleCard
            key={module.path}
            locale={locale}
            path={module.path}
            titleKey={`home.${module.key}.title`}
            descriptionKey={`home.${module.key}.description`}
            locked={module.requiresLogin && !user}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

interface ModuleCardProps {
  locale: Locale;
  path: string;
  titleKey: string;
  descriptionKey: string;
  /** Guests see login-only modules locked, with a way to log in (plan Q10). */
  locked: boolean;
}

function ModuleCard({ locale, path, titleKey, descriptionKey, locked }: ModuleCardProps) {
  const { t } = useTranslation();
  const target = localePath(locale, path);

  return (
    <Card
      component={Link}
      to={locked ? loginPath(locale, target) : target}
      withBorder
      padding="lg"
      radius="md"
      style={{ minHeight: 120 }}
      aria-describedby={locked ? `${path}-locked` : undefined}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Title order={3} size="h4">
          {t(titleKey)}
        </Title>
        {locked && (
          <Badge variant="light" color="gray" style={{ flexShrink: 0 }}>
            {t("home.locked")}
          </Badge>
        )}
      </Group>
      <Text c="dimmed" mt="xs">
        {t(descriptionKey)}
      </Text>
      {locked && (
        <Text id={`${path}-locked`} size="sm" mt="xs">
          {t("home.lockedHint")}
        </Text>
      )}
    </Card>
  );
}

type DashboardView = NonNullable<Awaited<ReturnType<typeof loader>>["dashboard"]>;

function Dashboard({ data, locale }: { data: DashboardView; locale: Locale }) {
  const { t } = useTranslation();

  return (
    <Stack gap="lg" maw={720} data-testid="dashboard">
      <Stack gap="xs">
        <Title order={3} size="h4">
          {t("dashboard.continue.title")}
        </Title>
        {data.activeSession ? (
          <Card component={Link} to={localePath(locale, `practice/s/${data.activeSession.id}`)} withBorder padding="md" radius="md">
            <Text fw={600}>{t("dashboard.continue.practice", { topic: t(`topic.${data.activeSession.topicId}`) })}</Text>
            <Text size="sm" c="dimmed">
              {t("dashboard.continue.practiceProgress", { done: data.activeSession.done, total: data.activeSession.taskCount })}
            </Text>
          </Card>
        ) : data.unfinishedLesson ? (
          <Card component={Link} to={localePath(locale, `lessons/${data.unfinishedLesson.slug}`)} withBorder padding="md" radius="md">
            <Text fw={600}>{t("dashboard.continue.lesson", { title: data.unfinishedLesson.title })}</Text>
            <Text size="sm" c="dimmed">
              {t(`topic.${data.unfinishedLesson.topicId}`)}
            </Text>
          </Card>
        ) : (
          <Text c="dimmed">{t("dashboard.continue.nothing")}</Text>
        )}
      </Stack>

      <Stack gap="xs">
        <Title order={3} size="h4">
          {t("dashboard.recommended.title")}
        </Title>
        {data.recommended ? (
          <Card component={Link} to={localePath(locale, `topics/${data.recommended.topicId}`)} withBorder padding="md" radius="md" data-testid="recommended">
            <Text fw={600}>{t(`topic.${data.recommended.topicId}`)}</Text>
            <Text size="sm" c="dimmed">
              {t(`dashboard.recommended.reason.${data.recommended.reason}`)}
            </Text>
          </Card>
        ) : (
          <Text c="dimmed">{t("dashboard.recommended.none")}</Text>
        )}
      </Stack>

      <Stack gap="xs">
        <Title order={3} size="h4">
          {t("dashboard.readiness.title")}
        </Title>
        <Text size="sm" c="dimmed">
          {t("dashboard.readiness.hint")}
        </Text>
        <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {data.readiness.map((part) => (
            <li key={part.part} data-exam-part={part.part}>
              <Group justify="space-between" mb={2} wrap="nowrap">
                <Text size="sm">{t(`examPart.${part.part}`)}</Text>
                <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {t("dashboard.readiness.covered", { covered: part.covered, total: part.total })}
                  {" · "}
                  {formatPercent(part.share * 100, locale, { maximumFractionDigits: 0 })}
                </Text>
              </Group>
              <Progress value={part.share * 100} size="sm" aria-hidden="true" />
            </li>
          ))}
        </Stack>
      </Stack>

      <Stack gap="xs">
        <Title order={3} size="h4">
          {t("dashboard.recent.title")}
        </Title>
        {data.recent.length === 0 ? (
          <Text c="dimmed">{t("history.empty")}</Text>
        ) : (
          <HistoryFeed entries={data.recent} locale={locale} compact />
        )}
        <Group>
          <Button component={Link} to={localePath(locale, "history")} variant="light">
            {t("dashboard.recent.all")}
          </Button>
          <Button component={Link} to={localePath(locale, "progress")} variant="light">
            {t("dashboard.progressLink")}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
