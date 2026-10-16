import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Locale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import { loginPath, registerPath } from "../lib/return-to";
import { useLayoutData } from "../lib/use-layout-data";

/** The three v1 modules. The simulator needs a login (plan §3.3). */
const MODULES = [
  { path: "lessons", key: "lessons", requiresLogin: false },
  { path: "calculators", key: "calculators", requiresLogin: false },
  { path: "simulator", key: "simulator", requiresLogin: true },
] as const;

/**
 * `/:locale`: the landing page for guests, the dashboard once signed in
 * (docs/DEVELOPMENT_PLAN.md §3.4 J1/J2). The full dashboard - continue where
 * you left off, recommended next, exam readiness - arrives with M2 (U5).
 */
export default function Home() {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();

  return (
    <Stack gap="xl">
      {user ? (
        <Stack gap={4}>
          <Title order={2}>{t("dashboard.greeting", { name: user.name })}</Title>
          <Text c="dimmed">{t("dashboard.subtitle")}</Text>
        </Stack>
      ) : (
        <Stack gap="md">
          <Title order={2}>{t("landing.title")}</Title>
          <Text>{t("landing.intro")}</Text>
          <Stack gap="sm" maw={420}>
            <Button component={Link} to={registerPath(locale)} fullWidth>
              {t("landing.register")}
            </Button>
            <Button component={Link} to={loginPath(locale)} variant="default" fullWidth>
              {t("landing.login")}
            </Button>
          </Stack>
        </Stack>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {MODULES.map((module) => (
          <ModuleCard
            key={module.path}
            locale={locale}
            path={module.path}
            titleKey={`home.${module.key}.title`}
            descriptionKey={`home.${module.key}.description`}
            locked={module.requiresLogin && !user}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

interface ModuleCardProps {
  locale: Locale;
  path: string;
  titleKey: string;
  descriptionKey: string;
  /** Guests see login-only modules locked, with a way to log in (plan Q10). */
  locked: boolean;
}

function ModuleCard({ locale, path, titleKey, descriptionKey, locked }: ModuleCardProps) {
  const { t } = useTranslation();
  const target = localePath(locale, path);

  return (
    <Card
      component={Link}
      to={locked ? loginPath(locale, target) : target}
      withBorder
      padding="lg"
      radius="md"
      style={{ minHeight: 120 }}
      aria-describedby={locked ? `${path}-locked` : undefined}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Title order={3} size="h4">
          {t(titleKey)}
        </Title>
        {locked && (
          <Badge variant="light" color="gray" style={{ flexShrink: 0 }}>
            {t("home.locked")}
          </Badge>
        )}
      </Group>
      <Text c="dimmed" mt="xs">
        {t(descriptionKey)}
      </Text>
      {locked && (
        <Text id={`${path}-locked`} size="sm" mt="xs">
          {t("home.lockedHint")}
        </Text>
      )}
    </Card>
  );
}
