import type { TFunction } from "i18next";
import {
  formatNumber,
  formatPercent,
  formatQuantity,
  type Given,
  type Locale,
  type StepKind,
  type TaskParams,
  type Tolerance,
  type Unit,
} from "@elektro/shared";

/** Enough precision to retrace a hand calculation, without float noise. */
const PRECISION = { maximumSignificantDigits: 4 } as const;

/** A value with its unit, in the locale's notation ("7,2 V", "3,13%"). */
export function formatStepValue(value: number, unit: Unit, locale: Locale, t: TFunction): string {
  switch (unit) {
    case "dimensionless":
      return formatNumber(value, locale, PRECISION);
    case "percent":
      return formatPercent(value, locale, PRECISION);
    default:
      return formatQuantity(value, t(`unit.${unit}`), locale, PRECISION);
  }
}

/**
 * The accepted deviation shown under an answer (plan decision Q4), e.g. "1%"
 * or "0,05 százalékpont"; null for exact choices.
 */
export function formatTolerance(
  tolerance: Tolerance,
  locale: Locale,
  t: TFunction,
  kind?: StepKind,
): string | null {
  if (tolerance.relative) {
    return formatPercent(tolerance.relative * 100, locale);
  }
  if (tolerance.absolute) {
    const value = formatNumber(tolerance.absolute, locale);
    return kind === "percent" ? `${value} ${t("practice.percentagePoint")}` : value;
  }
  return null;
}

/** Interpolation values for a task's scenario text. */
export function scenarioValues(
  givens: readonly Given[],
  params: TaskParams,
  locale: Locale,
  t: TFunction,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const given of givens) {
    values[given.id] = formatStepValue(given.value, given.unit, locale, t);
  }
  if (typeof params["material"] === "string") {
    values["material"] = t(`material.${params["material"]}`);
  }
  return values;
}
