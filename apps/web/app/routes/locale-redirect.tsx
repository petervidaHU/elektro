import { redirect } from "react-router";
import { DEFAULT_LOCALE } from "@elektro/shared";
import { localePath } from "../i18n/locale";

/** `/` has no locale, so it redirects to the default one. */
export function loader() {
  return redirect(localePath(DEFAULT_LOCALE));
}

export default function LocaleRedirect() {
  return null;
}
