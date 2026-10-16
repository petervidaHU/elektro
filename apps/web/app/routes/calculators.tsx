import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";

/** v1 ships the voltage-drop calculator; more follow per topic. */
const CALCULATORS = [{ path: "calculators/voltage-drop", key: "voltageDrop" }] as const;

export default function Calculators() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : "hu";

  return (
    <Stack gap="lg">
      <Title order={2}>{t("calculators.title")}</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {CALCULATORS.map((calculator) => (
          <Card
            key={calculator.path}
            component={Link}
            to={localePath(locale, calculator.path)}
            withBorder
            padding="lg"
            radius="md"
            style={{ minHeight: 110 }}
          >
            <Title order={3} size="h4">
              {t(`calculators.${calculator.key}.title`)}
            </Title>
            <Text c="dimmed" mt="xs">
              {t(`calculators.${calculator.key}.description`)}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
