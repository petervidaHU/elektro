import { Code, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  formatNumber,
  formatPercent,
  formatQuantity,
  FORMULAS,
  type CalcStep,
  type Locale,
} from "@elektro/shared";

/** Enough precision to retrace a hand calculation, without float noise. */
const PRECISION = { maximumSignificantDigits: 4 } as const;

/**
 * The intermediate steps of a calculation, each with its formula from the
 * shared registry and its value (docs/DEVELOPMENT_PLAN.md §2.1). Practice
 * tasks will ask for exactly these steps.
 */
export function CalcSteps({ steps, locale }: { steps: CalcStep[]; locale: Locale }) {
  const { t } = useTranslation();

  const formatValue = (step: CalcStep): string => {
    switch (step.unit) {
      case "dimensionless":
        return formatNumber(step.value, locale, PRECISION);
      case "percent":
        return formatPercent(step.value, locale, PRECISION);
      default:
        return formatQuantity(step.value, t(`unit.${step.unit}`), locale, PRECISION);
    }
  };

  return (
    <Stack gap="sm" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {steps.map((step) => (
        <Stack key={step.id} gap={4} component="li">
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text size="sm">{t(`calcStep.${step.id}`)}</Text>
            <Text size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
              {formatValue(step)}
            </Text>
          </Group>
          <Code>{FORMULAS[step.formulaId].expression}</Code>
        </Stack>
      ))}
    </Stack>
  );
}
