import { redirect } from "react-router";
import { DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import type { Route } from "./+types/teacher-content";

/**
 * The content list now lives on the syllabus page (plan U14); old links to
 * `/teacher/content` land there.
 */
export function loader({ params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return redirect(localePath(locale, "syllabus"));
}
