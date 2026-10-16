import type { Locale } from "@elektro/shared";
import { localePath } from "../i18n/locale";

const AUTH_PAGES = ["login", "register"];

/**
 * Where to go after logging in or registering. Only an in-app path of the
 * current locale is accepted - anything else (another host, `//host`,
 * backslashes, another locale) falls back to the locale home, so the
 * `returnTo` parameter can never be used as an open redirect.
 */
export function safeReturnTo(value: string | null | undefined, locale: Locale): string {
  const home = localePath(locale);

  if (!value || value.includes("\\")) {
    return home;
  }

  const prefix = `/${locale}`;
  const isSameLocale = value === prefix || /^[/?#]/.test(value.slice(prefix.length));
  if (!value.startsWith(prefix) || !isSameLocale) {
    return home;
  }

  const firstSegment = value.slice(prefix.length + 1).split(/[/?#]/)[0] ?? "";
  if (AUTH_PAGES.includes(firstSegment)) {
    return home;
  }

  return value;
}

function authPagePath(locale: Locale, page: string, returnTo?: string): string {
  const path = localePath(locale, page);
  const target = safeReturnTo(returnTo, locale);
  return target === localePath(locale)
    ? path
    : `${path}?${new URLSearchParams({ returnTo: target }).toString()}`;
}

/** Login page that comes back to `returnTo` afterwards. */
export function loginPath(locale: Locale, returnTo?: string): string {
  return authPagePath(locale, "login", returnTo);
}

/** Registration page that comes back to `returnTo` afterwards. */
export function registerPath(locale: Locale, returnTo?: string): string {
  return authPagePath(locale, "register", returnTo);
}
