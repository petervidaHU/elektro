import { INTL_LOCALES, type Locale } from "./locales.js";

/**
 * Display formatting. Values are SI internally and only formatted at the edge,
 * with the locale's conventions (Hungarian uses a decimal comma: `2,5 mm²`).
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Narrow no-break space (U+202F), the SI separator between a number and its
 * unit. Written as an escape so it stays visible in the source.
 */
const UNIT_SEPARATOR = "\u202F";

/** Formats a value with its unit, e.g. `2,5 mm²` or `7,2 V`. */
export function formatQuantity(
  value: number,
  unit: string,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return `${formatNumber(value, locale, options)}${UNIT_SEPARATOR}${unit}`;
}

export function formatPercent(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    style: "percent",
    maximumFractionDigits: 2,
    ...options,
  }).format(value / 100);
}
