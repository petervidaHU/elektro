import { expect, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { register, solveTask } from "../helpers";

/** K7: the physics calculators are listed, compute, and have practice (touch only). */
test("K7: a guest uses Ohm's law and the equivalent-resistance calculator; a student practises Ohm's law", async ({ page }) => {
  await page.goto("/hu/calculators");
  for (const title of ["Ohm-törvény", "Eredő ellenállás", "Fogyasztói igény", "Háromfázisú teljesítmény"]) {
    await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();
  }

  // 230 V over 46 ohm is 5 A.
  await page.getByRole("link", { name: /Ohm-törvény/ }).tap();
  await expect(page.getByTestId("calculator-result")).toContainText("5 A");

  // Two resistors in parallel: 6 and 3 ohm give 2 ohm.
  await page.goto("/hu/calculators/equivalent-resistance");
  await page.getByText(hu.calculators.equivalent.parallel, { exact: true }).tap();
  const first = page.getByLabel(/1\. ellenállás/);
  await first.fill("6");
  await page.getByLabel(/2\. ellenállás/).fill("3");
  await expect(page.getByTestId("calculator-result")).toContainText("2 Ω");

  // A student practises Ohm's law: first task, every step on the keypad.
  await register(page, "E2E Fizika", `e2e-k7+${Date.now()}@example.com`, "e2e-password-123");
  await page.goto("/hu/practice/ohms-law");
  await page.getByRole("button", { name: hu.practice.start.start }).tap();
  await expect(page).toHaveURL(/\/hu\/practice\/s\//);
  await solveTask(page);
  await expect(page.getByText(hu.practice.task.done)).toBeVisible();
});
