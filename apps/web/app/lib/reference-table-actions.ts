import { referenceTableEditSchema, referenceTableInputSchema } from "@elektro/shared";
import type { ActionFailure } from "./content-admin";

type Parsed<T> = { ok: true; value: T } | { ok: false; failure: ActionFailure };

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

/** The editor's hidden `content` JSON, or `null` if it is not valid JSON. */
function contentOf(form: FormData): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text(form, "content"));
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function invalid(fields: string[]): { ok: false; failure: ActionFailure } {
  return { ok: false, failure: { errorCode: "VALIDATION_FAILED", fields } };
}

function fieldsOf(error: { issues: { path: PropertyKey[] }[] }): string[] {
  return [...new Set(error.issues.map((issue) => String(issue.path[0] ?? "_")))];
}

/** Checked with the same shared schema the API uses, so a missing source is caught before saving. */
export function parseNewTable(form: FormData) {
  const content = contentOf(form);
  if (!content) return invalid(["content"]);
  const result = referenceTableInputSchema.safeParse({
    key: text(form, "key"),
    title: text(form, "title"),
    source: text(form, "source"),
    ...content,
  });
  return result.success ? ({ ok: true, value: result.data } as Parsed<typeof result.data>) : invalid(fieldsOf(result.error));
}

export function parseTableEdit(form: FormData) {
  const content = contentOf(form);
  if (!content) return invalid(["content"]);
  const result = referenceTableEditSchema.safeParse({
    title: text(form, "title"),
    source: text(form, "source"),
    ...content,
  });
  return result.success ? ({ ok: true, value: result.data } as Parsed<typeof result.data>) : invalid(fieldsOf(result.error));
}
