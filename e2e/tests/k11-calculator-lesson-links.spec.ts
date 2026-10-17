import { expect, request, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { E2E_TEACHER } from "../global-setup";

/**
 * K11: a lesson example opens the calculator with its inputs filled in, and
 * a calculator links back to the theory. Touch only, phone viewport.
 */
test("K11: lesson example -> pre-filled calculator -> theory link", async ({ page, baseURL }) => {
  const slug = `e2e-k11-lesson-${Date.now()}`;
  const api = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  await api.post("/api/auth/sign-in/email", { data: { email: E2E_TEACHER.email, password: E2E_TEACHER.password } });
  await api.post("/api/lessons", { data: { topicId: "ohms-law", slug, position: 0 } });

  // An invalid link (an input the calculator does not have) is refused on save.
  const refused = await api.put(`/api/lessons/${slug}/translations`, {
    data: { locale: "hu", title: "E2E K11", body: '## Szakasz\n\n::calculator{id="ohms-law" colour=red}\n' },
  });
  expect(refused.status()).toBe(400);

  const saved = await api.put(`/api/lessons/${slug}/translations`, {
    data: {
      locale: "hu",
      title: `E2E K11 ${slug}`,
      body: '## Szakasz\n\n:::example\nEgy 4 Ω-os fogyasztó 12 V-on.\n\n::calculator{id="ohms-law" unknown=current voltage=12 resistance=4}\n:::\n',
    },
  });
  expect(saved.ok()).toBe(true);
  await api.post(`/api/lessons/${slug}/review`, { data: { action: "submit_for_review", locale: "hu" } });
  await api.post(`/api/lessons/${slug}/review`, { data: { action: "approve", locale: "hu" } });

  await page.goto(`/hu/lessons/${slug}`);
  await page.getByRole("link", { name: hu.lessonBlock.openCalculator }).tap();

  // 12 V over 4 Ω is 3 A, and the inputs are the example's.
  await expect(page).toHaveURL(/\/hu\/calculators\/ohms-law\?/);
  await expect(page.getByTestId("calculator-result")).toContainText("3 A");
  await expect(page.getByRole("textbox", { name: hu.calculators.quantity.voltage })).toHaveValue(/12/);

  // And back to the theory.
  await page.getByTestId("theory-link").tap();
  await expect(page).toHaveURL(/\/hu\/lessons\//);

  await api.dispose();
});
