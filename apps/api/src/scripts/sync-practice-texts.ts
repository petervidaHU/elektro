import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { and, eq, sql } from "drizzle-orm";
import { LOCALES, TEMPLATES, type Locale } from "@elektro/shared";
import { db } from "../db/index.js";
import { practiceTaskTexts, practiceTemplates } from "../db/schema/content.js";
import { collectTaskTexts, type PracticeI18n } from "../practice/task-texts.js";

/**
 * Mirrors the practice texts of the i18n files into `practice_templates` /
 * `practice_task_texts` (plan §2.7, K12). The app does not read these rows at
 * runtime in v1; they prepare the reviewable, DB-backed texts of the AI phase.
 *
 * The i18n texts were reviewed in the pull request, so they are stored as
 * `approved`. There is no teacher to name, so the approval record carries a
 * fixed repository-review marker (role `admin`, no `approved_by` account);
 * the next real review replaces it. Rows already changed in the database
 * (anything but that marker) are left alone.
 */
const REPOSITORY_REVIEW = {
  name: "Repository review (pull request)",
  email: "repository-review@elektro.invalid",
  role: "admin",
} as const;

function localeFile(locale: Locale): PracticeI18n {
  const path = fileURLToPath(new URL(`../../../web/app/i18n/locales/${locale}/common.json`, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8")) as PracticeI18n;
}

async function main(): Promise<void> {
  let written = 0;
  let kept = 0;

  for (const locale of LOCALES) {
    let i18n: PracticeI18n;
    try {
      i18n = localeFile(locale);
    } catch {
      continue; // The locale has no resources yet.
    }

    for (const template of TEMPLATES) {
      const texts = collectTaskTexts(template, i18n);
      await db().transaction(async (tx) => {
        await tx
          .insert(practiceTemplates)
          .values({ id: template.id, topicId: template.topicId, currentVersion: template.version })
          .onConflictDoUpdate({
            target: practiceTemplates.id,
            set: { topicId: template.topicId, currentVersion: template.version, updatedAt: new Date() },
          });

        const [existing] = await tx
          .select({ id: practiceTaskTexts.id, approvedByEmail: practiceTaskTexts.approvedByEmail })
          .from(practiceTaskTexts)
          .where(
            and(
              eq(practiceTaskTexts.templateId, template.id),
              eq(practiceTaskTexts.templateVersion, template.version),
              eq(practiceTaskTexts.locale, locale),
            ),
          )
          .limit(1);

        if (existing && existing.approvedByEmail !== REPOSITORY_REVIEW.email) {
          kept++;
          return;
        }

        await tx
          .insert(practiceTaskTexts)
          .values({
            templateId: template.id,
            templateVersion: template.version,
            locale,
            ...texts,
            status: "approved",
            approvedByName: REPOSITORY_REVIEW.name,
            approvedByEmail: REPOSITORY_REVIEW.email,
            approvedByRole: REPOSITORY_REVIEW.role,
            approvedAt: sql`now()`,
          })
          .onConflictDoUpdate({
            target: [practiceTaskTexts.templateId, practiceTaskTexts.templateVersion, practiceTaskTexts.locale],
            set: { ...texts, updatedAt: new Date() },
          });
        written++;
      });
    }
  }

  console.log(`Practice texts synced: ${written} written, ${kept} left alone (changed in the database).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
