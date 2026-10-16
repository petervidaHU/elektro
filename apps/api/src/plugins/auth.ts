import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { DEFAULT_ROLE, hasAtLeastRole, isRole, type Role } from "@elektro/shared";
import { auth } from "../lib/auth.js";
import { forbidden, unauthenticated } from "../lib/http-error.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare module "fastify" {
  interface FastifyRequest {
    /** Resolved session user, or `null` for anonymous requests. */
    currentUser: AuthenticatedUser | null;
  }

  interface FastifyInstance {
    /** Throws 401 unless a valid session exists. */
    requireUser(request: FastifyRequest): AuthenticatedUser;
    /** Throws 401/403 unless the session user has at least `role`. */
    requireRole(request: FastifyRequest, role: Role): AuthenticatedUser;
  }
}

/** Turns Fastify's raw request headers into the `Headers` better-auth wants. */
function toHeaders(request: FastifyRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return headers;
}

/**
 * Resolves the session on every request and exposes the role guards.
 *
 * This is the security boundary: the frontend only hides what a role cannot
 * use, so every route must call `requireUser` / `requireRole`.
 */
const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("currentUser", null);

  app.addHook("onRequest", async (request) => {
    const session = await auth().api.getSession({ headers: toHeaders(request) });

    if (!session?.user) {
      request.currentUser = null;
      return;
    }

    const role = session.user.role;

    request.currentUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: isRole(role) ? role : DEFAULT_ROLE,
    };
  });

  app.decorate("requireUser", (request: FastifyRequest): AuthenticatedUser => {
    if (!request.currentUser) {
      throw unauthenticated();
    }
    return request.currentUser;
  });

  app.decorate("requireRole", (request: FastifyRequest, role: Role): AuthenticatedUser => {
    const user = app.requireUser(request);

    if (!hasAtLeastRole(user.role, role)) {
      throw forbidden();
    }

    return user;
  });
};

export default fp(authPlugin, { name: "elektro-auth" });
