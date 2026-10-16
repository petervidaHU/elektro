import type { ApiErrorBody } from "@elektro/shared";

/**
 * Calls the API from a loader or an action.
 *
 * The URL is resolved against the incoming request, so the same code works
 * behind the reverse proxy and in development (where Vite proxies `/api`).
 */
export async function apiFetch<T>(
  request: Request,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = new URL(path, request.url);

  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      // Forward the session cookie so the API sees the signed-in user.
      ...(request.headers.get("cookie") ? { cookie: request.headers.get("cookie")! } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      code: "INTERNAL_ERROR",
    }))) as ApiErrorBody;

    throw new ApiError(response.status, body);
  }

  return (await response.json()) as T;
}

/** Carries the API's error *code*, which the UI turns into a message. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.code);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
