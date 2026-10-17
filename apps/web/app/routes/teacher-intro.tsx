import { Alert, Button, Stack, Text, Textarea, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { DEFAULT_LOCALE, hasAtLeastRole, isLocale, isTopicId, upsertTopicIntroSchema } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { FormError } from "../components/content/form-error";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { actionFailure } from "../lib/content-admin";
import { jsonBody } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-intro";

/** Edit a topic intro: a teacher's save is a draft for review, an admin's goes live (Q22). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const topicId = String(params.topicId);
  if (!isTopicId(topicId)) throw new Response(null, { status: 404 });
  const { intro } = await apiFetch<{ intro: { version: number; text: string; status: string } | null }>(
    request,
    `/api/topic-intros/${topicId}?locale=${locale}`,
  );
  return { topicId, isAdmin: hasAtLeastRole(user.role, "admin"), text: intro?.text ?? "", version: intro?.version ?? null };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const body = { locale, text: String(form.get("text") ?? "") };
  const parsed = upsertTopicIntroSchema.safeParse(body);
  if (!parsed.success) {
    return { errorCode: "VALIDATION_FAILED", fields: ["text"] };
  }
  try {
    await apiFetch(request, `/api/topic-intros/${encodeURIComponent(String(params.topicId))}`, { method: "PUT", ...jsonBody(parsed.data) });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(localePath(locale, "teacher/intros"));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const topicId = (data as { topicId?: string } | undefined)?.topicId;
    return [{ labelKey: "intros.title", path: "teacher/intros" }, topicId ? { labelKey: `topic.${topicId}` } : { labelKey: "intros.edit" }];
  },
};

export default function TeacherIntro() {
  const { t } = useTranslation();
  const { topicId, isAdmin, text, version } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;
  const navigation = useNavigation();

  return (
    <Stack gap="lg" maw={720}>
      <Title order={2}>{t(`topic.${topicId}`)}</Title>
      {version !== null && <Text size="sm" c="dimmed">{t("review.version", { version })}</Text>}
      <Alert variant="light" color={isAdmin ? "green" : "blue"} role="note">
        {isAdmin ? t("contentAdmin.lesson.publishesDirectly") : t("contentAdmin.lesson.savesDraft")}
      </Alert>
      <Form method="post">
        <Stack gap="md">
          <FormError failure={failure} />
          <Textarea name="text" label={t("intros.text")} description={t("intros.textHint")} defaultValue={text} autosize minRows={4} required />
          <Button type="submit" loading={navigation.state === "submitting"}>
            {isAdmin ? t("contentAdmin.savePublish") : t("contentAdmin.saveDraft")}
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}
