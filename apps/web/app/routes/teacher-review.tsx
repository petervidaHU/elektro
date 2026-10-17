import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, isLocale, type ContentStatus, type TopicId } from "@elektro/shared";
import { TeacherTabs } from "../components/teacher/teacher-tabs";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-review";

interface QueueItem {
  kind: "lesson" | "glossary" | "intro";
  slug: string;
  topicId: TopicId | null;
  version: number;
  title: string | null;
  status: ContentStatus;
  updatedAt: string;
  hasLive: boolean;
}

/** Review queue (plan §3.3 `/teacher/review`): lessons waiting for a decision, oldest first. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const { items } = await apiFetch<{ items: QueueItem[] }>(request, `/api/manage/review?locale=${locale}`);
  return { items };
}

export default function TeacherReview() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { items } = useLoaderData<typeof loader>();
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Europe/Budapest" });

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("teacher.review.title")}</Title>
      <TeacherTabs />

      {items.length === 0 ? (
        <Text data-testid="review-empty">{t("teacher.review.empty")}</Text>
      ) : (
        items.map((item) => (
          <Card
            key={`${item.kind}-${item.slug}`}
            component={Link}
            to={localePath(locale, item.kind === "lesson" ? `teacher/review/${item.slug}` : `teacher/review/${item.kind}/${item.slug}`)}
            withBorder
            padding="md"
            radius="md"
            data-review-slug={item.slug}
          >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{item.kind === "intro" ? t(`topic.${item.slug}`) : item.title}</Text>
                <Text size="sm" c="dimmed">
                  {item.kind === "lesson" && item.topicId ? `${t(`topic.${item.topicId}`)} · ` : `${t(`teacher.review.kind.${item.kind}`)} · `}{t("review.version", { version: item.version })}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("teacher.review.updated", { date: dateFormat.format(new Date(item.updatedAt)) })}
                  {item.hasLive ? ` · ${t("teacher.review.hasLive")}` : ""}
                </Text>
              </Stack>
              <Badge variant="light" color={item.status === "in_review" ? "yellow" : "gray"}>
                {t(`lessons.status.${item.status}`)}
              </Badge>
            </Group>
          </Card>
        ))
      )}
    </Stack>
  );
}
