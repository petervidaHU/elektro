import { expect, request, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { E2E_TEACHER } from "../global-setup";
import { bottomBar, field, logIn } from "../helpers";

/**
 * K8 + U13: a teacher enters a table with its source; students cannot see it
 * until a teacher verifies it, which records who and when. The values are a
 * test fixture, not standard values.
 */
test("K8: unverified tables stay hidden from students until a teacher verifies them", async ({ page, baseURL }) => {
  const key = `e2e-table-${Date.now()}`;

  await logIn(page, E2E_TEACHER.email, E2E_TEACHER.password);
  await bottomBar(page).getByRole("link", { name: hu.nav.teacher }).tap();
  await page.getByRole("link", { name: hu.teacher.tabs.referenceTables }).tap();

  // The list says which tables the cable-selection calculator still waits for.
  await expect(page.getByTestId("missing-tables")).toContainText(hu.calculators.planned["cable-selection"]);
  await expect(page.locator('[data-requirement="current-carrying-capacity"]')).toBeVisible();
  await page.goto("/hu/calculators");
  await expect(page.locator('[data-planned="cable-selection"]')).toContainText(hu.syllabus.comingSoon);
  await expect(page.getByTestId("planned-missing")).toBeVisible();
  await page.goto("/hu/teacher/reference-tables");

  await page.getByRole("link", { name: hu.referenceTables.new }).tap();

  await field(page, hu.referenceTables.editor.key).fill(key);
  await field(page, hu.referenceTables.editor.titleLabel).fill("E2E tesztadat");
  await page.getByLabel(hu.referenceTables.editor.source).fill("Teszt fixture, nem szabványérték");
  await page.getByLabel(hu.referenceTables.editor.columnLabel.replace("{{n}}", "1")).fill("Szelvény");
  await page.getByLabel(hu.referenceTables.editor.columnLabel.replace("{{n}}", "2")).fill("Érték");
  await page.getByLabel("1. sor, Szelvény").fill("1,5");
  await page.getByLabel("1. sor, Érték").fill("10");
  await page.getByRole("button", { name: hu.referenceTables.editor.create }).tap();

  await expect(page.getByTestId("unverified-banner")).toBeVisible();
  await expect(page.getByTestId("table-excerpt")).toContainText("1,5");

  // A student cannot read it yet.
  const student = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  const signUp = await student.post("/api/auth/sign-up/email", {
    data: { name: "E2E Tábla", email: `e2e-k8+${Date.now()}@example.com`, password: "e2e-password-123" },
  });
  expect(signUp.ok()).toBe(true);
  expect((await student.get(`/api/reference-tables/${key}`)).status()).toBe(404);
  expect((await student.get("/api/reference-tables")).status()).toBe(403);

  // The teacher verifies it, after confirming the comparison.
  const verify = page.getByTestId("verify-card");
  await expect(verify.getByRole("button", { name: hu.referenceTables.verify.button })).toBeDisabled();
  await verify.getByLabel(hu.referenceTables.verify.compared).check();
  await verify.getByRole("button", { name: hu.referenceTables.verify.button }).tap();
  await expect(page.getByTestId("verification-record")).toContainText(E2E_TEACHER.email);
  await expect(page.getByTestId("unverified-banner")).toHaveCount(0);

  // Now the student gets the verified version, with its source.
  const visible = await student.get(`/api/reference-tables/${key}`);
  expect(visible.status()).toBe(200);
  const body = (await visible.json()) as { table: { status: string; source: string } };
  expect(body.table.status).toBe("verified");
  expect(body.table.source).toContain("Teszt fixture");

  // Editing the verified table makes an unverified version; the student still gets the verified one.
  await page.getByLabel("1. sor, Érték").fill("12");
  await page.getByRole("button", { name: hu.referenceTables.edit.save }).tap();
  await expect(page.getByTestId("unverified-banner")).toBeVisible();
  const still = (await (await student.get(`/api/reference-tables/${key}`)).json()) as { table: { rows: number[][] } };
  expect(still.table.rows[0]).toEqual([1.5, 10]);
  await student.dispose();
});
