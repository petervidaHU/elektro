import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { localePath } from "../i18n/locale";
import { listCalculators } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/calculators";

/** The published calculators, in the order set on the content page (plan Q21). */
export async function loader({ request, params }: Route.LoaderArgs) {
  return { calculators: await listCalculators(request, String(params.locale)) };
}

export default function Calculators() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { calculators } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg">
      <Title order={2}>{t("calculators.title")}</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {calculators.map((calculator) => (
          <Card
            key={calculator.id}
            component={Link}
            to={localePath(locale, calculator.path)}
            withBorder
            padding="lg"
            radius="md"
            style={{ minHeight: 110 }}
          >
            <Title order={3} size="h4">
              {calculator.title}
            </Title>
            {calculator.description && (
              <Text c="dimmed" mt="xs">
                {calculator.description}
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
