import type { Config } from "@react-router/dev/config";

/**
 * Development behind the local reverse proxy (dev container, nginx with TLS):
 * the Vite dev server sees plain HTTP and builds `request.url` as `http://...`,
 * while the browser sends `Origin: https://...`, so React Router's CSRF check
 * would reject every form action. The public host is therefore allowed
 * explicitly. In production this list stays empty: Fastify builds
 * `request.url` from the public base URL (apps/api/src/lib/react-router.ts).
 */
const devPublicHost = process.env["BETTER_AUTH_URL"]
  ? new URL(process.env["BETTER_AUTH_URL"]).host
  : undefined;

export default {
  // SSR: the Fastify process renders every app route server-side.
  ssr: true,
  ...(process.env["NODE_ENV"] !== "production" && devPublicHost
    ? { allowedActionOrigins: [devPublicHost] }
    : {}),
} satisfies Config;
