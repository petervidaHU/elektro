import type { Locale, TopicId } from "@elektro/shared";

/**
 * Lesson drafts shipped with the app (AI-generated, plan §1.3). The seed
 * script loads them as `ai_draft`; a teacher reviews and approves them in the
 * app. A lesson that already exists is never overwritten.
 */
export interface LessonDraft {
  slug: string;
  topicId: TopicId;
  position: number;
  locale: Locale;
  title: string;
  summary: string;
  /** Path under `content/lessons/`. */
  file: string;
}

export const LESSON_DRAFTS: readonly LessonDraft[] = [
  {
    slug: "feszultseges-szamitasa",
    topicId: "voltage-drop",
    position: 1,
    locale: "hu",
    title: "A feszültségesés számítása",
    summary:
      "Mitől függ a vezeték feszültségesése, és hogyan számítjuk ki egy- és háromfázisú áramkörben.",
    file: "hu/feszultseges-szamitasa.md",
  },
];
