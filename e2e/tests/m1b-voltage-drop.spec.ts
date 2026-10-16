import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  buildTask,
  expectedFor,
  formatNumber,
  formatQuantity,
  parseLocaleNumber,
} from "@elektro/shared";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { E2E_TEACHER } from "../global-setup";

/**
 * M1b acceptance test (docs/ROADMAP.md): a teacher approves the voltage-drop
 * lesson; a student reads it, uses the calculator, completes a 5-task practice
 * session, sees the summary and their progress. Touch only, phone viewport.
 */
const field = (page: Page, label: string) => page.getByRole("textbox", { name: label, exact: true });
const bottomBar = (page: Page) => page.getByRole("navigation", { name: hu.nav.bottomBar });

async function logIn(page: Page, email: string, password: string) {
  await page.goto("/hu/login");
  await field(page, hu.auth.login.email).fill(email);
  await field(page, hu.auth.login.password).fill(password);
  await page.getByRole("button", { name: hu.auth.login.submit }).tap();
  await expect(page).toHaveURL(/\/hu$/);
}

async function logOut(page: Page) {
  await bottomBar(page).getByRole("link", { name: hu.nav.account }).tap();
  await page.getByRole("button", { name: hu.account.logout }).tap();
  await expect(bottomBar(page).getByRole("link", { name: hu.nav.login })).toBeVisible();
}

/** Types a number on the step's on-screen keypad, key by key. */
async function typeOnKeypad(step: Locator, text: string) {
  const keypad = step.getByRole("group", { name: hu.keypad.label });
  for (const char of text) {
    const key = char === "," ? hu.keypad.decimal : char;
    await keypad.getByRole("button", { name: key, exact: true }).tap();
  }
}

/** Solves the task on screen as a careful student would, step by step. */
async function solveTask(page: Page) {
  const taskElement = page.locator("[data-template-id]");
  const templateId = (await taskElement.getAttribute("data-template-id"))!;
  const seed = Number(await taskElement.getAttribute("data-seed"));
  const task = buildTask(templateId, seed);
  const prior: Record<string, number> = {};

  for (const [index, spec] of task.template.steps.entries()) {
    const step = page.locator(`[data-step-id="${spec.id}"]`);
    await expect(step).toHaveAttribute("data-step-state", "active");
    const expected = expectedFor(task, index, prior);

    if (spec.options) {
      const option = spec.options(task.params).find((item) => item.value === expected)!;
      const label =
        option.label ??
        formatQuantity(option.value, hu.unit[spec.unit as "squareMillimetre"], "hu", {
          maximumSignificantDigits: 4,
        });
      await step.getByText(label, { exact: true }).tap();
      prior[spec.id] = expected;
    } else {
      await expect(step.getByText(/Elfogadott eltérés/)).toBeVisible();
      const typed = formatNumber(expected, "hu", { maximumSignificantDigits: 4, useGrouping: false });
      await typeOnKeypad(step, typed);
      prior[spec.id] = parseLocaleNumber(typed, "hu")!;
    }

    await step.getByRole("button", { name: hu.practice.step.check }).tap();
    await expect(step).toHaveAttribute("data-step-state", "done");
  }
}

test("M1b: teacher approves; student reads, calculates, practises, sees summary and progress", async ({
  page,
}) => {
  const slug = process.env.E2E_LESSON_SLUG!;
  const title = process.env.E2E_LESSON_TITLE!;

  // A teacher reviews and approves the lesson.
  await logIn(page, E2E_TEACHER.email, E2E_TEACHER.password);
  await page.goto(`/hu/lessons/${slug}`);
  await expect(page.getByText(`Állapot: ${hu.lessons.status.in_review}`)).toBeVisible();
  await page.getByRole("button", { name: hu.review.action.approve }).tap();
  await expect(page.getByText(`Állapot: ${hu.lessons.status.approved}`)).toBeVisible();
  await logOut(page);

  // A new student finds the lesson through the syllabus.
  await page.goto("/hu/register");
  await field(page, hu.auth.register.name).fill("E2E Gyakorló");
  await field(page, hu.auth.register.email).fill(`e2e+${Date.now()}@example.com`);
  await field(page, hu.auth.register.password).fill("e2e-password-123");
  await page.getByRole("button", { name: hu.auth.register.submit }).tap();
  await expect(page).toHaveURL(/\/hu$/);

  await bottomBar(page).getByRole("link", { name: hu.nav.lessons }).tap();
  await page.getByRole("link", { name: new RegExp(`^${hu.topic["voltage-drop"]}`) }).tap();
  await expect(page).toHaveURL(/\/hu\/topics\/voltage-drop$/);
  await page.getByRole("link", { name: new RegExp(title) }).tap();

  // Reads it and marks it done.
  await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();
  await expect(page.locator('[data-block="goals"]')).toBeVisible();
  await page.getByRole("button", { name: hu.lesson.done }).tap();
  await expect(page.getByRole("heading", { name: hu.lessonSummary.title })).toBeVisible();

  // Uses the calculator.
  await page.getByRole("link", { name: hu.lesson.toCalculator }).tap();
  await expect(page.getByRole("heading", { name: hu.calculators.voltageDrop.title, level: 2 })).toBeVisible();
  await expect(page.getByTestId("resistivity-warning")).toBeVisible();
  await page.getByRole("link", { name: hu.calculators.voltageDrop.practice }).tap();

  // Practises: a 5-task session (the default), every step on the keypad.
  await page.getByRole("button", { name: hu.practice.start.start }).tap();
  await expect(page).toHaveURL(/\/hu\/practice\/s\//);
  for (let n = 1; n <= 5; n++) {
    await expect(page.locator("[data-task-index]")).toHaveAttribute("data-task-index", String(n - 1));
    await solveTask(page);
    await expect(page.getByText(hu.practice.task.done)).toBeVisible();
    await page
      .getByRole(n < 5 ? "link" : "button", { name: n < 5 ? hu.practice.task.next : hu.practice.task.finish })
      .tap();
  }

  // Summary: all five unaided.
  await expect(page.getByRole("heading", { name: hu.practiceSummary.title })).toBeVisible();
  await expect(page.getByTestId("summary-headline")).toHaveText("5 / 5 feladat segítség nélkül");
  await expect(page.getByText(hu.practiceSummary.noMistakes)).toBeVisible();

  // Progress shows the topic with the solved tasks.
  await page.getByRole("link", { name: hu.practiceSummary.toProgress }).tap();
  const topic = page.locator('[data-topic-id="voltage-drop"]');
  await expect(topic).toBeVisible();
  await expect(topic.getByText("Megoldott feladatok: 5")).toBeVisible();
  await expect(topic.getByText("Leckék: 1 / 1")).toBeVisible();
});
