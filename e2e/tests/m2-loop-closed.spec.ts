import { expect, test } from "@playwright/test";
import hu from "../../apps/web/app/i18n/locales/hu/common.json" with { type: "json" };
import { E2E_TEACHER } from "../global-setup";
import { answerWrong, bottomBar, logIn, logOut, register, solveTask } from "../helpers";

/**
 * M2 acceptance test (docs/ROADMAP.md): a student practises (one wrong try
 * first), sees it on the dashboard and in the history, and reports a problem;
 * a teacher then opens that student's history and replays the session, and
 * sees the report. Touch only, phone viewport.
 */
test("M2: teacher opens a student's history and replays a session; student reports a problem", async ({
  page,
}) => {
  const stamp = Date.now();
  const studentName = `E2E Diák ${stamp}`;

  // A new student starts a session and solves the first task, with one wrong try.
  await register(page, studentName, `e2e-m2+${stamp}@example.com`, "e2e-password-123");
  await page.goto("/hu/practice/voltage-drop");
  await page.getByRole("button", { name: hu.practice.start.start }).tap();
  await expect(page).toHaveURL(/\/hu\/practice\/s\//);
  await answerWrong(page);
  await solveTask(page);
  await expect(page.getByText(hu.practice.task.done)).toBeVisible();

  // The student reports a problem with the task.
  await page.getByTestId("report-open").tap();
  await page.getByRole("combobox", { name: hu.report.category }).tap();
  await page.getByRole("option", { name: hu.report.categories.wrong_value }).tap();
  await page.getByRole("button", { name: hu.report.send }).tap();
  await expect(page.getByText(hu.report.thanks)).toBeVisible();

  // Dashboard: the unfinished session to continue, and the history entry.
  await bottomBar(page).getByRole("link", { name: hu.nav.home }).tap();
  const dashboard = page.getByTestId("dashboard");
  await expect(dashboard.getByText(/Gyakorlás folytatása/)).toBeVisible();
  await expect(dashboard.locator('[data-entry-kind="practice"]')).toBeVisible();
  await dashboard.getByRole("link", { name: hu.dashboard.recent.all }).tap();
  await expect(page.getByTestId("history-privacy")).toBeVisible();
  await expect(page.locator('[data-entry-kind="practice"]')).toHaveCount(1);
  await logOut(page);

  // The teacher finds the student and replays the session.
  await logIn(page, E2E_TEACHER.email, E2E_TEACHER.password);
  await bottomBar(page).getByRole("link", { name: hu.nav.teacher }).tap();
  await expect(page.getByRole("heading", { name: hu.teacher.students.title, level: 2 })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(studentName) }).tap();
  await expect(page.getByRole("heading", { name: studentName, level: 2 })).toBeVisible();
  await page.locator('[data-entry-kind="practice"]').first().tap();

  await expect(page.getByRole("heading", { name: hu.replay.title })).toBeVisible();
  const task = page.getByTestId("replay-task").first();
  await expect(task.locator('[data-verdict="incorrect"]').first()).toBeVisible();
  await expect(task.locator('[data-verdict="correct"]').first()).toBeVisible();

  // And sees the student's report.
  await bottomBar(page).getByRole("link", { name: hu.nav.teacher }).tap();
  await page.getByRole("link", { name: hu.teacher.tabs.reports }).tap();
  await expect(page.getByText(hu.report.categories.wrong_value).first()).toBeVisible();
  await expect(page.getByText(studentName).first()).toBeVisible();
});
