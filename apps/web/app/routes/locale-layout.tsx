import {
  AppShell,
  Burger,
  Group,
  NavLink as MantineNavLink,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useParams } from "react-router";
import { isLocale, type Locale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import type { Route } from "./+types/locale-layout";

/**
 * Validates the locale segment and renders the app frame.
 *
 * Navigation is touch-only: a burger opens a full-width menu whose items are
 * all at least one touch target tall.
 */
export function loader({ params }: Route.LoaderArgs) {
  if (!isLocale(params.locale)) {
    // Unknown locale is a missing page, not a fallback to the default.
    throw new Response(null, { status: 404 });
  }

  return { locale: params.locale };
}

const NAV_ITEMS = [
  { path: "", labelKey: "nav.home" },
  { path: "lessons", labelKey: "nav.lessons" },
  { path: "calculators", labelKey: "nav.calculators" },
  { path: "simulator", labelKey: "nav.simulator" },
  { path: "login", labelKey: "nav.login" },
] as const;

export default function LocaleLayout() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (isLocale(params.locale) ? params.locale : "hu") as Locale;
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="md"
            aria-label={t("nav.menu")}
          />
          <Title order={1} size="h4">
            {t("app.name")}
          </Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {NAV_ITEMS.map((item) => (
          <MantineNavLink
            key={item.path}
            component={NavLink}
            to={localePath(locale, item.path)}
            end={item.path === ""}
            label={t(item.labelKey)}
            onClick={close}
            style={{ minHeight: 44 }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
