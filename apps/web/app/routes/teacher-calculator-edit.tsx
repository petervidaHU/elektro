import { Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { redirect, useActionData, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isCalculatorId, isLocale } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { CalculatorForm, type CalculatorFormValues } from "../components/content/calculator-form";
import { apiFetch } from "../lib/api";
import { actionFailure, type ManagedCalculators } from "../lib/content-admin";
import { jsonBody, syllabusAfterSave, parseCalculatorInput } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-calculator-edit";

/** Edit a listed calculator: topic, visibility, texts in the page's locale. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { calculators } = await apiFetch<ManagedCalculators>(
    request,
    `/api/manage/calculators?locale=${locale}`,
  );
  const calculator = calculators.find((item) => item.id === params.id);
  if (!calculator) {
    throw new Response(null, { status: 404 });
  }
  const values: CalculatorFormValues = {
    id: calculator.id,
    topicId: calculator.topicId,
    published: calculator.published,
    title: calculator.title ?? "",
    description: calculator.description ?? "",
  };
  return { values };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  if (!isCalculatorId(params.id)) {
    throw new Response(null, { status: 404 });
  }
  const input = parseCalculatorInput(await request.formData(), locale);
  if (!input.ok) {
    return input.failure;
  }
  try {
    await apiFetch(request, `/api/calculators/${params.id}`, { method: "PUT", ...jsonBody(input.value) });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(syllabusAfterSave(locale, input.value.topicId));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const values = (data as { values?: CalculatorFormValues } | undefined)?.values;
    return [
      { labelKey: "nav.lessons", path: "syllabus" },
      values?.title ? { label: values.title } : { labelKey: "contentAdmin.edit" },
    ];
  },
};

export default function TeacherCalculatorEdit() {
  const { t } = useTranslation();
  const { values } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;

  return (
    <Stack gap="lg" maw={760}>
      <Stack gap={4}>
        <Title order={2}>{t("contentAdmin.calculator.edit")}</Title>
        <Text size="sm" c="dimmed">
          {values.id}
        </Text>
      </Stack>
      <CalculatorForm key={values.id} failure={failure} initial={values} />
    </Stack>
  );
}
