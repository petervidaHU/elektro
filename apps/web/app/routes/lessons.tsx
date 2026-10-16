import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData, useParams } from "react-router";
import { isLocale, type ContentStatus, type TopicId } from "@elektro/shared";
import { apiFetch } from "../lib/api";
import { localePath } from "../i18n/locale";
import type { Route } from "./+types/lessons";

interface LessonListItem {
  slug: string;
  topicId: TopicId;
  version: number;
  title: string;
  summary: string | null;
  status: ContentStatus;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topicId");

  const query = new URLSearchParams({ locale: String(params.locale) });
  if (topicId) {
    query.set("topicId", topicId);
  }

  const data = await apiFetch<{ lessons: LessonListItem[] }>(
    request,
    `/api/lessons?${query.toString()}`,
  );

  return { lessons: data.lessons };
}

export default function Lessons() {
  const { lessons } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : "hu";

  return (
    <Stack gap="lg">
      <Title order={2}>{t("lessons.title")}</Title>

      {lessons.length === 0 ? (
        <Text c="dimmed">{t("lessons.empty")}</Text>
      ) : (
        <Stack gap="sm">
          {lessons.map((lesson) => (
            <Card
              key={lesson.slug}
              component={Link}
              to={localePath(locale, `lessons/${lesson.slug}`)}
              withBorder
              padding="md"
              radius="md"
              style={{ minHeight: 72 }}
            >
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <div>
                  <Text fw={600}>{lesson.title}</Text>
                  <Text size="sm" c="dimmed">
                    {t(`topic.${lesson.topicId}`)}
                  </Text>
                </div>
                {lesson.status !== "approved" && (
                  <Badge variant="light" color="yellow">
                    {t(`lessons.status.${lesson.status}`)}
                  </Badge>
                )}
              </Group>
              {lesson.summary && (
                <Text size="sm" mt="xs">
                  {lesson.summary}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
