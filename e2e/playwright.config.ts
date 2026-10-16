import { defineConfig, devices } from "@playwright/test";

/**
 * Milestone acceptance tests (see docs/ROADMAP.md). They drive the running app
 * on a phone viewport, because every learning interaction must work with touch
 * only.
 *
 * The target is the local dev container by default; point `E2E_BASE_URL` at
 * any other running instance.
 */
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://elektro.fromthe.test:8443",
    // The local stack uses an mkcert certificate.
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "phone",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
