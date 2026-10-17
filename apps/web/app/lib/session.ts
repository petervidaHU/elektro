import { redirect } from "react-router";
import { hasAtLeastRole, type Locale, type Role } from "@elektro/shared";
import { apiFetch } from "./api";
import { loginPath } from "./return-to";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** The signed-in user, or `null` for a guest (asks the API, never guesses). */
export async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  const { user } = await apiFetch<{ user: CurrentUser | null }>(request, "/api/me");
  return user;
}

/**
 * For loaders of login-only pages (practice, simulator, profile): sends a
 * guest to the login page, which brings them back here afterwards.
 *
 * This is a convenience, not the security boundary - the API checks the
 * session on every request itself.
 */
export async function requireUser(request: Request, locale: Locale): Promise<CurrentUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(loginPath(locale, `${url.pathname}${url.search}`));
  }
  return user;
}

/**
 * For loaders of teacher/admin pages: guests go to login, students get a 403
 * page. Again only a convenience - the API checks the role itself.
 */
export async function requireStaff(request: Request, locale: Locale): Promise<CurrentUser> {
  const user = await requireUser(request, locale);
  if (!hasAtLeastRole(user.role, "teacher")) {
    throw new Response(null, { status: 403 });
  }
  return user;
}

/** Copies the session cookies better-auth set onto our own response. */
export function forwardSetCookies(response: Response): Headers {
  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }
  return headers;
}
