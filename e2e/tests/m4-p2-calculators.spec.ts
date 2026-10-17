import { expect, test } from "@playwright/test";
import { CALCULATOR_IDS } from "@elektro/shared";
import { register, solveTask } from "../helpers";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };

/**
 * M4 acceptance test (docs/ROADMAP.md): the P2 calculators are reachable from
 * their topic hubs, and every calculator page computes. Touch only, phone viewport.
 */
test("M4: P2 calculators are reachable from their topic hubs", async ({ page }) => {
  // From the syllabus into a later-phase topic and its calculator.
  await page.goto("/hu/syllabus");
  await page.getByRole("link", { name: new RegExp(`^${hu.topic["electric-field-and-capacitors"]}`) }).tap();
  await expect(page).toHaveURL(/\/hu\/topics\/electric-field-and-capacitors$/);
  await page.getByRole("link", { name: hu.contentAdmin.calculatorIds.capacitors }).tap();
  await expect(page).toHaveURL(/\/hu\/calculators\/capacitors$/);
  // 100 µF at 10 V: Q = 1 mC, tau = 100 ms with 1 kΩ.
  await expect(page.getByTestId("calculator-result")).toContainText("100");

  await page.goto("/hu/topics/transformers");
  await page.getByRole("link", { name: hu.contentAdmin.calculatorIds["transformer-ratio"] }).tap();
  // 230 V over 1000 : 100 turns is 23 V.
  await expect(page.getByTestId("calculator-result")).toContainText("23");

  await page.goto("/hu/topics/voltage-sources");
  await page.getByRole("link", { name: hu.contentAdmin.calculatorIds["voltage-source"] }).tap();
  // 12 V, Ri = 1 ohm, R = 5 ohm: U = 10 V.
  await expect(page.getByTestId("calculator-result")).toContainText("10");
});

test("M4: every calculator page computes with its default inputs", async ({ page }) => {
  for (const id of CALCULATOR_IDS) {
    await page.goto(`/hu/calculators/${id}`);
    await expect(page.getByRole("heading", { level: 2 }), id).toBeVisible();
    await expect(page.getByTestId("calculator-result").first(), id).toBeVisible();
    await expect(page.getByText(hu.calculators.invalidInput), id).toHaveCount(0);
  }
});

test("M4: a student practises a P2 topic (electric motors) on the keypad", async ({ page }) => {
  await register(page, "E2E Motor", `e2e-m4+${Date.now()}@example.com`, "e2e-password-123");
  await page.goto("/hu/practice/electric-motors");
  await page.getByRole("button", { name: hu.practice.start.start }).tap();
  await expect(page).toHaveURL(/\/hu\/practice\/s\//);
  await solveTask(page);
  await expect(page.getByText(hu.practice.task.done)).toBeVisible();
});
