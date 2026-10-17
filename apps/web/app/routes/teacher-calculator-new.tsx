import { Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { redirect, useActionData, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isCalculatorId, isLocale } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { CalculatorForm } from "../components/content/calculator-form";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { actionFailure, type ManagedCalculators } from "../lib/content-admin";
import { jsonBody, parseCalculatorInput } from "../lib/content-admin-actions";
import { requireStaff } from "../lib/session";
import type { Route } from "./+types/teacher-calculator-new";

/** Lists a calculator that is implemented in code but not listed yet (plan Q21). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { available } = await apiFetch<ManagedCalculators>(
    request,
    `/api/manage/calculators?locale=${locale}`,
  );
  return { available };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const input = parseCalculatorInput(form, locale);

  if (!isCalculatorId(id)) {
    return { errorCode: "VALIDATION_FAILED", fields: ["id"] };
  }
  if (!input.ok) {
    return input.failure;
  }
  try {
    await apiFetch(request, "/api/calculators", { method: "POST", ...jsonBody({ ...input.value, id }) });
  } catch (error) {
    return actionFailure(error);
  }
  return redirect(localePath(locale, "teacher/content?tab=calculators&notice=saved"));
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [
    { labelKey: "contentAdmin.title", path: "teacher/content?tab=calculators" },
    { labelKey: "contentAdmin.calculator.new" },
  ],
};

export default function TeacherCalculatorNew() {
  const { t } = useTranslation();
  const { available } = useLoaderData<typeof loader>();
  const failure = useActionData<typeof action>() ?? undefined;
  const first = available[0];

  return (
    <Stack gap="lg" maw={760}>
      <Title order={2}>{t("contentAdmin.calculator.new")}</Title>
      <CalculatorForm
        available={available}
        failure={failure}
        initial={{
          id: first?.id ?? null,
          topicId: first?.defaultTopicId ?? "voltage-drop",
          published: false,
          title: "",
          description: "",
        }}
      />
    </Stack>
  );
}
