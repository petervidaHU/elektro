import { expect, type Locator, type Page } from "@playwright/test";
import { buildTask, expectedFor, formatNumber, formatQuantity, parseLocaleNumber } from "@elektro/shared";
import hu from "../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };

/** Shared by the milestone tests: touch-only helpers on the phone viewport. */
export const field = (page: Page, label: string) => page.getByRole("textbox", { name: label, exact: true });
export const bottomBar = (page: Page) => page.getByRole("navigation", { name: hu.nav.bottomBar });

export async function logIn(page: Page, email: string, password: string) {
  await page.goto("/hu/login");
  await field(page, hu.auth.login.email).fill(email);
  await field(page, hu.auth.login.password).fill(password);
  await page.getByRole("button", { name: hu.auth.login.submit }).tap();
  await expect(page).toHaveURL(/\/hu$/);
}

export async function logOut(page: Page) {
  await bottomBar(page).getByRole("link", { name: hu.nav.account }).tap();
  await page.getByRole("button", { name: hu.account.logout }).tap();
  await expect(bottomBar(page).getByRole("link", { name: hu.nav.login })).toBeVisible();
}

export async function register(page: Page, name: string, email: string, password: string) {
  await page.goto("/hu/register");
  await field(page, hu.auth.register.name).fill(name);
  await field(page, hu.auth.register.email).fill(email);
  await field(page, hu.auth.register.password).fill(password);
  await page.getByRole("button", { name: hu.auth.register.submit }).tap();
  await expect(page).toHaveURL(/\/hu$/);
}

/** Types a number on the step's on-screen keypad, key by key. */
export async function typeOnKeypad(step: Locator, text: string) {
  const keypad = step.getByRole("group", { name: hu.keypad.label });
  for (const char of text) {
    const key = char === "," ? hu.keypad.decimal : char;
    await keypad.getByRole("button", { name: key, exact: true }).tap();
  }
}

/** Answers the step on screen with a value that is certainly wrong, and checks it. */
export async function answerWrong(page: Page) {
  const step = page.locator('[data-step-state="active"]').first();
  await typeOnKeypad(step, "1");
  await step.getByRole("button", { name: hu.practice.step.check }).tap();
  await expect(step.getByText(hu.practice.step.check)).toBeVisible();
}

/** Solves the task on screen as a careful student would, step by step. */
export async function solveTask(page: Page) {
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
