import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { hasAtLeastRole, PLANNED_CALCULATORS, requirementStates, unmetRequirements } from "@elektro/shared";
import { apiFetch } from "../lib/api";
import { getCurrentUser } from "../lib/session";
import { localePath } from "../i18n/locale";
import { listCalculators } from "../lib/calculators";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/calculators";

/** The published calculators, in the order set on the content page (plan Q21). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const calculators = await listCalculators(request, String(params.locale));
  // Staff also see what a waiting calculator is missing (verified tables, plan K9).
  const user = await getCurrentUser(request);
  const staff = user !== null && hasAtLeastRole(user.role, "teacher");
  const listed = staff
    ? await apiFetch<{ tables: Parameters<typeof requirementStates>[1] }>(request, "/api/reference-tables")
        .then((data) => data.tables)
        .catch(() => [])
    : [];
  return {
    calculators,
    staff,
    waiting: PLANNED_CALCULATORS.map((item) => ({
      id: item.id,
      unmet: staff ? unmetRequirements(requirementStates(item.requiresTables, listed)).map((state) => state.key) : [],
    })),
  };
}

export default function Calculators() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { calculators, staff, waiting } = useLoaderData<typeof loader>();

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
        {waiting.map((item) => (
          <Card key={item.id} withBorder padding="lg" radius="md" style={{ minHeight: 110, opacity: 0.75 }} aria-disabled="true" data-planned={item.id}>
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Title order={3} size="h4">{t(`calculators.planned.${item.id}`)}</Title>
              <Badge color="gray" variant="light">{t("syllabus.comingSoon")}</Badge>
            </Group>
            <Text c="dimmed" mt="xs">{t(`calculators.plannedHint.${item.id}`)}</Text>
            {staff && item.unmet.length > 0 && (
              <Text size="sm" mt="xs" component={Link} to={localePath(locale, "teacher/reference-tables")} td="underline" data-testid="planned-missing">
                {t("calculators.plannedMissing", { count: item.unmet.length })}
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
