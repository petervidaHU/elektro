import { expect, test } from "@playwright/test";
import { CALCULATOR_IDS } from "@elektro/shared";
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
