import { Alert, Button, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { createGlossaryTermSchema, DEFAULT_LOCALE, hasAtLeastRole, isLocale, upsertGlossaryTranslationSchema } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { FormError } from "../components/content/form-error";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { actionFailure } from "../lib/content-admin";
import { jsonBody } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-glossary-term";

const NEW = "new";

/** New term (`/teacher/glossary/new`) or edit (`/teacher/glossary/:key`). A teacher's save is a draft; an admin's goes live (Q22). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const key = String(params.key);
  const isAdmin = hasAtLeastRole(user.role, "admin");
  if (key === NEW) {
    return { isAdmin, key: null, term: "", definition: "", version: null as number | null };
  }
  try {
    const { terms } = await apiFetch<{ terms: { key: string; term: string; definition: string; status: string }[] }>(request, `/api/glossary?locale=${locale}`);
    const found = terms.find((item) => item.key === key);
    if (!found) throw new Response(null, { status: 404 });
    const review = await apiFetch<{ latest: { version: number } }>(request, `/api/manage/glossary/${encodeURIComponent(key)}/review?locale=${locale}`);
    return { isAdmin, key, term: found.term, definition: found.definition, version: review.latest.version as number | null };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw new Response(null, { status: 404 });
    throw error;
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const text = (name: string) => String(form.get(name) ?? "");
  const routeKey = String(params.key);

  const fail = (schema: { safeParse: (value: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[] }[] } } }, value: unknown) => {
    const result = schema.safeParse(value);
    return result.success
      ? null
      : { errorCode: "VALIDATION_FAILED", fields: [...new Set((result.error?.issues ?? []).map((issue) => String(issue.path[0] ?? "_")))] };
  };

  try {
    if (routeKey === NEW) {
      const body = { key: text("key"), locale, term: text("term"), definition: text("definition") };
      const invalid = fail(createGlossaryTermSchema, body) ?? (body.key === NEW ? { errorCode: "VALIDATION_FAILED", fields: ["key"] } : null);
      if (invalid) return invalid;
      await apiFetch(request, "/api/glossary", { method: "POST", ...jsonBody(body) });
    } else {
      const body = { locale, term: text("term"), definition: text("definition") };
      const invalid = fail(upsertGlossaryTranslationSchema, body);
      if (invalid) return invalid;
      await apiFetch(request, `/api/glossary/${encodeURIComponent(routeKey)}/translations`, { method: "PUT", ...jsonBody(body) });
    }
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(localePath(locale, "teacher/glossary"));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [
    { labelKey: "glossary.manage.title", path: "teacher/glossary" },
    { labelKey: "glossary.manage.edit" },
  ],
};

export default function TeacherGlossaryTerm() {
  const { t } = useTranslation();
  const { isAdmin, key, term, definition, version } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;
  const navigation = useNavigation();

  return (
    <Stack gap="lg" maw={720}>
      <Title order={2}>{key === null ? t("glossary.manage.new") : t("glossary.manage.edit")}</Title>
      {key !== null && version !== null && (
        <Text size="sm" c="dimmed">{t("review.version", { version })}</Text>
      )}
      <Alert variant="light" color={isAdmin ? "green" : "blue"} role="note">
        {isAdmin ? t("contentAdmin.lesson.publishesDirectly") : t("contentAdmin.lesson.savesDraft")}
      </Alert>
      <Form method="post">
        <Stack gap="md">
          <FormError failure={failure} />
          {key === null && <TextInput name="key" label={t("glossary.manage.key")} description={t("glossary.manage.keyHint")} required />}
          <TextInput name="term" label={t("glossary.manage.term")} defaultValue={term} required />
          <Textarea name="definition" label={t("glossary.manage.definition")} defaultValue={definition} autosize minRows={4} required />
          <Button type="submit" loading={navigation.state === "submitting"}>
            {isAdmin ? t("contentAdmin.savePublish") : t("contentAdmin.saveDraft")}
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}

