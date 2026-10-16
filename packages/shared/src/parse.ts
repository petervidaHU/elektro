import { INTL_LOCALES, type Locale } from "./locales.js";

/**
 * Number input, the counterpart of `format.ts`: students type (or tap) numbers
 * with their locale's decimal separator (Hungarian: `2,5`).
 */
export function decimalSeparator(locale: Locale): string {
  const part = new Intl.NumberFormat(INTL_LOCALES[locale])
    .formatToParts(1.5)
    .find((item) => item.type === "decimal");
  return part?.value ?? ".";
}

/** Plain digits with at most one decimal point, optionally negative. */
const NORMALISED_NUMBER = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;

/**
 * Parses a number typed in the given locale, or returns `null` when the text
 * is not a complete number (`""`, `"-"`, `"2,"`).
 *
 * The locale's decimal separator is accepted, and so is `.` - students on an
 * English keyboard type it. Digit groups may be separated by spaces, which is
 * how Hungarian groups thousands; `.` and `,` are never treated as group
 * separators, so `"2,5"` is always two and a half.
 */
export function parseLocaleNumber(text: string, locale: Locale): number | null {
  const separator = decimalSeparator(locale);
  const normalised = text
    .replace(/[\s\u00a0\u202f]/g, "")
    .split(separator)
    .join(".");

  if (!NORMALISED_NUMBER.test(normalised)) {
    return null;
  }

  const value = Number(normalised);
  return Number.isFinite(value) ? value : null;
}
