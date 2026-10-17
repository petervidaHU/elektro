import type { ReactNode } from "react";
import { Alert, Card, Divider, NumberInput, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CalculationInputError, formatEngineering, formatQuantity, type CalcStep, type Locale } from "@elektro/shared";
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

export interface Props {
  locale: Locale;
  /** Pre-filled inputs from a lesson example (validated by `readPrefill`). */
  prefill: Record<string, string>;
}

/** A pre-filled number, or the default. */
export const pn = (prefill: Record<string, string>, key: string, fallback: number): number =>
  prefill[key] === undefined ? fallback : Number(prefill[key].replace(",", "."));
/** A pre-filled choice, or the default; the value was checked against the calculator's spec. */
export const pc = <T extends string>(prefill: Record<string, string>, key: string, fallback: T): T =>
  (prefill[key] as T | undefined) ?? fallback;

export const num = (value: number | string) => (value === "" ? Number.NaN : Number(value));
export const optional = (value: number | string) => (value === "" || Number(value) === 0 ? undefined : Number(value));

/** Quantity formatter bound to the unit labels and the locale. */
export function useQ(locale: Locale) {
  const { t } = useTranslation();
  return (value: number, unit: string, digits = 4) =>
    formatQuantity(value, t(`unit.${unit}`), locale, { maximumSignificantDigits: digits });
}

/** Like `useQ`, with an SI prefix (µF, mH, kΩ): for capacitance, inductance, times. */
export function useEng(locale: Locale) {
  const { t } = useTranslation();
  return (value: number, unit: string) => formatEngineering(value, t(`unit.${unit}`), locale);
}

export function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <Text fw={500} mb={4}>
        {label}
      </Text>
      <SegmentedControl fullWidth value={value} onChange={(next) => onChange(next as T)} data={options} />
    </div>
  );
}
