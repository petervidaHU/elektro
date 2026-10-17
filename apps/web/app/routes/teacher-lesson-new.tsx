import { Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { redirect, useActionData, useLoaderData } from "react-router";
import {
  DEFAULT_LOCALE,
  hasAtLeastRole,
  isLocale,
  isTopicId,
  slugSchema,
  type TopicId,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { LessonForm } from "../components/content/lesson-form";
import { apiFetch } from "../lib/api";
import { actionFailure, type ManagedLesson } from "../lib/content-admin";
import { jsonBody, syllabusAfterSave, parseLessonTranslation } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-lesson-new";

/** New lesson (plan §3.3 `/teacher/content`): created at the end of its topic. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const topicParam = new URL(request.url).searchParams.get("topicId");
  const topicId: TopicId = isTopicId(topicParam) ? topicParam : "voltage-drop";
  return { isAdmin: hasAtLeastRole(user.role, "admin"), topicId };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const slug = slugSchema.safeParse(String(form.get("slug") ?? ""));
  const topicId = String(form.get("topicId"));
  const translation = parseLessonTranslation(form, locale);

  // `new` would collide with this page's own URL.
  if (!slug.success || slug.data === "new") {
    return { errorCode: "VALIDATION_FAILED", fields: ["slug"] };
  }
  if (!translation.ok) {
    return translation.failure;
  }

  try {
    const { lessons } = await apiFetch<{ lessons: ManagedLesson[] }>(
      request,
      `/api/manage/lessons?locale=${locale}`,
    );
    const inTopic = lessons.filter((lesson) => lesson.topicId === topicId && !lesson.archivedAt);
    const position = inTopic.reduce((max, lesson) => Math.max(max, lesson.position + 1), 0);

    await apiFetch(request, "/api/lessons", {
      method: "POST",
      ...jsonBody({ topicId, slug: slug.data, position }),
    });
    await apiFetch(request, `/api/lessons/${encodeURIComponent(slug.data)}/translations`, {
      method: "PUT",
      ...jsonBody(translation.value),
    });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(syllabusAfterSave(locale, topicId));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [
    { labelKey: "nav.lessons", path: "syllabus" },
    { labelKey: "contentAdmin.lesson.new" },
  ],
};

export default function TeacherLessonNew() {
  const { t } = useTranslation();
  const { isAdmin, topicId } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;

  return (
    <Stack gap="lg" maw={760}>
      <Title order={2}>{t("contentAdmin.lesson.new")}</Title>
      <LessonForm
        isNew
        isAdmin={isAdmin}
        failure={failure}
        initial={{ slug: "", topicId, title: "", summary: "", body: "" }}
      />
    </Stack>
  );
}
