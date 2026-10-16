import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { MODULES, topicsByModule, type MasteryLevel, type Topic } from "@elektro/shared";
import { MasteryBadge, TopicBadges } from "../components/topic/topic-badges";
import { localePath } from "../i18n/locale";
import { getCurrentUser } from "../lib/session";
import { getProgress } from "../lib/progress";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/syllabus";

/**
 * The syllabus (plan §1.2, U3): modules and their topics in curriculum order.
 * Topics whose content comes later are shown, marked "coming soon".
 */
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getCurrentUser(request);
  const progress = await getProgress(request, user !== null);
  return { progress: Object.fromEntries(progress.map((row) => [row.topicId, row.masteryLevel])) };
}

export default function Syllabus() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { progress } = useLoaderData<typeof loader>();

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>{t("syllabus.title")}</Title>
        <Text c="dimmed">{t("syllabus.intro")}</Text>
      </Stack>

      {MODULES.map((module) => (
        <Stack key={module} gap="sm" component="section" aria-labelledby={`module-${module}`}>
          <Title order={3} size="h4" id={`module-${module}`}>
            {t(`module.${module}`)}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {topicsByModule(module).map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                to={localePath(locale, `topics/${topic.id}`)}
                mastery={progress[topic.id]}
              />
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  );
}

function TopicCard({ topic, to, mastery }: { topic: Topic; to: string; mastery?: MasteryLevel }) {
  const { t } = useTranslation();
  const available = topic.contentPhase === 1;

  const body = (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Text fw={600}>{t(`topic.${topic.id}`)}</Text>
        {!available && (
          <Badge color="gray" variant="light" style={{ flexShrink: 0 }}>
            {t("syllabus.comingSoon")}
          </Badge>
        )}
        {available && mastery && mastery !== "none" && <MasteryBadge level={mastery} />}
      </Group>
      <TopicBadges topic={topic} />
    </Stack>
  );

  return available ? (
    <Card component={Link} to={to} withBorder padding="md" radius="md" style={{ minHeight: 64 }}>
      {body}
    </Card>
  ) : (
    <Card withBorder padding="md" radius="md" style={{ minHeight: 64, opacity: 0.6 }} aria-disabled="true">
      {body}
    </Card>
  );
}
