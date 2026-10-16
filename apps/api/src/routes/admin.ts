import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createUserSchema,
  ERROR_CODES,
  resetPasswordSchema,
  setRoleSchema,
} from "@elektro/shared";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth.js";
import { auth } from "../lib/auth.js";
import { HttpError, notFound, parseBody } from "../lib/http-error.js";
import { allowUnapprovedDrafts, setBooleanSetting } from "../lib/settings.js";
import { APP_SETTING_KEYS } from "../db/schema/app.js";

/**
 * Admin-only user management. There is no outgoing e-mail in v1, so account
 * creation, role changes and password resets all happen here.
 */
export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/users", async (request) => {
    app.requireRole(request, "admin");

    const users = await db()
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    return { users };
  });

  /** Creates an account with a role already assigned (e.g. a teacher). */
  app.post("/admin/users", async (request, reply) => {
    app.requireRole(request, "admin");
    const input = parseBody(createUserSchema, request.body);

    const existing = await db()
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new HttpError(409, ERROR_CODES.EMAIL_IN_USE);
    }

    const created = await auth().api.signUpEmail({
      body: { email: input.email, password: input.password, name: input.name },
    });

    // `role` is not client-settable on sign-up, so it is assigned here.
    const [updated] = await db()
      .update(user)
      .set({ role: input.role, updatedAt: new Date() })
      .where(eq(user.id, created.user.id))
      .returning({ id: user.id, email: user.email, name: user.name, role: user.role });

    return reply.code(201).send({ user: updated });
  });

  app.patch("/admin/users/role", async (request) => {
    app.requireRole(request, "admin");
    const input = parseBody(setRoleSchema, request.body);

    const [updated] = await db()
      .update(user)
      .set({ role: input.role, updatedAt: new Date() })
      .where(eq(user.id, input.userId))
      .returning({ id: user.id, role: user.role });

    if (!updated) {
      throw notFound();
    }

    return { user: updated };
  });

  /** Sets a new password directly - v1 has no password-reset e-mail. */
  app.post("/admin/users/reset-password", async (request) => {
    app.requireRole(request, "admin");
    const input = parseBody(resetPasswordSchema, request.body);

    const [target] = await db()
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (!target) {
      throw notFound();
    }

    // Documented better-auth escape hatch: hash with the server's own hasher
    // and write it through the internal adapter.
    const ctx = await auth().$context;
    const hash = await ctx.password.hash(input.newPassword);
    await ctx.internalAdapter.updatePassword(input.userId, hash);

    return { ok: true };
  });

  app.get("/admin/settings", async (request) => {
    app.requireRole(request, "admin");

    return { allowUnapprovedDrafts: await allowUnapprovedDrafts() };
  });

  app.patch("/admin/settings", async (request) => {
    const admin = app.requireRole(request, "admin");
    const input = parseBody(
      z.object({ allowUnapprovedDrafts: z.boolean() }),
      request.body,
    );

    await setBooleanSetting(
      APP_SETTING_KEYS.allowUnapprovedDrafts,
      input.allowUnapprovedDrafts,
      admin.id,
    );

    return { allowUnapprovedDrafts: input.allowUnapprovedDrafts };
  });
};
