import { expect, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { register, solveTask } from "../helpers";

/** K13: connection power and phase balancing compute, and have practice (touch only). */
test("K13: a guest checks a connection and balances phases; a student practises phase currents", async ({ page }) => {
  // 25 A on 230 V is 5750 W; a 6000 W demand is not covered, 250 W short.
  await page.goto("/hu/calculators/connection-power");
  await expect(page.getByTestId("calculator-result")).toContainText("5750");
  await page.getByLabel(hu.calculators.connection.demand).fill("6000");
  await expect(page.getByTestId("connection-verdict")).toContainText("250");

  // Default circuits: L1 = 26 A, L2 = 6 A, L3 = 13 A, so L1 is the most loaded.
  await page.goto("/hu/calculators/phase-balancing");
  await expect(page.getByTestId("calculator-result")).toContainText("L1");
  await expect(page.getByTestId("balancing-suggestion")).toBeVisible();

  await register(page, "E2E Elosztó", `e2e-k13+${Date.now()}@example.com`, "e2e-password-123");
  await page.goto("/hu/practice/distribution-boards");
  await page.getByRole("button", { name: hu.practice.start.start }).tap();
  await expect(page).toHaveURL(/\/hu\/practice\/s\//);
  await solveTask(page);
  await expect(page.getByText(hu.practice.task.done)).toBeVisible();
});
