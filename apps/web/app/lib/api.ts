import type { ApiErrorBody } from "@elektro/shared";

/**
 * Where loaders and actions (server-side) reach the API.
 *
 * Not the public URL: behind the reverse proxy it may not resolve from inside
 * the server or container. The API always runs next to the SSR code - the same
 * process in production, the same container in development - so loopback on
 * `PORT` reaches it; `API_INTERNAL_URL` overrides that if they are ever split.
 */
export function apiUrl(path: string): URL {
  const base = process.env.API_INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || "3000"}`;
  return new URL(path, base);
}

/**
 * Browser headers the API needs to see on a server-side call:
 * - `cookie`: the session;
 * - `origin`, `referer`, `sec-fetch-*`: better-auth's CSRF and origin checks;
 * - `x-forwarded-*`, `user-agent`: the real client, so rate limits and
 *   sessions are per user and not all `127.0.0.1`.
 */
const FORWARDED_HEADERS = [
  "cookie",
  "origin",
  "referer",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "user-agent",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-forwarded-host",
] as const;

export function forwardedHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers[name] = value;
    }
  }
  return headers;
}

/** Calls the API from a loader or an action, as the browser's user. */
export async function apiFetch<T>(
  request: Request,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      accept: "application/json",
      ...forwardedHeaders(request),
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
