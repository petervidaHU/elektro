import { expect, request, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { E2E_TEACHER } from "../global-setup";
import { bottomBar, field, logIn } from "../helpers";

/**
 * S5 + S6: a teacher writes a glossary term and a topic intro; both stay
 * hidden from students until a teacher approves them, then show up in the
 * glossary, in a lesson's term sheet and on the topic hub.
 */
test("S5/S6: glossary terms and topic intros reach students only after approval", async ({ page, baseURL, browser }) => {
  const stamp = Date.now();
  const key = `e2e-term-${stamp}`;
  const term = `E2E fogalom ${stamp}`;
  const intro = `E2E bevezető ${stamp}: ez a témakör a logikai alapokról szól.`;
  const guest = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  const glossaryKeys = async () =>
    ((await (await guest.get("/api/glossary?locale=hu")).json()) as { terms: { key: string }[] }).terms.map((item) => item.key);

  await logIn(page, E2E_TEACHER.email, E2E_TEACHER.password);

  // The teacher writes a term: a draft, hidden from guests.
  await page.goto("/hu/teacher/glossary/new");
  await field(page, hu.glossary.manage.key).fill(key);
  await field(page, hu.glossary.manage.term).fill(term);
  await page.getByLabel(hu.glossary.manage.definition).fill("Ez a meghatározás csak a teszthez tartozik.");
  await page.getByRole("button", { name: hu.contentAdmin.saveDraft }).tap();
  await expect(page.locator(`[data-term-key="${key}"]`)).toContainText(hu.lessons.status.ai_draft);
  expect(await glossaryKeys()).not.toContain(key);

  // ... and a topic intro, also a draft.
  await page.goto("/hu/teacher/intros/logic-basics");
  await page.getByLabel(hu.intros.text).fill(intro);
  await page.getByRole("button", { name: hu.contentAdmin.saveDraft }).tap();
  await expect(page.locator('[data-topic-id="logic-basics"]')).toContainText(hu.lessons.status.ai_draft);

  // Both wait in the review queue; the teacher sends them on and approves.
  await bottomBar(page).getByRole("link", { name: hu.nav.teacher }).tap();
  await page.goto("/hu/teacher/review");
  for (const [selector] of [[`a[href$="/teacher/review/glossary/${key}"]`], ['a[href$="/teacher/review/intro/logic-basics"]']] as const) {
    await page.locator(selector).tap();
    await page.getByRole("button", { name: hu.review.action.submit_for_review }).tap();
    await page.getByRole("button", { name: hu.review.action.approve }).tap();
    await expect(page.getByTestId("approval-record")).toContainText(E2E_TEACHER.email);
    await page.goto("/hu/teacher/review");
  }

  // Now guests see the term in the glossary and the intro on the hub.
  expect(await glossaryKeys()).toContain(key);
  const visitor = await browser.newContext({ baseURL, ignoreHTTPSErrors: true });
  const guestPage = await visitor.newPage();
  await guestPage.goto("/hu/glossary");
  await expect(guestPage.locator(`[data-term-key="${key}"]`)).toContainText(term);
  await guestPage.goto("/hu/topics/logic-basics");
  await expect(guestPage.getByTestId("topic-intro")).toContainText(intro);

  // A lesson can point at the term; it opens in a bottom sheet.
  const slug = `e2e-term-lesson-${stamp}`;
  const teacherApi = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  await teacherApi.post("/api/auth/sign-in/email", { data: { email: E2E_TEACHER.email, password: E2E_TEACHER.password } });
  await teacherApi.post("/api/lessons", { data: { topicId: "logic-basics", slug, position: 901 } });
  await teacherApi.put(`/api/lessons/${slug}/translations`, {
    data: { locale: "hu", title: `E2E ${slug}`, body: `## Szakasz\n\nA :term[kulcsfogalom]{id=${key}} fontos.\n` },
  });
  await teacherApi.post(`/api/lessons/${slug}/review`, { data: { action: "submit_for_review", locale: "hu" } });
  await teacherApi.post(`/api/lessons/${slug}/review`, { data: { action: "approve", locale: "hu" } });
  await guestPage.goto(`/hu/lessons/${slug}`);
  await guestPage.locator(`[data-term="${key}"]`).tap();
  await expect(guestPage.getByTestId("term-definition")).toContainText("csak a teszthez");

  // Clean up the lesson (the global teardown removes the term and the intro).
  await teacherApi.dispose();
  await visitor.close();
  await guest.dispose();
});
