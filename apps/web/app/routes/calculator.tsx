import { Button, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { hasPractice, isCalculatorId, type CalculatorId } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { PHYSICS_CALCULATORS } from "../components/calculators/physics-calculators";
import { ReportButton } from "../components/report/report-button";
import { localePath } from "../i18n/locale";
import { loadCalculator, type ListedCalculator } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/calculator";

/**
 * The physics calculators (plan §2.2, K7) share one route; the maths is in
 * `packages/shared`. A calculator without a page here, or one that is not
 * listed and published in the registry, answers 404 (voltage drop has its own
 * page).
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const id = String(params.calculatorId);
  if (!isCalculatorId(id) || !PHYSICS_CALCULATORS[id]) {
    throw new Response(null, { status: 404 });
  }
  return { id: id as CalculatorId, calculator: await loadCalculator(request, String(params.locale), id) };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const calculator = (data as { calculator?: ListedCalculator } | undefined)?.calculator;
    return [{ labelKey: "nav.calculators", path: "calculators" }, { label: calculator?.title ?? "" }];
  },
};

export default function CalculatorPage() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { id, calculator } = useLoaderData<typeof loader>();
  const render = PHYSICS_CALCULATORS[id]!;

  return (
    <Stack gap="lg" maw={640}>
      <Title order={2}>{calculator.title}</Title>
      {render({ locale })}
      {hasPractice(calculator.topicId) && (
        <Button component={Link} to={localePath(locale, `practice/${calculator.topicId}`)} variant="light">
          {t("calculators.practice")}
        </Button>
      )}
      <ReportButton targetKind="calculator" targetId={id} />
    </Stack>
  );
}
