import {
  createReportSchema,
  DEFAULT_LOCALE,
  ERROR_CODES,
  isLocale,
  type ErrorCode,
} from "@elektro/shared";
import { ApiError, apiFetch } from "../lib/api";
import type { Route } from "./+types/report";

/**
 * Resource route behind the "Hibát találtam" sheet (plan J9): validates the
 * form and passes it to `POST /api/reports`. Login is checked by the API.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const version = form.get("targetVersion");
  const parsed = createReportSchema.safeParse({
    targetKind: form.get("targetKind"),
    targetId: form.get("targetId"),
    ...(version ? { targetVersion: Number(version) } : {}),
    category: form.get("category"),
    note: String(form.get("note") ?? ""),
    locale,
  });
  if (!parsed.success) {
    return { ok: false as const, errorCode: ERROR_CODES.VALIDATION_FAILED as ErrorCode };
  }

  try {
    await apiFetch(request, "/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false as const, errorCode: error.body.code as ErrorCode };
    }
    throw error;
  }
}
