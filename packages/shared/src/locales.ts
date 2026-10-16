/**
 * Supported UI/content locales.
 *
 * v1 ships Hungarian only, but nothing in the schema or the code may assume a
 * single language: locales are always carried explicitly (URL segment, content
 * translation rows, approval records).
 */
export const LOCALES = ["hu"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "hu";

/** BCP 47 tags used for `Intl` formatting, per app locale. */
export const INTL_LOCALES: Record<Locale, string> = {
  hu: "hu-HU",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
