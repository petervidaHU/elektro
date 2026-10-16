import { expect, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };

/**
 * M1a acceptance test (docs/ROADMAP.md):
 * a guest registers, lands on the dashboard and navigates with the bottom bar.
 *
 * Labels come from the Hungarian translation file, so the test follows the
 * copy instead of hard-coding it.
 */
test("guest registers, lands on the dashboard, navigates with the bottom bar", async ({
  page,
}) => {
  const name = "E2E Tanuló";
  const email = `e2e+${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
  const password = "e2e-password-123";

  // Guest landing page with the guest variant of the bottom bar.
  await page.goto("/hu");
  const bottomBar = page.getByRole("navigation", { name: hu.nav.bottomBar });
  await expect(bottomBar).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: hu.nav.login })).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: hu.nav.account })).toHaveCount(0);

  // Register (touch only: taps and the on-screen keyboard).
  await page.getByRole("link", { name: hu.landing.register }).tap();
  await expect(page.getByRole("heading", { name: hu.auth.register.title })).toBeVisible();
  await expect(page.getByText(hu.privacy.notice)).toBeVisible();

  // By accessible name, as a screen reader announces the fields.
  const field = (label: string) => page.getByRole("textbox", { name: label, exact: true });
  await field(hu.auth.register.name).fill(name);
  await field(hu.auth.register.email).fill(email);
  await field(hu.auth.register.password).fill(password);
  await page.getByRole("button", { name: hu.auth.register.submit }).tap();

  // Lands on the dashboard as a signed-in student.
  await expect(page).toHaveURL(/\/hu$/);
  await expect(
    page.getByRole("heading", { name: hu.dashboard.greeting.replace("{{name}}", name) }),
  ).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: hu.nav.login })).toHaveCount(0);

  // Every tab of the bottom bar opens its page.
  const tabs = [
    { label: hu.nav.lessons, url: /\/hu\/syllabus$/, heading: hu.syllabus.title },
    { label: hu.nav.calculators, url: /\/hu\/calculators$/, heading: hu.calculators.title },
    { label: hu.nav.simulator, url: /\/hu\/simulator$/, heading: hu.simulator.title },
    { label: hu.nav.account, url: /\/hu\/account$/, heading: hu.account.title },
  ];

  for (const tab of tabs) {
    await bottomBar.getByRole("link", { name: tab.label }).tap();
    await expect(page).toHaveURL(tab.url);
    await expect(page.getByRole("heading", { name: tab.heading, level: 2 })).toBeVisible();
    await expect(bottomBar.getByRole("link", { name: tab.label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  // The profile shows the new account with the student role.
  const main = page.getByRole("main");
  await expect(main.getByText(email)).toBeVisible();
  await expect(main.getByText(hu.role.student, { exact: true })).toBeVisible();

  await bottomBar.getByRole("link", { name: hu.nav.home }).tap();
  await expect(page).toHaveURL(/\/hu$/);
  await expect(
    page.getByRole("heading", { name: hu.dashboard.greeting.replace("{{name}}", name) }),
  ).toBeVisible();
});

test("a student logs out, then logs in from a login-only page and returns to it", async ({
  page,
}) => {
  const email = `e2e+${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
  const password = "e2e-password-123";
  const field = (label: string) => page.getByRole("textbox", { name: label, exact: true });
  const bottomBar = page.getByRole("navigation", { name: hu.nav.bottomBar });

  await page.goto("/hu/register");
  await field(hu.auth.register.name).fill("E2E Visszatérő");
  await field(hu.auth.register.email).fill(email);
  await field(hu.auth.register.password).fill(password);
  await page.getByRole("button", { name: hu.auth.register.submit }).tap();
  await expect(page).toHaveURL(/\/hu$/);

  // Log out from the profile.
  await bottomBar.getByRole("link", { name: hu.nav.account }).tap();
  await page.getByRole("button", { name: hu.account.logout }).tap();
  await expect(page).toHaveURL(/\/hu$/);
  await expect(bottomBar.getByRole("link", { name: hu.nav.login })).toBeVisible();

  // A login-only page sends the guest to log in, and back afterwards.
  await page.goto("/hu/simulator");
  await expect(page).toHaveURL(/\/hu\/login\?returnTo=%2Fhu%2Fsimulator$/);
  await field(hu.auth.login.email).fill(email);
  await field(hu.auth.login.password).fill(password);
  await page.getByRole("button", { name: hu.auth.login.submit }).tap();

  await expect(page).toHaveURL(/\/hu\/simulator$/);
  await expect(page.getByRole("heading", { name: hu.simulator.title, level: 2 })).toBeVisible();
});

test("practice-only areas send a guest to log in and back", async ({ page }) => {
  await page.goto("/hu/simulator");

  await expect(page).toHaveURL(/\/hu\/login\?returnTo=%2Fhu%2Fsimulator$/);
  await expect(page.getByRole("heading", { name: hu.auth.login.title })).toBeVisible();
  await expect(page.getByRole("link", { name: hu.auth.login.registerLink })).toHaveAttribute(
    "href",
    "/hu/register?returnTo=%2Fhu%2Fsimulator",
  );
});
