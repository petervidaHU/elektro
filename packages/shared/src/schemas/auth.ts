import { z } from "zod";
import { ROLES } from "../roles.js";

/**
 * Auth v1: email + password only, no outgoing email. Admins create teacher
 * accounts, promote users and reset passwords.
 */
export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z.string().min(10).max(128);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(120),
});

/** Admin-only: create an account with a role already assigned. */
export const createUserSchema = signUpSchema.extend({
  role: z.enum(ROLES),
});

/** Admin-only: change someone's role. */
export const setRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

/** Admin-only: set a new password for a user (no email round-trip in v1). */
export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: passwordSchema,
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
