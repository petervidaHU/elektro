import { Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { redirect, useActionData, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, hasAtLeastRole, isLocale, type TopicId } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { LessonForm, type LessonFormValues } from "../components/content/lesson-form";
import { ApiError, apiFetch } from "../lib/api";
import { actionFailure, type ManagedLesson } from "../lib/content-admin";
import { jsonBody, syllabusAfterSave, parseLessonTranslation } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-lesson-edit";

interface LessonText {
  topicId: TopicId;
  title: string;
  summary: string | null;
  body: string;
  version: number;
}

/**
 * Edit a lesson: its topic, and its text in the page's locale. Saving an
 * approved lesson creates a new version (plan §2.6); a teacher's save is a
 * draft for review, an admin's goes live directly (Q22).
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const slug = String(params.slug);
  const isAdmin = hasAtLeastRole(user.role, "admin");

  try {
    // Teachers and admins get the newest version, drafts included.
    const { lesson } = await apiFetch<{ lesson: LessonText }>(
      request,
      `/api/lessons/${encodeURIComponent(slug)}?locale=${locale}`,
    );
    const values: LessonFormValues = {
      slug,
      topicId: lesson.topicId,
      title: lesson.title,
      summary: lesson.summary ?? "",
      body: lesson.body,
    };
    return { isAdmin, values, version: lesson.version as number | null };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
  }

  // No text in this locale yet: the lesson may still exist.
  const { lessons } = await apiFetch<{ lessons: ManagedLesson[] }>(
    request,
    `/api/manage/lessons?locale=${locale}`,
  );
  const lesson = lessons.find((item) => item.slug === slug && !item.archivedAt);
  if (!lesson) {
    throw new Response(null, { status: 404 });
  }
  const values: LessonFormValues = { slug, topicId: lesson.topicId, title: "", summary: "", body: "" };
  return { isAdmin, values, version: null };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const slug = String(params.slug);
  const form = await request.formData();
  const topicId = String(form.get("topicId"));
  const translation = parseLessonTranslation(form, locale);
  if (!translation.ok) {
    return translation.failure;
  }

  try {
    // PATCH is a no-op when the topic did not change.
    await apiFetch(request, `/api/lessons/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      ...jsonBody({ topicId }),
    });
    await apiFetch(request, `/api/lessons/${encodeURIComponent(slug)}/translations`, {
      method: "PUT",
      ...jsonBody(translation.value),
    });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(syllabusAfterSave(locale, topicId));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const values = (data as { values?: LessonFormValues } | undefined)?.values;
    return [
      { labelKey: "nav.lessons", path: "syllabus" },
      values?.title ? { label: values.title } : { labelKey: "contentAdmin.edit" },
    ];
  },
};

export default function TeacherLessonEdit() {
  const { t } = useTranslation();
  const { isAdmin, values, version } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;

  return (
    <Stack gap="lg" maw={760}>
      <Stack gap={4}>
        <Title order={2}>{t("contentAdmin.lesson.edit")}</Title>
        <Text size="sm" c="dimmed" style={{ overflowWrap: "anywhere" }}>
          {version === null
            ? t("contentAdmin.lesson.editingNew", { slug: values.slug })
            : t("contentAdmin.lesson.editing", { slug: values.slug, version })}
        </Text>
      </Stack>
      <LessonForm key={values.slug} isNew={false} isAdmin={isAdmin} failure={failure} initial={values} />
    </Stack>
  );
}
