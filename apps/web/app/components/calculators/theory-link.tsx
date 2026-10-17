import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TopicId } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import { apiFetch } from "../../lib/api";
import { useLayoutData } from "../../lib/use-layout-data";

export interface TheoryLesson {
  slug: string;
  title: string;
}

/** The readable lessons of a topic, in order; empty if the lookup fails (the link is optional). */
export async function loadTopicLessons(request: Request, locale: string, topicId: TopicId): Promise<TheoryLesson[]> {
  try {
    const { lessons } = await apiFetch<{ lessons: TheoryLesson[] }>(
      request,
      `/api/lessons?${new URLSearchParams({ locale, topicId }).toString()}`,
    );
    return lessons;
  } catch {
    return [];
  }
}

/**
 * "Tanuld meg az elméletet" (plan K11): from a calculator to the topic's first
 * lesson, or to the topic page while it has no readable lesson yet.
 */
export function TheoryLink({ topicId, lessons }: { topicId: TopicId; lessons: TheoryLesson[] }) {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const first = lessons[0];

  return (
    <Button
      component={Link}
      to={localePath(locale, first ? `lessons/${first.slug}` : `topics/${topicId}`)}
      variant="light"
      data-testid="theory-link"
    >
      {first ? t("calculators.theory", { title: first.title }) : t("calculators.theoryTopic")}
    </Button>
  );
}
