import { redirect } from "react-router";
import { DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import { apiUrl, forwardedHeaders } from "../lib/api";
import { forwardSetCookies } from "../lib/session";
import type { Route } from "./+types/logout";

/**
 * Signs out through better-auth and forwards the cookie that clears the
 * session. POST only (a form button), so a link or prefetch can never log
 * anyone out.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const response = await fetch(apiUrl("/api/auth/sign-out"), {
    method: "POST",
    headers: { ...forwardedHeaders(request), "content-type": "application/json" },
    body: "{}",
  });

  return redirect(localePath(locale), { headers: forwardSetCookies(response) });
}

/** A GET lands here only by typing the URL: send it home. */
export function loader({ params }: Route.LoaderArgs) {
  return redirect(localePath(isLocale(params.locale) ? params.locale : DEFAULT_LOCALE));
}
