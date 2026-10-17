import { INTL_LOCALES, LOCALE_TIME_ZONES, type Locale } from "./locales.js";

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

/** Date and time of a timestamp, e.g. `2026. okt. 17. 9:49`. */
export function formatDateTime(value: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: LOCALE_TIME_ZONES[locale],
  }).format(typeof value === "string" ? new Date(value) : value);
}

const SI_PREFIXES = [
  { exponent: -12, symbol: "p" },
  { exponent: -9, symbol: "n" },
  { exponent: -6, symbol: "µ" },
  { exponent: -3, symbol: "m" },
  { exponent: 0, symbol: "" },
  { exponent: 3, symbol: "k" },
  { exponent: 6, symbol: "M" },
  { exponent: 9, symbol: "G" },
] as const;

/**
 * A value with the SI prefix that keeps the number readable (`100 µF`,
 * `2,5 mH`, `4,7 kΩ`), three significant digits. For quantities where the base
 * unit is rarely a sensible size: capacitance, inductance, time constants.
 */
export function formatEngineering(value: number, unitSymbol: string, locale: Locale): string {
  if (value === 0 || !Number.isFinite(value)) {
    return formatQuantity(value, unitSymbol, locale);
  }
  const magnitude = Math.abs(value);
  const prefix =
    [...SI_PREFIXES].reverse().find((item) => magnitude >= 10 ** item.exponent * 0.9995) ?? SI_PREFIXES[0];
  return formatQuantity(value / 10 ** prefix.exponent, `${prefix.symbol}${unitSymbol}`, locale, {
    maximumSignificantDigits: 3,
  });
}
