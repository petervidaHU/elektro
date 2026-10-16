import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { INITIAL_CONTENT_STATUS, validateLessonBody } from "@elektro/shared";
import { db } from "../db/index.js";
import { lessons, lessonTranslations, lessonVersions } from "../db/schema/content.js";
import { LESSON_DRAFTS } from "./content-manifest.js";

/**
 * Loads the bundled lesson drafts (content/lessons) as `ai_draft`, for a
 * teacher to review in the app. Idempotent: an existing lesson is left alone,
 * so edits and approvals made in the app are never overwritten.
 */
async function main(): Promise<void> {
  for (const draft of LESSON_DRAFTS) {
    const body = readFileSync(new URL(`../../content/lessons/${draft.file}`, import.meta.url), "utf8");
    const validation = validateLessonBody(body);
    if (!validation.ok) {
      throw new Error(`${draft.slug}: invalid lesson body ${JSON.stringify(validation.errors)}`);
    }

    const created = await db().transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.slug, draft.slug))
        .limit(1);
      if (existing) {
        return false;
      }

      const [lesson] = await tx
        .insert(lessons)
        .values({ slug: draft.slug, topicId: draft.topicId, position: draft.position })
        .returning({ id: lessons.id });
      const [version] = await tx
        .insert(lessonVersions)
        .values({ lessonId: lesson!.id, version: 1 })
        .returning({ id: lessonVersions.id });
      await tx.insert(lessonTranslations).values({
        lessonVersionId: version!.id,
        locale: draft.locale,
        title: draft.title,
        summary: draft.summary,
        body,
        status: INITIAL_CONTENT_STATUS,
      });
      return true;
    });

    console.log(`${draft.slug}: ${created ? "created as draft" : "exists, left unchanged"}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
