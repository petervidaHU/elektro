import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DEFAULT_ROLE } from "@elektro/shared";
import { db, schema } from "../db/index.js";
import { env, useSecureCookies } from "../env.js";

/**
 * Auth v1: email + password only, **no outgoing email**. Anyone can register
 * (`/api/auth/sign-up/email`) and always gets the `student` role - `role` is
 * not client-writable. Admins create teacher accounts, promote users and reset
 * passwords, so e-mail verification and password-reset mail are deliberately
 * disabled.
 */
export function createAuth() {
  const config = env();

  return betterAuth({
    appName: "elektro",
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: [config.BETTER_AUTH_URL],
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // No e-mail in v1: nothing can be delivered to the user.
      requireEmailVerification: false,
      sendResetPassword: undefined,
      minPasswordLength: 10,
    },
    emailVerification: {
      sendOnSignUp: false,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: DEFAULT_ROLE,
          // Never settable from the client: only admin routes change roles.
          input: false,
        },
      },
    },
    advanced: {
      useSecureCookies: useSecureCookies(),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let cached: Auth | undefined;

export function auth(): Auth {
  cached ??= createAuth();
  return cached;
}
