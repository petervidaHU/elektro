import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, useLoaderData } from "react-router";
import { DEFAULT_LOCALE, hasAtLeastRole, isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import { requireUser } from "../lib/session";
import type { Route } from "./+types/account";

/**
 * Profile (plan §3.3, login only): who you are and logging out. Changing the
 * name or password comes later; in v1 an admin resets passwords.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return { locale, user: await requireUser(request, locale) };
}

export default function Account() {
  const { t } = useTranslation();
  const { locale, user } = useLoaderData<typeof loader>();

  return (
    <Stack gap="lg" maw={520}>
      <Title order={2}>{t("account.title")}</Title>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="sm">
          <Field label={t("account.name")} value={user.name} />
          <Field label={t("account.email")} value={user.email} />
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              {t("account.role")}
            </Text>
            <Badge variant="light">{t(`role.${user.role}`)}</Badge>
          </Group>
        </Stack>
      </Card>

      {/* The phone tab bar has no teacher menu (plan §3.2), so it starts here. */}
      {hasAtLeastRole(user.role, "teacher") && (
        <Button component={Link} to={localePath(locale, "teacher/content")} variant="light" fullWidth>
          {t("nav.content")}
        </Button>
      )}

      <Form method="post" action={localePath(locale, "logout")}>
        <Button type="submit" variant="default" fullWidth>
          {t("account.logout")}
        </Button>
      </Form>
    </Stack>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} style={{ overflowWrap: "anywhere", textAlign: "right" }}>
        {value}
      </Text>
    </Group>
  );
}
