import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import {
  DEFAULT_LOCALE,
  formatDateTime,
  hasAtLeastRole,
  isLocale,
  moveItem,
  type Locale,
  type MoveDirection,
  type TopicId,
} from "@elektro/shared";
import { ConfirmButton } from "../components/content/confirm-button";
import { FormError } from "../components/content/form-error";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import {
  actionFailure,
  type ManagedCalculators,
  type ManagedLesson,
} from "../lib/content-admin";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-content";

const TABS = ["lessons", "calculators"] as const;
type Tab = (typeof TABS)[number];

async function loadLessons(request: Request, locale: Locale) {
  const { lessons } = await apiFetch<{ lessons: ManagedLesson[] }>(
    request,
    `/api/manage/lessons?locale=${locale}`,
  );
  return lessons;
}

async function loadCalculators(request: Request, locale: Locale) {
  return apiFetch<ManagedCalculators>(request, `/api/manage/calculators?locale=${locale}`);
}

/**
 * Content management (plan §3.3 `/teacher/content`, Q21): every lesson and
 * calculator in detail, with new / edit / order and - admins only - archive
 * or remove. The API enforces each role; this page only hides controls.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const [lessons, calculators] = await Promise.all([
    loadLessons(request, locale),
    loadCalculators(request, locale),
  ]);
  return { lessons, calculators, isAdmin: hasAtLeastRole(user.role, "admin") };
}

const json = (body: unknown) => ({
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const target = String(form.get("target") ?? "");
  const direction = form.get("direction") === "down" ? "down" : ("up" satisfies MoveDirection);

  try {
    switch (intent) {
      case "moveLesson": {
        // Order from the server, so a stale page cannot scramble the topic.
        const lessons = await loadLessons(request, locale);
        const moved = lessons.find((lesson) => lesson.slug === target);
        if (!moved) break;
        const slugs = lessons
          .filter((lesson) => lesson.topicId === moved.topicId && !lesson.archivedAt)
          .map((lesson) => lesson.slug);
        await apiFetch(request, "/api/lessons/order", {
          method: "PUT",
          ...json({ topicId: moved.topicId, slugs: moveItem(slugs, target, direction) }),
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
        const { calculators } = await loadCalculators(request, locale);
        const ids = calculators.map((calculator) => calculator.id);
        await apiFetch(request, "/api/calculators/order", {
          method: "PUT",
          ...json({ ids: moveItem(ids, target, direction) }),
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

export default function TeacherContent() {
  const { t } = useTranslation();
  const { lessons, calculators, isAdmin } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "lessons";
  const notice = searchParams.get("notice");

  return (
    <Stack gap="lg">
      <Title order={2}>{t("contentAdmin.title")}</Title>

      {notice === "saved" && (
        <Alert variant="light" color="green" role="status">
          {t("contentAdmin.saved")}
        </Alert>
      )}
      <FormError failure={failure} />

      <SegmentedControl
        value={tab}
        onChange={(next) => setSearchParams({ tab: next }, { replace: true, preventScrollReset: true })}
        data={TABS.map((value) => ({ value, label: t(`contentAdmin.tab.${value}`) }))}
        aria-label={t("contentAdmin.title")}
      />

      {tab === "lessons" ? (
        <LessonList lessons={lessons} isAdmin={isAdmin} />
      ) : (
        <CalculatorList data={calculators} isAdmin={isAdmin} />
      )}
    </Stack>
  );
}

/** Up / down buttons that post `intent` with the item and direction. */
function MoveButtons({
  intent,
  target,
  canUp,
  canDown,
}: {
  intent: string;
  target: string;
  canUp: boolean;
  canDown: boolean;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <Form method="post" preventScrollReset>
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="target" value={target} />
      <Group gap="xs" wrap="nowrap">
        <ActionIcon
          type="submit"
          name="direction"
          value="up"
          variant="default"
          disabled={!canUp || busy}
          aria-label={t("contentAdmin.moveUp")}
        >
          <span aria-hidden>↑</span>
        </ActionIcon>
        <ActionIcon
          type="submit"
          name="direction"
          value="down"
          variant="default"
          disabled={!canDown || busy}
          aria-label={t("contentAdmin.moveDown")}
        >
          <span aria-hidden>↓</span>
        </ActionIcon>
      </Group>
    </Form>
  );
}

function LessonList({ lessons, isAdmin }: { lessons: ManagedLesson[]; isAdmin: boolean }) {
  const { t } = useTranslation();
  const { locale } = useLayoutData();

  // Grouped by topic, in syllabus order (the API sorts by topic, then position).
  const groups: { topicId: TopicId; lessons: ManagedLesson[] }[] = [];
  for (const lesson of lessons) {
    const last = groups.at(-1);
    if (last?.topicId === lesson.topicId) last.lessons.push(lesson);
    else groups.push({ topicId: lesson.topicId, lessons: [lesson] });
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text c="dimmed" size="sm">
          {t("contentAdmin.lesson.count", { count: lessons.length })}
        </Text>
        <Button component={Link} to={localePath(locale, "teacher/content/lessons/new")}>
          {t("contentAdmin.lesson.new")}
        </Button>
      </Group>

      {groups.length === 0 && <Text c="dimmed">{t("contentAdmin.lesson.empty")}</Text>}

      {groups.map((group) => {
        const active = group.lessons.filter((lesson) => !lesson.archivedAt);
        return (
          <Stack key={group.topicId} gap="sm" component="section">
            <Title order={3} size="h5">
              {t(`topic.${group.topicId}`)}
            </Title>
            {group.lessons.map((lesson) => {
              const index = active.indexOf(lesson);
              return (
                <LessonCard
                  key={lesson.lessonId}
                  lesson={lesson}
                  isAdmin={isAdmin}
                  canUp={index > 0}
                  canDown={index >= 0 && index < active.length - 1}
                />
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
}

function LessonCard({
  lesson,
  isAdmin,
  canUp,
  canDown,
}: {
  lesson: ManagedLesson;
  isAdmin: boolean;
  canUp: boolean;
  canDown: boolean;
}) {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const navigation = useNavigation();
  const archived = lesson.archivedAt !== null;
  const live = lesson.live;

  return (
    <Card withBorder padding="md" radius="md" opacity={archived ? 0.7 : 1}>
      <Stack gap="xs">
        <Stack gap={2}>
          <Text fw={600} style={{ overflowWrap: "anywhere" }}>
            {lesson.latest?.title ?? lesson.slug}
          </Text>
          <Text size="xs" c="dimmed" style={{ overflowWrap: "anywhere" }}>
            {lesson.slug}
          </Text>
        </Stack>
        {/* Own row, so the status is never truncated on a phone. */}
        <Group gap={4}>
          {archived && <Badge color="gray">{t("contentAdmin.lesson.archived")}</Badge>}
          {lesson.latest && (
            <Badge variant="light" color={lesson.latest.status === "approved" ? "green" : "yellow"}>
              {t(`lessons.status.${lesson.latest.status}`)}
            </Badge>
          )}
        </Group>

        <Stack gap={2}>
          {lesson.latest ? (
            <Text size="sm">
              {t("contentAdmin.lesson.latest", {
                version: lesson.latest.version,
                date: formatDateTime(lesson.latest.updatedAt, locale),
              })}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              {t("contentAdmin.lesson.noTranslation")}
            </Text>
          )}
          {live ? (
            <Text size="sm">
              {t("contentAdmin.lesson.live", {
                version: live.version,
                approver: live.approvedByDeleted
                  ? t("contentAdmin.deletedAccount")
                  : (live.approvedByName ?? ""),
                role: live.approvedByRole ? t(`role.${live.approvedByRole}`) : "",
                date: live.approvedAt ? formatDateTime(live.approvedAt, locale) : "",
              })}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              {t("contentAdmin.lesson.notLive")}
            </Text>
          )}
          {archived && lesson.archivedAt && (
            <Text size="sm" c="dimmed">
              {t("contentAdmin.lesson.archivedAt", { date: formatDateTime(lesson.archivedAt, locale) })}
            </Text>
          )}
        </Stack>

        <Group justify="space-between" gap="xs">
          {!archived ? (
            <MoveButtons intent="moveLesson" target={lesson.slug} canUp={canUp} canDown={canDown} />
          ) : (
            <span />
          )}
          <Group gap="xs">
            {lesson.latest && (
              <Button
                component={Link}
                to={localePath(locale, `lessons/${lesson.slug}`)}
                variant="subtle"
              >
                {t("contentAdmin.open")}
              </Button>
            )}
            {!archived && (
              <Button
                component={Link}
                to={localePath(locale, `teacher/content/lessons/${lesson.slug}`)}
                variant="light"
              >
                {t("contentAdmin.edit")}
              </Button>
            )}
            {isAdmin && (
              <Form method="post" preventScrollReset>
                <input type="hidden" name="target" value={lesson.slug} />
                {archived ? (
                  <Button
                    type="submit"
                    name="intent"
                    value="restoreLesson"
                    variant="light"
                    loading={navigation.state === "submitting"}
                  >
                    {t("contentAdmin.lesson.restore")}
                  </Button>
                ) : (
                  <ConfirmButton
                    label={t("contentAdmin.lesson.archive")}
                    confirmLabel={t("contentAdmin.lesson.archiveConfirm")}
                    name="intent"
                    value="archiveLesson"
                    loading={navigation.state === "submitting"}
                  />
                )}
              </Form>
            )}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

function CalculatorList({ data, isAdmin }: { data: ManagedCalculators; isAdmin: boolean }) {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const navigation = useNavigation();
  const { calculators, available } = data;

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text c="dimmed" size="sm">
          {t("contentAdmin.calculator.count", { count: calculators.length })}
        </Text>
        <Button
          component={Link}
          to={localePath(locale, "teacher/content/calculators/new")}
          disabled={available.length === 0}
        >
          {t("contentAdmin.calculator.new")}
        </Button>
      </Group>
      {available.length === 0 && (
        <Text size="sm" c="dimmed">
          {t("contentAdmin.calculator.allListed")}
        </Text>
      )}

      {calculators.length === 0 && <Text c="dimmed">{t("contentAdmin.calculator.empty")}</Text>}

      {calculators.map((calculator, index) => (
        <Card key={calculator.id} withBorder padding="md" radius="md">
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{calculator.title ?? t(`contentAdmin.calculatorIds.${calculator.id}`)}</Text>
                <Text size="xs" c="dimmed">
                  {calculator.id} · {t(`topic.${calculator.topicId}`)}
                </Text>
              </Stack>
              <Badge variant="light" color={calculator.published ? "green" : "gray"}>
                {calculator.published
                  ? t("contentAdmin.calculator.published")
                  : t("contentAdmin.calculator.hidden")}
              </Badge>
            </Group>
            {calculator.description && <Text size="sm">{calculator.description}</Text>}
            {calculator.title === null && (
              <Text size="sm" c="orange">
                {t("contentAdmin.calculator.noText")}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {t("contentAdmin.updatedAt", { date: formatDateTime(calculator.updatedAt, locale) })}
            </Text>
            <Group justify="space-between" gap="xs">
              <MoveButtons
                intent="moveCalculator"
                target={calculator.id}
                canUp={index > 0}
                canDown={index < calculators.length - 1}
              />
              <Group gap="xs">
                <Button component={Link} to={localePath(locale, calculator.path)} variant="subtle">
                  {t("contentAdmin.open")}
                </Button>
                <Button
                  component={Link}
                  to={localePath(locale, `teacher/content/calculators/${calculator.id}`)}
                  variant="light"
                >
                  {t("contentAdmin.edit")}
                </Button>
                {isAdmin && (
                  <Form method="post" preventScrollReset>
                    <input type="hidden" name="target" value={calculator.id} />
                    <ConfirmButton
                      label={t("contentAdmin.calculator.remove")}
                      confirmLabel={t("contentAdmin.calculator.removeConfirm")}
                      name="intent"
                      value="removeCalculator"
                      loading={navigation.state === "submitting"}
                    />
                  </Form>
                )}
              </Group>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
