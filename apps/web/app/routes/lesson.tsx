import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useActionData, useFetcher, useLoaderData, useNavigation } from "react-router";
import {
  availableContentActions,
  DEFAULT_LOCALE,
  hasPractice,
  isContentAction,
  isLocale,
  lessonSections,
  parseLessonBody,
  type ContentStatus,
  type ErrorCode,
  type TopicId,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { LessonBody } from "../components/lesson/lesson-body";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { listCalculators } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/lesson";

export interface LessonData {
  id: string;
  lessonId: string;
  topicId: TopicId;
  version: number;
  locale: string;
  title: string;
  summary: string | null;
  body: string;
  status: ContentStatus;
  reviewNote: string | null;
  approvedAt: string | null;
}

export interface LessonRead {
  lastSection: string | null;
  firstOpenedAt: string;
  completedAt: string | null;
}

/** Loads a lesson, turning the API's 404 into this route's 404. */
export async function loadLesson(request: Request, locale: string, slug: string) {
  const query = new URLSearchParams({ locale });
  try {
    return await apiFetch<{ lesson: LessonData; read: LessonRead | null }>(
      request,
      `/api/lessons/${encodeURIComponent(slug)}?${query.toString()}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = String(params.locale);
  const loaded = await loadLesson(request, locale, String(params.slug));
  const [calculator] = await listCalculators(request, locale, loaded.lesson.topicId);
  return { ...loaded, calculator: calculator ?? null };
}

/**
 * Reading progress (open / section / complete) and the teacher's review
 * actions. The API checks the role; the UI only hides what a role cannot use.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const slug = encodeURIComponent(String(params.slug));
  const form = await request.formData();
  const intent = String(form.get("intent"));

  try {
    if (intent === "open" || intent === "section" || intent === "complete") {
      const section = form.get("section");
      await apiFetch(request, `/api/lessons/${slug}/progress`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          event: intent,
          ...(typeof section === "string" && section ? { section } : {}),
        }),
      });
      return intent === "complete"
        ? redirect(localePath(locale, `lessons/${String(params.slug)}/summary`))
        : { ok: true as const };
    }

    const reviewAction = form.get("reviewAction");
    if (intent === "review" && isContentAction(reviewAction)) {
      const note = String(form.get("note") ?? "").trim();
      // Plan J8: requesting changes needs a note for the author.
      if (reviewAction === "request_changes" && !note) {
        return { errorCode: "VALIDATION_FAILED" as ErrorCode };
      }
      await apiFetch(request, `/api/lessons/${slug}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: reviewAction, locale, ...(note ? { note } : {}) }),
      });
      return { ok: true as const };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return { errorCode: error.body.code as ErrorCode };
    }
    throw error;
  }

  return { errorCode: "VALIDATION_FAILED" as ErrorCode };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const lesson = (data as { lesson?: LessonData } | undefined)?.lesson;
    return [
      { labelKey: "nav.lessons", path: "syllabus" },
      ...(lesson ? [{ labelKey: `topic.${lesson.topicId}`, path: `topics/${lesson.topicId}` }] : []),
      { label: lesson?.title ?? "" },
    ];
  },
};

export default function LessonPage() {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();
  const { lesson, read, calculator } = useLoaderData<typeof loader>();
  const tree = useMemo(() => parseLessonBody(lesson.body), [lesson.body]);
  const sections = useMemo(() => lessonSections(tree), [tree]);
  const current = useSectionTracking(sections.map((section) => section.id), user !== null);
  const progress = sections.length === 0 ? 0 : ((current + 1) / sections.length) * 100;
  const resumeSection = read && !read.completedAt ? sections.find((s) => s.id === read.lastSection) : undefined;

  return (
    <Stack gap="md" maw={760}>
      {user && user.role !== "student" && <ReviewPanel lesson={lesson} role={user.role} />}

      <Box
        pos="sticky"
        top="calc(60px + env(safe-area-inset-top, 0px))"
        style={{ zIndex: 5, background: "var(--mantine-color-body)" }}
        py={4}
      >
        <Progress value={progress} size="sm" aria-label={t("lesson.progress")} />
      </Box>

      <Stack gap={4}>
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {t(`topic.${lesson.topicId}`)}
          </Text>
          {lesson.status !== "approved" && (
            <Badge variant="light" color="yellow">
              {t(`lessons.status.${lesson.status}`)}
            </Badge>
          )}
        </Group>
        <Title order={2}>{lesson.title}</Title>
        {lesson.summary && <Text fw={500}>{lesson.summary}</Text>}
      </Stack>

      {read?.completedAt && (
        <Alert color="green" variant="light">
          {t("lesson.completed")}
        </Alert>
      )}
      {resumeSection && (
        <Button
          variant="light"
          onClick={() => document.getElementById(resumeSection.id)?.scrollIntoView({ behavior: "smooth" })}
        >
          {t("lesson.resume", { section: resumeSection.title })}
        </Button>
      )}

      <LessonBody tree={tree} />

      <Card withBorder padding="md" radius="md" mt="lg">
        <Stack gap="sm">
          <Title order={3} size="h4">
            {t("lesson.nextSteps")}
          </Title>
          {calculator && (
            <Button component={Link} to={localePath(locale, calculator.path)} variant="light">
              {t("lesson.toCalculator")}
            </Button>
          )}
          {hasPractice(lesson.topicId) && (
            <Button component={Link} to={localePath(locale, `practice/${lesson.topicId}`)} variant="light">
              {t("lesson.toPractice")}
            </Button>
          )}
          {user ? (
            <Form method="post">
              <input type="hidden" name="intent" value="complete" />
              <Button type="submit" fullWidth>
                {t("lesson.done")}
              </Button>
            </Form>
          ) : (
            <Button component={Link} to="summary" relative="path">
              {t("lesson.next")}
            </Button>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

/**
 * Tracks the section the reader has reached: the last level-2 heading above
 * the middle of the screen. Signed-in readers' position is saved (debounced)
 * so they can resume there.
 */
function useSectionTracking(sectionIds: string[], save: boolean): number {
  const [current, setCurrent] = useState(-1);
  const fetcher = useFetcher();
  const saved = useRef<string | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (save && !opened.current) {
      opened.current = true;
      void fetcher.submit({ intent: "open" }, { method: "post" });
    }
    // Only once per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save]);

  useEffect(() => {
    const update = () => {
      const middle = window.innerHeight / 2;
      let reached = -1;
      sectionIds.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top < middle) reached = index;
      });
      const atEnd = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      setCurrent(atEnd ? sectionIds.length - 1 : reached);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionIds]);

  useEffect(() => {
    const id = sectionIds[current];
    if (!save || !id || id === saved.current) return;
    const timer = window.setTimeout(() => {
      saved.current = id;
      void fetcher.submit({ intent: "section", section: id }, { method: "post" });
    }, 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, save, sectionIds]);

  return current;
}

function ReviewPanel({ lesson, role }: { lesson: LessonData; role: "teacher" | "admin" | "student" }) {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const actions = availableContentActions(lesson.status, role);
  const busy = navigation.state === "submitting";

  return (
    <Card withBorder padding="md" radius="md" bg="var(--mantine-color-gray-light)">
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={3} size="h5">
            {t("review.title")}
          </Title>
          <Badge variant="light" color={lesson.status === "approved" ? "green" : "yellow"}>
            {t("review.status", { status: t(`lessons.status.${lesson.status}`) })}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {t("review.version", { version: lesson.version })}
        </Text>
        {lesson.reviewNote && <Text size="sm">{t("review.lastNote", { note: lesson.reviewNote })}</Text>}
        {actionData && "errorCode" in actionData && (
          <Alert color="red" variant="light" role="alert">
            {t(`error.${actionData.errorCode}`)}
          </Alert>
        )}
        {actions.length > 0 && (
          <Form method="post">
            <input type="hidden" name="intent" value="review" />
            <Stack gap="sm">
              {actions.includes("request_changes") && (
                <Textarea name="note" label={t("review.note")} description={t("review.noteHint")} autosize minRows={2} />
              )}
              <Group grow>
                {actions.map((reviewAction) => (
                  <Button
                    key={reviewAction}
                    type="submit"
                    name="reviewAction"
                    value={reviewAction}
                    loading={busy}
                    variant={reviewAction === "approve" ? "filled" : "light"}
                    color={reviewAction === "request_changes" ? "orange" : undefined}
                  >
                    {t(`review.action.${reviewAction}`)}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Form>
        )}
      </Stack>
    </Card>
  );
}
