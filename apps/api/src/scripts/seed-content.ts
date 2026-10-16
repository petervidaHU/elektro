import { and, desc, eq } from "drizzle-orm";
import { INITIAL_CONTENT_STATUS, type Locale } from "@elektro/shared";
import { checkLessonFiles, loadLessonFiles, type LessonFile } from "../content/lesson-files.js";
import { db } from "../db/index.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import { LESSONS_ROOT } from "./content-root.js";

/**
 * Loads the lesson files (content/lessons, docs/THEORY_TOC.md) as drafts for
 * teacher review. Refuses to run if `content:check` would fail.
 *
 * - A new lesson is created as `ai_draft`.
 * - A lesson still in `ai_draft` is updated from its file (drafts are not
 *   reviewed yet, so re-delivered files replace them).
 * - A lesson in review, sent back, or approved is never touched: the teacher
 *   owns it from then on.
 */
type Outcome = "created" | "updated" | "unchanged" | "kept" | "topic-conflict";

async function seedFile(file: LessonFile): Promise<Outcome> {
  const locale = file.locale as Locale;

  return db().transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: lessons.id, topicId: lessons.topicId, position: lessons.position })
      .from(lessons)
      .where(eq(lessons.slug, file.slug))
      .limit(1);

    if (!existing) {
      const [lesson] = await tx
        .insert(lessons)
        .values({ slug: file.slug, topicId: file.topicId, position: file.position })
        .returning({ id: lessons.id });
      const [version] = await tx
        .insert(lessonVersions)
        .values({ lessonId: lesson!.id, version: 1 })
        .returning({ id: lessonVersions.id });
      await tx.insert(lessonTranslations).values({
        lessonVersionId: version!.id,
        locale,
        title: file.title,
        summary: file.summary,
        body: file.body,
        status: INITIAL_CONTENT_STATUS,
      });
      return "created";
    }

    if (existing.topicId !== file.topicId) {
      return "topic-conflict";
    }
    if (existing.position !== file.position) {
      await tx.update(lessons).set({ position: file.position, updatedAt: new Date() }).where(eq(lessons.id, existing.id));
    }

    const [latest] = await tx
      .select({ id: lessonVersions.id })
      .from(lessonVersions)
      .where(eq(lessonVersions.lessonId, existing.id))
      .orderBy(desc(lessonVersions.version))
      .limit(1);
    const [translation] = await tx
      .select({
        id: lessonTranslations.id,
        status: lessonTranslations.status,
        title: lessonTranslations.title,
        summary: lessonTranslations.summary,
        body: lessonTranslations.body,
      })
      .from(lessonTranslations)
      .where(and(eq(lessonTranslations.lessonVersionId, latest!.id), eq(lessonTranslations.locale, locale)))
      .limit(1);

    if (!translation) {
      await tx.insert(lessonTranslations).values({
        lessonVersionId: latest!.id,
        locale,
        title: file.title,
        summary: file.summary,
        body: file.body,
        status: INITIAL_CONTENT_STATUS,
      });
      return "created";
    }
    if (translation.status !== "ai_draft") {
      return "kept";
    }
    if (translation.title === file.title && translation.summary === file.summary && translation.body === file.body) {
      return "unchanged";
    }
    await tx
      .update(lessonTranslations)
      .set({ title: file.title, summary: file.summary, body: file.body, updatedAt: new Date() })
      .where(eq(lessonTranslations.id, translation.id));
    return "updated";
  });
}

async function main(): Promise<void> {
  const { files, issues: loadIssues } = loadLessonFiles(LESSONS_ROOT);
  const issues = [...loadIssues, ...checkLessonFiles(files)];
  if (issues.length > 0) {
    throw new Error(`Lesson files have ${issues.length} problem(s); run "npm run content:check".`);
  }

  const counts: Record<Outcome, number> = { created: 0, updated: 0, unchanged: 0, kept: 0, "topic-conflict": 0 };
  for (const file of files) {
    const outcome = await seedFile(file);
    counts[outcome]++;
    if (outcome !== "unchanged") console.log(`${outcome.padEnd(14)} ${file.path}`);
  }
  console.log(
    `\n${files.length} file(s): ${counts.created} created, ${counts.updated} updated, ` +
      `${counts.unchanged} unchanged, ${counts.kept} kept (in review or approved), ` +
      `${counts["topic-conflict"]} topic conflict(s)`,
  );
  if (counts["topic-conflict"] > 0) process.exitCode = 1;
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
