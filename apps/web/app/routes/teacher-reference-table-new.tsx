import { Button, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { FormError } from "../components/content/form-error";
import { TableEditor } from "../components/reference/table-editor";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { actionFailure } from "../lib/content-admin";
import { jsonBody } from "../lib/content-admin-actions";
import { parseNewTable } from "../lib/reference-table-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-reference-table-new";

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  return null;
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const parsed = parseNewTable(await request.formData());
  if (!parsed.ok) {
    return parsed.failure;
  }
  try {
    await apiFetch(request, "/api/reference-tables", { method: "POST", ...jsonBody(parsed.value) });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(localePath(locale, `teacher/reference-tables/${parsed.value.key}`));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [
    { labelKey: "referenceTables.title", path: "teacher/reference-tables" },
    { labelKey: "referenceTables.new" },
  ],
};

export default function TeacherReferenceTableNew() {
  const { t } = useTranslation();
  const failure = useActionData<typeof action>() ?? undefined;
  const navigation = useNavigation();

  return (
    <Stack gap="lg" maw={760}>
      <Title order={2}>{t("referenceTables.new")}</Title>
      <Form method="post">
        <Stack gap="md">
          <FormError failure={failure} />
          <TextInput name="key" label={t("referenceTables.editor.key")} description={t("referenceTables.editor.keyHint")} required />
          <TextInput name="title" label={t("referenceTables.editor.titleLabel")} required />
          <Textarea name="source" label={t("referenceTables.editor.source")} description={t("referenceTables.editor.sourceHint")} autosize minRows={2} required />
          <TableEditor
            initial={{ columns: [{ id: "c1", label: "" }, { id: "c2", label: "" }], rows: [["", ""]] }}
          />
          <Button type="submit" loading={navigation.state === "submitting"}>
            {t("referenceTables.editor.create")}
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}
