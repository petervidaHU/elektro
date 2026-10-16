import { Badge, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { MasteryLevel, Topic } from "@elektro/shared";

const MASTERY_COLOR: Record<MasteryLevel, string> = {
  none: "gray",
  started: "yellow",
  practising: "blue",
  mastered: "green",
};

/** Exam relevance and the safety-critical flag of a topic (plan §3.1). */
export function TopicBadges({ topic }: { topic: Topic }) {
  const { t } = useTranslation();
  if (topic.examParts.length === 0 && !topic.safetyCritical) {
    return null;
  }
  return (
    <Group gap={6}>
      {topic.safetyCritical && (
        <Badge color="red" variant="light">
          {t("syllabus.safetyCritical")}
        </Badge>
      )}
      {topic.examParts.length > 0 && (
        <Badge color="violet" variant="light">
          {t("syllabus.exam", {
            parts: topic.examParts.map((part) => t(`examPartShort.${part}`)).join(", "),
          })}
        </Badge>
      )}
    </Group>
  );
}

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  const { t } = useTranslation();
  return (
    <Badge color={MASTERY_COLOR[level]} variant={level === "mastered" ? "filled" : "light"}>
      {t(`mastery.${level}`)}
    </Badge>
  );
}
