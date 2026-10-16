import { describe, expect, it } from "vitest";
import type { FastifyRequest } from "fastify";
import { hasAtLeastRole, type Role } from "@elektro/shared";
import { HttpError, forbidden, unauthenticated } from "../lib/http-error.js";
import type { AuthenticatedUser } from "./auth.js";

/**
 * The guards are the server-side security boundary, so their logic is tested
 * directly - without a database or a live better-auth session.
 *
 * These reimplement exactly what `authPlugin` decorates onto the instance; if
 * the plugin changes, these must change with it.
 */
function requireUser(request: Pick<FastifyRequest, "currentUser">): AuthenticatedUser {
  if (!request.currentUser) {
    throw unauthenticated();
  }
  return request.currentUser;
}

function requireRole(
  request: Pick<FastifyRequest, "currentUser">,
  role: Role,
): AuthenticatedUser {
  const user = requireUser(request);
  if (!hasAtLeastRole(user.role, role)) {
    throw forbidden();
  }
  return user;
}

function requestAs(role: Role | null): Pick<FastifyRequest, "currentUser"> {
  return {
    currentUser:
      role === null
        ? null
        : { id: `user-${role}`, email: `${role}@example.com`, name: role, role },
  };
}

describe("requireUser", () => {
  it("rejects anonymous requests with a 401 code", () => {
    try {
      requireUser(requestAs(null));
      expect.unreachable("expected an HttpError");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).statusCode).toBe(401);
      expect((error as HttpError).code).toBe("UNAUTHENTICATED");
    }
  });

  it("returns the session user", () => {
    expect(requireUser(requestAs("student")).role).toBe("student");
  });
});

describe("requireRole", () => {
  it("lets a role through for its own level and below", () => {
    expect(requireRole(requestAs("admin"), "admin").role).toBe("admin");
    expect(requireRole(requestAs("admin"), "teacher").role).toBe("admin");
    expect(requireRole(requestAs("teacher"), "student").role).toBe("teacher");
  });

  it("blocks students from teacher-only and admin-only routes", () => {
    for (const required of ["teacher", "admin"] as const) {
      try {
        requireRole(requestAs("student"), required);
        expect.unreachable("expected an HttpError");
      } catch (error) {
        expect((error as HttpError).statusCode).toBe(403);
        expect((error as HttpError).code).toBe("FORBIDDEN");
      }
    }
  });

  it("blocks teachers from admin-only routes", () => {
    expect(() => requireRole(requestAs("teacher"), "admin")).toThrow(HttpError);
  });

  it("answers 401 - not 403 - when there is no session at all", () => {
    try {
      requireRole(requestAs(null), "admin");
      expect.unreachable("expected an HttpError");
    } catch (error) {
      expect((error as HttpError).statusCode).toBe(401);
    }
  });
});
