import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ReportButton } from "../components/report/report-button";
import { Link, useLoaderData, useParams, useSearchParams } from "react-router";
import { localePath } from "../i18n/locale";
import { CalcSteps } from "../components/calc-steps";
import { loadTopicLessons, TheoryLink } from "../components/calculators/theory-link";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { loadCalculator, type ListedCalculator } from "../lib/calculators";
import type { Route } from "./+types/voltage-drop";
import {
  calculateVoltageDrop,
  CalculationInputError,
  CONDUCTOR_MATERIALS,
  DEFAULT_LOCALE,
  formatNumber,
  formatPercent,
  formatQuantity,
  isLocale,
  readPrefill,
  RESISTIVITY_AT_OPERATING_TEMPERATURE,
  STANDARD_CROSS_SECTIONS_MM2,
  type ConductorMaterial,
  type PhaseSystem,
} from "@elektro/shared";

/**
 * Feszültségesés calculator.
 *
 * The maths lives in `packages/shared`, so this page only collects inputs and
 * formats the result - the API, SSR and the browser all run the same engine.
 *
 * Touch-first: the cross-section is a Select over the standard series and the
 * numeric fields have steppers, so the whole calculation can be done with
 * touch alone.
 */
/** Listed and published in the calculator registry, or 404 (plan Q21). */
export async function loader({ request, params }: Route.LoaderArgs) {
  return {
    calculator: await loadCalculator(request, String(params.locale), "voltage-drop"),
    lessons: await loadTopicLessons(request, String(params.locale), "voltage-drop"),
  };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const calculator = (data as { calculator?: ListedCalculator } | undefined)?.calculator;
    return [
      { labelKey: "nav.calculators", path: "calculators" },
      calculator?.title ? { label: calculator.title } : { labelKey: "calculators.voltageDrop.title" },
    ];
  },
};

export default function VoltageDrop() {
  const { t } = useTranslation();
  const { calculator, lessons } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const prefill = readPrefill("voltage-drop", searchParams);
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const [system, setSystem] = useState<PhaseSystem>((prefill["system"] as PhaseSystem | undefined) ?? "single-phase");
  const [material, setMaterial] = useState<ConductorMaterial>((prefill["material"] as ConductorMaterial | undefined) ?? "copper");
  const [current, setCurrent] = useState<number | string>(Number(prefill["current"] ?? 16));
  const [length, setLength] = useState<number | string>(Number(prefill["length"] ?? 25));
  const [crossSection, setCrossSection] = useState<string>(prefill["crossSection"] ?? "2.5");
  const [nominalVoltage, setNominalVoltage] = useState<number | string>(Number(prefill["nominalVoltage"] ?? (prefill["system"] === "three-phase" ? 400 : 230)));
  const [powerFactor, setPowerFactor] = useState<number | string>(Number(prefill["powerFactor"] ?? 1));

  const calculation = useMemo(() => {
    try {
      return {
        calc: calculateVoltageDrop({
          current_A: Number(current),
          length_m: Number(length),
          crossSection_mm2: Number(crossSection),
          resistivity_ohm_mm2_per_m: RESISTIVITY_AT_OPERATING_TEMPERATURE[material],
          nominalVoltage_V: Number(nominalVoltage),
          system,
          powerFactor: Number(powerFactor),
        }),
        error: null,
      };
    } catch (error) {
      if (error instanceof CalculationInputError) {
        return { calc: null, error };
      }
      throw error;
    }
  }, [current, length, crossSection, material, nominalVoltage, system, powerFactor]);

  return (
    <Stack gap="lg" maw={640}>
      <Title order={2}>{calculator.title ?? t("calculators.voltageDrop.title")}</Title>

      <Stack gap="md">
        <div>
          <Text fw={500} mb={4}>
            {t("calculators.voltageDrop.system")}
          </Text>
          <SegmentedControl
            value={system}
            onChange={(value) => {
              const next = value as PhaseSystem;
              setSystem(next);
              // The nominal voltage differs per system; keep them in step.
              setNominalVoltage(next === "three-phase" ? 400 : 230);
            }}
            data={[
              {
                value: "single-phase",
                label: t("calculators.voltageDrop.singlePhase"),
              },
              {
                value: "three-phase",
                label: t("calculators.voltageDrop.threePhase"),
              },
            ]}
          />
        </div>

        <div>
          <Text fw={500} mb={4}>
            {t("calculators.voltageDrop.material")}
          </Text>
          <SegmentedControl
            value={material}
            onChange={(value) => setMaterial(value as ConductorMaterial)}
            data={CONDUCTOR_MATERIALS.map((item) => ({
              value: item,
              label: t(`calculators.voltageDrop.${item}`),
            }))}
          />
        </div>

        <NumberInput
          label={t("calculators.voltageDrop.current")}
          suffix={` ${t("unit.ampere")}`}
          value={current}
          onChange={setCurrent}
          min={0}
          step={1}
          decimalScale={1}
          decimalSeparator=","
        />

        <NumberInput
          label={t("calculators.voltageDrop.length")}
          suffix={` ${t("unit.metre")}`}
          value={length}
          onChange={setLength}
          min={0}
          step={1}
          decimalScale={1}
          decimalSeparator=","
        />

        <Select
          label={t("calculators.voltageDrop.crossSection")}
          value={crossSection}
          onChange={(value) => setCrossSection(value ?? "2.5")}
          allowDeselect={false}
          data={STANDARD_CROSS_SECTIONS_MM2.map((size) => ({
            value: String(size),
            label: formatQuantity(size, t("unit.squareMillimetre"), locale),
          }))}
        />

        <NumberInput
          label={t("calculators.voltageDrop.nominalVoltage")}
          suffix={` ${t("unit.volt")}`}
          value={nominalVoltage}
          onChange={setNominalVoltage}
          min={0}
          step={10}
          decimalScale={0}
        />

        <NumberInput
          label={t("calculators.voltageDrop.powerFactor")}
          value={powerFactor}
          onChange={setPowerFactor}
          min={0}
          max={1}
          step={0.05}
          decimalScale={2}
          decimalSeparator=","
        />
      </Stack>

      {calculation.calc === null ? (
        <Alert color="red" variant="light">
          {t("calculators.voltageDrop.invalidInput")}
        </Alert>
      ) : (
        <Card withBorder padding="lg" radius="md" data-testid="calculator-result">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("calculators.voltageDrop.result")}
            </Text>
            <Title order={3}>
              {formatQuantity(calculation.calc.result.voltageDrop_V, t("unit.volt"), locale, {
                maximumFractionDigits: 2,
              })}
            </Title>

            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {t("calculators.voltageDrop.resultPercent")}:
              </Text>
              <Text size="sm" fw={600}>
                {formatPercent(calculation.calc.result.voltageDropPercent, locale)}
              </Text>
            </Group>

            <Divider my="xs" />

            <Text size="sm" c="dimmed">
              {t("calculators.voltageDrop.steps")}
            </Text>
            <CalcSteps steps={calculation.calc.steps} locale={locale} />
          </Stack>
        </Card>
      )}

      <Alert variant="light" color="blue">
        {t("calculators.voltageDrop.limitNote")}
      </Alert>

      {/* Plan §2.4: the resistivity convention is undecided, so it is stated. */}
      <Alert variant="light" color="yellow" data-testid="resistivity-warning">
        {t("calculators.voltageDrop.resistivityWarning", {
          copper: formatNumber(RESISTIVITY_AT_OPERATING_TEMPERATURE.copper, locale, { maximumFractionDigits: 4 }),
          aluminium: formatNumber(RESISTIVITY_AT_OPERATING_TEMPERATURE.aluminium, locale, { maximumFractionDigits: 4 }),
        })}
      </Alert>

      <Button component={Link} to={localePath(locale, "practice/voltage-drop")} variant="light">
        {t("calculators.voltageDrop.practice")}
      </Button>
      <TheoryLink topicId="voltage-drop" lessons={lessons} />
      <ReportButton targetKind="calculator" targetId="voltage-drop" />
    </Stack>
  );
}
