import { z } from "zod";
import { upsertGlossaryTranslationSchema, termKeySchema } from "@elektro/shared";

/** One term of `content/glossary/<locale>.json`: the same fields the API validates on save. */
export const glossaryFileEntrySchema = upsertGlossaryTranslationSchema.omit({ locale: true }).extend({
  key: termKeySchema,
});

export const glossaryFileSchema = z.array(glossaryFileEntrySchema).superRefine((entries, ctx) => {
  const keys = entries.map((entry) => entry.key);
  keys.forEach((key, index) => {
    if (keys.indexOf(key) !== index) {
      ctx.addIssue({ code: "custom", path: [index, "key"], message: "duplicate_key" });
    }
  });
});

export type GlossaryFileEntry = z.infer<typeof glossaryFileEntrySchema>;
