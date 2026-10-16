import { Badge, Group, Stack, Text, Title, Typography } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import type { ContentStatus, TopicId } from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { apiFetch } from "../lib/api";
import type { Route } from "./+types/lesson";

interface Lesson {
  id: string;
  topicId: TopicId;
  version: number;
  locale: string;
  title: string;
  summary: string | null;
  body: string;
  status: ContentStatus;
  approvedAt: string | null;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const query = new URLSearchParams({ locale: String(params.locale) });

  const data = await apiFetch<{ lesson: Lesson }>(
    request,
    `/api/lessons/${String(params.slug)}?${query.toString()}`,
  );

  return { lesson: data.lesson };
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => [
    { labelKey: "nav.lessons", path: "lessons" },
    { label: (data as Awaited<ReturnType<typeof loader>> | undefined)?.lesson.title ?? "" },
  ],
};

export default function LessonDetail() {
  const { lesson } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Group gap="sm">
        <Text size="sm" c="dimmed">
          {t(`topic.${lesson.topicId}`)}
        </Text>
        {lesson.status !== "approved" && (
          <Badge variant="light" color="yellow">
            {t(`lessons.status.${lesson.status}`)}
          </Badge>
        )}
      </Group>

      <Title order={2}>{lesson.title}</Title>

      {lesson.summary && <Text fw={500}>{lesson.summary}</Text>}

      {/* Lesson bodies are authored content, rendered as plain text until the
          content pipeline settles on a markup format. */}
      <Typography>
        <Text style={{ whiteSpace: "pre-wrap" }}>{lesson.body}</Text>
      </Typography>
    </Stack>
  );
}
