import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  Code,
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
import { useParams } from "react-router";
import {
  calculateVoltageDrop,
  CalculationInputError,
  CONDUCTOR_MATERIALS,
  DEFAULT_LOCALE,
  formatPercent,
  formatQuantity,
  isLocale,
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
export default function VoltageDrop() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const [system, setSystem] = useState<PhaseSystem>("single-phase");
  const [material, setMaterial] = useState<ConductorMaterial>("copper");
  const [current, setCurrent] = useState<number | string>(16);
  const [length, setLength] = useState<number | string>(25);
  const [crossSection, setCrossSection] = useState<string>("2.5");
  const [nominalVoltage, setNominalVoltage] = useState<number | string>(230);
  const [powerFactor, setPowerFactor] = useState<number | string>(1);

  const calculation = useMemo(() => {
    try {
      return {
        result: calculateVoltageDrop({
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
        return { result: null, error };
      }
      throw error;
    }
  }, [current, length, crossSection, material, nominalVoltage, system, powerFactor]);

  return (
    <Stack gap="lg" maw={640}>
      <Title order={2}>{t("calculators.voltageDrop.title")}</Title>

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

      {calculation.error ? (
        <Alert color="red" variant="light">
          {t("calculators.voltageDrop.invalidInput")}
        </Alert>
      ) : (
        <Card withBorder padding="lg" radius="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("calculators.voltageDrop.result")}
            </Text>
            <Title order={3}>
              {formatQuantity(calculation.result.voltageDrop_V, t("unit.volt"), locale, {
                maximumFractionDigits: 2,
              })}
            </Title>

            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {t("calculators.voltageDrop.resultPercent")}:
              </Text>
              <Text size="sm" fw={600}>
                {formatPercent(calculation.result.voltageDropPercent, locale)}
              </Text>
            </Group>

            <Divider my="xs" />

            <Text size="sm" c="dimmed">
              {t("calculators.voltageDrop.formula")}
            </Text>
            <Code block>
              {system === "single-phase"
                ? "ΔU = 2 · ρ · (L / S) · I · cos φ"
                : "ΔU = √3 · ρ · (L / S) · I · cos φ"}
            </Code>
          </Stack>
        </Card>
      )}

      <Alert variant="light" color="blue">
        {t("calculators.voltageDrop.limitNote")}
      </Alert>
    </Stack>
  );
}
