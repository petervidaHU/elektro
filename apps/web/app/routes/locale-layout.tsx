import { AppShell, Badge, Button, Container, Group, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLoaderData, useLocation } from "react-router";
import { isLocale, type Locale } from "@elektro/shared";
import { BottomNav } from "../components/app-shell/bottom-nav";
import { Breadcrumbs } from "../components/app-shell/breadcrumbs";
import { navItems, type NavItem } from "../components/app-shell/nav-items";
import { localePath } from "../i18n/locale";
import { getCurrentUser } from "../lib/session";
import type { Route } from "./+types/locale-layout";

/**
 * Validates the locale segment, loads the signed-in user once for every page
 * below it, and renders the app frame (docs/DEVELOPMENT_PLAN.md §3.2):
 *
 * - phone: a bottom tab bar within thumb reach;
 * - desktop (`sm` and up): the same items in the header.
 *
 * Child routes read the user with `useRouteLoaderData("routes/locale-layout")`.
 * Hiding items is a convenience only; the API checks the role on every request.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  if (!isLocale(params.locale)) {
    // Unknown locale is a missing page, not a fallback to the default.
    throw new Response(null, { status: 404 });
  }

  return { locale: params.locale, user: await getCurrentUser(request) };
}

export type LocaleLayoutData = Awaited<ReturnType<typeof loader>>;

const BOTTOM_BAR_HEIGHT = 64;

/** Same rule as `NavLink`: exact for `end` items, otherwise the whole subtree. */
function isActive(item: NavItem, locale: Locale, pathname: string): boolean {
  const target = localePath(locale, item.path);
  return item.end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
}

export default function LocaleLayout() {
  const { t } = useTranslation();
  const { locale, user } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const items = navItems(user);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: { base: BOTTOM_BAR_HEIGHT, sm: 0 } }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Title order={1} size="h4">
              <Link to={localePath(locale)} style={{ color: "inherit", textDecoration: "none" }}>
                {t("app.name")}
              </Link>
            </Title>

            <Group gap="xs" visibleFrom="sm" component="nav" aria-label={t("nav.headerNav")}>
              {items.map((item) => (
                <Button
                  key={item.key}
                  component={NavLink}
                  to={localePath(locale, item.path)}
                  end={item.end}
                  variant={isActive(item, locale, pathname) ? "light" : "subtle"}
                >
                  {t(item.labelKey)}
                </Button>
              ))}
            </Group>

            {user && (
              <Group gap="xs" visibleFrom="sm" wrap="nowrap">
                <Text size="sm" truncate maw={180}>
                  {user.name}
                </Text>
                <Badge variant="light">{t(`role.${user.role}`)}</Badge>
              </Group>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" px={0}>
          <Breadcrumbs locale={locale} />
          <Outlet />
        </Container>
      </AppShell.Main>

      <AppShell.Footer hiddenFrom="sm">
        <BottomNav items={items} locale={locale} />
      </AppShell.Footer>
    </AppShell>
  );
}
