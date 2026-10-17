import { Button, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { hasPractice, isCalculatorId, readPrefill, type CalculatorId } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { loadTopicLessons, TheoryLink } from "../components/calculators/theory-link";
import { P2_CALCULATORS } from "../components/calculators/p2-calculators";
import { PHYSICS_CALCULATORS } from "../components/calculators/physics-calculators";
import { ReportButton } from "../components/report/report-button";
import { localePath } from "../i18n/locale";
import { loadCalculator, type ListedCalculator } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/calculator";

const PAGES = { ...PHYSICS_CALCULATORS, ...P2_CALCULATORS };

/**
 * The physics calculators (plan §2.2, K7) share one route; the maths is in
 * `packages/shared`. A calculator without a page here, or one that is not
 * listed and published in the registry, answers 404 (voltage drop has its own
 * page).
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const id = String(params.calculatorId);
  if (!isCalculatorId(id) || !PAGES[id]) {
    throw new Response(null, { status: 404 });
  }
  const calculator = await loadCalculator(request, String(params.locale), id);
  return {
    id: id as CalculatorId,
    calculator,
    lessons: await loadTopicLessons(request, String(params.locale), calculator.topicId),
  };
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
  const { id, calculator, lessons } = useLoaderData<typeof loader>();
  const render = PAGES[id]!;
  const [searchParams] = useSearchParams();
  const prefill = readPrefill(id, searchParams);

  return (
    <Stack gap="lg" maw={640}>
      <Title order={2}>{calculator.title}</Title>
      {/* A new query string (another lesson example) starts the calculator afresh. */}
      <div key={searchParams.toString()}>{render({ locale, prefill })}</div>
      <TheoryLink topicId={calculator.topicId} lessons={lessons} />
      {hasPractice(calculator.topicId) && (
        <Button component={Link} to={localePath(locale, `practice/${calculator.topicId}`)} variant="light">
          {t("calculators.practice")}
        </Button>
      )}
      <ReportButton targetKind="calculator" targetId={id} />
    </Stack>
  );
}
