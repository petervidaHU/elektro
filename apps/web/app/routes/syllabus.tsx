import {
  Alert,
  Badge,
  Card,
  Group,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useActionData, useLoaderData, useSearchParams } from "react-router";
import {
  DEFAULT_LOCALE,
  hasAtLeastRole,
  isLocale,
  MODULES,
  moveItem,
  moveWithinGroup,
  topicsByModule,
  type Locale,
  type MasteryLevel,
  type MoveDirection,
  type Topic,
} from "@elektro/shared";
import { ModuleContentTable } from "../components/content/content-table";
import { FormError } from "../components/content/form-error";
import { MasteryBadge, TopicBadges } from "../components/topic/topic-badges";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { actionFailure, type ManagedCalculators, type ManagedLesson } from "../lib/content-admin";
import { jsonBody } from "../lib/content-admin-actions";
import { getCurrentUser } from "../lib/session";
import { getProgress } from "../lib/progress";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/syllabus";

async function loadManagedLessons(request: Request, locale: Locale) {
  const { lessons } = await apiFetch<{ lessons: ManagedLesson[] }>(
    request,
    `/api/manage/lessons?locale=${locale}`,
  );
  return lessons;
}

async function loadManagedCalculators(request: Request, locale: Locale) {
  return apiFetch<ManagedCalculators>(request, `/api/manage/calculators?locale=${locale}`);
}

/**
 * The syllabus (plan §1.2, U3): modules and their topics in curriculum order.
 * Topics whose content comes later are shown, marked "coming soon".
 *
 * Teachers and admins also get the **detailed list** (plan U14, Q21): every
 * lesson and calculator per topic in a table, with new / edit / order and -
 * admins only - archive or remove. The API checks every role itself.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await getCurrentUser(request);
  const isStaff = user !== null && hasAtLeastRole(user.role, "teacher");
  const [progress, intros, content] = await Promise.all([
    getProgress(request, user !== null),
    apiFetch<{ intros: Partial<Record<string, { text: string }>> }>(request, `/api/topic-intros?locale=${locale}`)
      .then((data) => data.intros)
      .catch(() => ({}) as Partial<Record<string, { text: string }>>),
    isStaff
      ? Promise.all([loadManagedLessons(request, locale), loadManagedCalculators(request, locale)])
      : null,
  ]);

  return {
    progress: Object.fromEntries(progress.map((row) => [row.topicId, row.masteryLevel])),
    intros: Object.fromEntries(Object.entries(intros).map(([topicId, intro]) => [topicId, intro?.text ?? ""])),
    content: content && {
      lessons: content[0],
      ...content[1],
      isAdmin: user !== null && hasAtLeastRole(user.role, "admin"),
    },
  };
}

/** The table's actions: ordering, archive / restore, removing a calculator. */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const target = String(form.get("target") ?? "");
  const direction: MoveDirection = form.get("direction") === "down" ? "down" : "up";

  try {
    switch (intent) {
      case "moveLesson": {
        // The order comes from the server, so a stale page cannot scramble it.
        const lessons = await loadManagedLessons(request, locale);
        const moved = lessons.find((lesson) => lesson.slug === target);
        if (!moved) break;
        const slugs = lessons
          .filter((lesson) => lesson.topicId === moved.topicId && !lesson.archivedAt)
          .map((lesson) => lesson.slug);
        await apiFetch(request, "/api/lessons/order", {
          method: "PUT",
          ...jsonBody({ topicId: moved.topicId, slugs: moveItem(slugs, target, direction) }),
        });
        break;
      }
      case "archiveLesson":
      case "restoreLesson":
        await apiFetch(
          request,
          `/api/lessons/${encodeURIComponent(target)}/${intent === "archiveLesson" ? "archive" : "restore"}`,
          { method: "POST" },
        );
        break;
      case "moveCalculator": {
        // The table orders calculators within their topic; the stored order is global.
        const { calculators } = await loadManagedCalculators(request, locale);
        const moved = calculators.find((calculator) => calculator.id === target);
        if (!moved) break;
        const ids = calculators.map((calculator) => calculator.id);
        const group = calculators
          .filter((calculator) => calculator.topicId === moved.topicId)
          .map((calculator) => calculator.id);
        await apiFetch(request, "/api/calculators/order", {
          method: "PUT",
          ...jsonBody({ ids: moveWithinGroup(ids, group, target, direction) }),
        });
        break;
      }
      case "removeCalculator":
        await apiFetch(request, `/api/calculators/${encodeURIComponent(target)}`, { method: "DELETE" });
        break;
    }
    return null;
  } catch (error) {
    return actionFailure(error);
  }
}

const VIEWS = ["list", "cards"] as const;
type View = (typeof VIEWS)[number];
const ALL_MODULES = "all";

export default function Syllabus() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { progress, intros, content } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;
  const [searchParams, setSearchParams] = useSearchParams();

  // Teachers and admins land on the detailed list; students only have cards.
  const viewParam = searchParams.get("view");
  const view: View = content && viewParam !== "cards" ? "list" : "cards";
  const moduleParam = searchParams.get("module");
  const shownModules = MODULES.filter((module) => !moduleParam || module === moduleParam);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    next.delete("notice");
    if (value === null) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>{t("syllabus.title")}</Title>
        <Text c="dimmed">{t("syllabus.intro")}</Text>
        <Text component={Link} to={localePath(locale, "glossary")} td="underline" size="sm">
          {t("glossary.toGlossary")}
        </Text>
      </Stack>

      {content && (
        <Stack gap="sm">
          <SegmentedControl
            value={view}
            onChange={(next) => setParam("view", next === "list" ? null : next)}
            data={VIEWS.map((value) => ({ value, label: t(`contentAdmin.view.${value}`) }))}
            aria-label={t("contentAdmin.view.label")}
          />
          {view === "list" && (
            <Select
              label={t("contentAdmin.moduleFilter")}
              data={[
                { value: ALL_MODULES, label: t("contentAdmin.allModules") },
                ...MODULES.map((module) => ({ value: module, label: t(`module.${module}`) })),
              ]}
              value={moduleParam ?? ALL_MODULES}
              onChange={(next) => setParam("module", !next || next === ALL_MODULES ? null : next)}
              allowDeselect={false}
              maw={420}
            />
          )}
          {searchParams.get("notice") === "saved" && (
            <Alert variant="light" color="green" role="status">
              {t("contentAdmin.saved")}
            </Alert>
          )}
          <FormError failure={failure} />
        </Stack>
      )}

      {content && view === "list" &&
        shownModules.map((module) => (
          <ModuleContentTable
            key={module}
            module={module}
            lessons={content.lessons}
            calculators={content.calculators}
            available={content.available}
            isAdmin={content.isAdmin}
            locale={locale}
          />
        ))}

      {view === "cards" && MODULES.map((module) => (
        <Stack key={module} gap="sm" component="section" aria-labelledby={`module-${module}`}>
          <Title order={3} size="h4" id={`module-${module}`}>
            {t(`module.${module}`)}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {topicsByModule(module).map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                to={localePath(locale, `topics/${topic.id}`)}
                mastery={progress[topic.id]}
                intro={intros[topic.id]}
              />
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  );
}

function TopicCard({ topic, to, mastery, intro }: { topic: Topic; to: string; mastery?: MasteryLevel; intro?: string }) {
  const { t } = useTranslation();
  const available = topic.contentPhase === 1;

  const body = (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Text fw={600}>{t(`topic.${topic.id}`)}</Text>
        {!available && (
          <Badge color="gray" variant="light" style={{ flexShrink: 0 }}>
            {t("syllabus.comingSoon")}
          </Badge>
        )}
        {available && mastery && mastery !== "none" && <MasteryBadge level={mastery} />}
      </Group>
      <TopicBadges topic={topic} />
      {intro && (
        <Text size="sm" c="dimmed" lineClamp={2}>
          {intro}
        </Text>
      )}
    </Stack>
  );

  return available ? (
    <Card component={Link} to={to} withBorder padding="md" radius="md" style={{ minHeight: 64 }}>
      {body}
    </Card>
  ) : (
    <Card withBorder padding="md" radius="md" style={{ minHeight: 64, opacity: 0.6 }} aria-disabled="true">
      {body}
    </Card>
  );
}
