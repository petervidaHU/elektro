import { z } from "zod";

/**
 * All configuration comes from environment variables - never from a committed
 * file. Keep `.env.example` in sync with this schema.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(16),
  /** Public base URL the browser sees (behind the nginx reverse proxy). */
  BETTER_AUTH_URL: z.string().url(),

  /** Must be true behind the reverse proxy so client IPs and protocol are right. */
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

/** Memoised env for the running process. */
export function env(): Env {
  cached ??= loadEnv();
  return cached;
}

export function isProduction(): boolean {
  return env().NODE_ENV === "production";
}

/** Secure cookies require HTTPS, which in production arrives via the proxy. */
export function useSecureCookies(): boolean {
  return env().BETTER_AUTH_URL.startsWith("https://");
}
