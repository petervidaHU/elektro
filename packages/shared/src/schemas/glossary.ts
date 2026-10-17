import { z } from "zod";
import { localeSchema, slugSchema } from "./content.js";
import type { Locale } from "../locales.js";

/** Glossary term (fogalomtár, plan §1.3): a language-neutral key + per-locale text. */
export const termKeySchema = slugSchema;

export const upsertGlossaryTranslationSchema = z.object({
  locale: localeSchema,
  term: z.string().trim().min(1).max(120),
  definition: z.string().trim().min(1).max(2000),
});

export const createGlossaryTermSchema = upsertGlossaryTranslationSchema.extend({ key: termKeySchema });

/** Topic intro (plan §1.3): a short per-locale description for the syllabus and the topic hub. */
export const upsertTopicIntroSchema = z.object({
  locale: localeSchema,
  text: z.string().trim().min(1).max(1500),
});

export type UpsertGlossaryTranslationInput = z.infer<typeof upsertGlossaryTranslationSchema>;
export type CreateGlossaryTermInput = z.infer<typeof createGlossaryTermSchema>;
export type UpsertTopicIntroInput = z.infer<typeof upsertTopicIntroSchema>;

/** The index letter of a term: accents removed, so "Á" belongs under "A". */
export function glossaryLetter(term: string): string {
  const first = term.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0);
  return first.toLocaleUpperCase();
}

/** Alphabetical order for the glossary list, by the locale's rules. */
export function sortGlossary<T extends { term: string }>(items: readonly T[], locale: Locale): T[] {
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return [...items].sort((a, b) => collator.compare(a.term, b.term));
}
