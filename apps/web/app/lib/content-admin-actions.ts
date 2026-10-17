import {
  calculatorInputSchema,
  getTopic,
  isTopicId,
  upsertLessonTranslationSchema,
  type CalculatorInput,
  type Locale,
  type UpsertLessonTranslationInput,
} from "@elektro/shared";
import { localePath } from "../i18n/locale";
import type { ActionFailure } from "./content-admin";

/**
 * Form parsing for the content pages, checked with the same shared zod schemas
 * the API uses, so an invalid lesson body is reported before anything is saved.
 */
type Parsed<T> = { ok: true; value: T } | { ok: false; failure: ActionFailure };

function failure(error: { issues: { path: PropertyKey[] }[] }): { ok: false; failure: ActionFailure } {
  return {
    ok: false,
    failure: {
      errorCode: "VALIDATION_FAILED",
      fields: [...new Set(error.issues.map((issue) => String(issue.path[0] ?? "_")))],
    },
  };
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

export function parseLessonTranslation(
  form: FormData,
  locale: Locale,
): Parsed<UpsertLessonTranslationInput> {
  const summary = text(form, "summary").trim();
  const result = upsertLessonTranslationSchema.safeParse({
    locale,
    title: text(form, "title"),
    body: text(form, "body"),
    ...(summary ? { summary } : {}),
  });
  return result.success ? { ok: true, value: result.data } : failure(result.error);
}

export function parseCalculatorInput(form: FormData, locale: Locale): Parsed<CalculatorInput> {
  const result = calculatorInputSchema.safeParse({
    topicId: text(form, "topicId"),
    published: form.get("published") === "true",
    locale,
    title: text(form, "title"),
    description: text(form, "description"),
  });
  return result.success ? { ok: true, value: result.data } : failure(result.error);
}

/** Back to the syllabus list after a save, filtered to the saved item's module. */
export function syllabusAfterSave(locale: Locale, topicId: string): string {
  const query = new URLSearchParams({ notice: "saved" });
  if (isTopicId(topicId)) query.set("module", getTopic(topicId).module);
  return localePath(locale, `syllabus?${query.toString()}`);
}

export const jsonBody = (body: unknown) => ({
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
