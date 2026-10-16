import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";

/** The three v1 modules: theory, calculators, measurement simulator. */
const MODULES = [
  { path: "lessons", key: "lessons" },
  { path: "calculators", key: "calculators" },
  { path: "simulator", key: "simulator" },
] as const;

export default function Home() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : "hu";

  return (
    <Stack gap="lg">
      <Title order={2}>{t("home.title")}</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {MODULES.map((module) => (
          <Card
            key={module.path}
            component={Link}
            to={localePath(locale, module.path)}
            withBorder
            padding="lg"
            radius="md"
            style={{ minHeight: 120 }}
          >
            <Title order={3} size="h4">
              {t(`home.${module.key}.title`)}
            </Title>
            <Text c="dimmed" mt="xs">
              {t(`home.${module.key}.description`)}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
