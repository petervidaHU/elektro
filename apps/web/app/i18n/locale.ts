import { DEFAULT_LOCALE, isLocale, type Locale } from "@elektro/shared";

/**
 * URLs carry the locale (`/hu/...`), so it is read from the path - never from
 * a header or a cookie - and the same value drives `<html lang>`, `Intl`
 * formatting and the i18next instance.
 */
export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

/** Prefixes a path with the active locale: `localePath("hu", "lessons")`. */
export function localePath(locale: Locale, path = ""): string {
  const suffix = path.replace(/^\/+/, "");
  return suffix ? `/${locale}/${suffix}` : `/${locale}`;
}
