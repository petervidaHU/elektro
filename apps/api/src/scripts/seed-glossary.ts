import { readFileSync } from "node:fs";
import { and, desc, eq } from "drizzle-orm";
import { INITIAL_CONTENT_STATUS, LOCALES, type Locale } from "@elektro/shared";
import { glossaryFileSchema } from "../content/glossary-files.js";
import { db } from "../db/index.js";
import { glossaryTerms, glossaryTranslations } from "../db/schema/content.js";

/**
 * Loads `content/glossary/<locale>.json` as drafts for teacher review (plan
 * S5), like `db:seed:content` does for lessons: a new term is created as
 * `ai_draft`; a term still in `ai_draft` is updated from the file; anything
 * in review, sent back or approved is never touched.
 */
async function main(): Promise<void> {
  const counts = { created: 0, updated: 0, kept: 0 };

  for (const locale of LOCALES as readonly Locale[]) {
    let raw: string;
    try {
      raw = readFileSync(new URL(`../../content/glossary/${locale}.json`, import.meta.url), "utf8");
    } catch {
      continue;
    }
    const entries = glossaryFileSchema.parse(JSON.parse(raw));

    for (const entry of entries) {
      await db().transaction(async (tx) => {
        const [existing] = await tx.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.key, entry.key)).limit(1);
        const termId =
          existing?.id ??
          (await tx.insert(glossaryTerms).values({ key: entry.key }).returning({ id: glossaryTerms.id }))[0]!.id;

        const [latest] = await tx
          .select({ id: glossaryTranslations.id, version: glossaryTranslations.version, status: glossaryTranslations.status })
          .from(glossaryTranslations)
          .where(and(eq(glossaryTranslations.termId, termId), eq(glossaryTranslations.locale, locale)))
          .orderBy(desc(glossaryTranslations.version))
          .limit(1);

        if (!latest) {
          await tx.insert(glossaryTranslations).values({ termId, locale, version: 1, term: entry.term, definition: entry.definition, status: INITIAL_CONTENT_STATUS });
          counts.created++;
        } else if (latest.status === INITIAL_CONTENT_STATUS) {
          await tx
            .update(glossaryTranslations)
            .set({ term: entry.term, definition: entry.definition, updatedAt: new Date() })
            .where(eq(glossaryTranslations.id, latest.id));
          counts.updated++;
        } else {
          counts.kept++;
        }
      });
    }
  }

  console.log(`Glossary seeded: ${counts.created} created, ${counts.updated} updated, ${counts.kept} left alone (already in review or approved).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
