import type { ReactNode } from "react";
import { Alert, Card, Divider, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CalculationInputError, type CalcStep, type Locale } from "@elektro/shared";
import { CalcSteps } from "../calc-steps";

/** A number field with steppers, so every calculator works with touch only. */
export function NumField(props: {
  label: string;
  unit?: string;
  value: number | string;
  onChange: (value: number | string) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
}) {
  return (
    <NumberInput
      label={props.label}
      suffix={props.unit ? ` ${props.unit}` : undefined}
      value={props.value}
      onChange={props.onChange}
      min={props.min ?? 0}
      max={props.max}
      step={props.step ?? 1}
      decimalScale={props.decimals ?? 3}
      decimalSeparator=","
      allowNegative={false}
    />
  );
}

/** Runs an engine call; invalid input becomes `null` instead of an exception. */
export function attempt<T>(run: () => T): T | null {
  try {
    return run();
  } catch (error) {
    if (error instanceof CalculationInputError) return null;
    throw error;
  }
}

/** The result card shared by all calculators: headline values plus every step. */
export function ResultCard({
  outcome,
  steps,
  locale,
  children,
}: {
  outcome: unknown;
  steps: CalcStep[];
  locale: Locale;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (outcome === null) {
    return (
      <Alert color="red" variant="light">
        {t("calculators.invalidInput")}
      </Alert>
    );
  }
  return (
    <Card withBorder padding="lg" radius="md" data-testid="calculator-result">
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {t("calculators.result")}
        </Text>
        <Title order={3} component="div">
          {children}
        </Title>
        {steps.length > 0 && (
          <>
            <Divider my="xs" />
            <Text size="sm" c="dimmed">
              {t("calculators.steps")}
            </Text>
            <CalcSteps steps={steps} locale={locale} />
          </>
        )}
      </Stack>
    </Card>
  );
}
