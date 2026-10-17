import { AppShell, Badge, Button, Container, Group, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, Outlet, useLoaderData, useLocation, useNavigation } from "react-router";
import { isLocale } from "@elektro/shared";
import { BottomNav } from "../components/app-shell/bottom-nav";
import { Breadcrumbs } from "../components/app-shell/breadcrumbs";
import { isNavItemActive, navItems } from "../components/app-shell/nav-items";
import { OfflineBanner } from "../components/feedback/offline-banner";
import { PageSkeleton } from "../components/feedback/page-skeleton";
import { ToastProvider } from "../components/feedback/toast";
import { localePath } from "../i18n/locale";
import { apiFetch } from "../lib/api";
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

  const user = await getCurrentUser(request);
  return { locale: params.locale, user, reviewCount: user && user.role !== "student" ? await reviewQueueCount(request, params.locale) : 0 };
}

/** Lessons waiting for review: the badge on the teacher tab (plan J8). */
async function reviewQueueCount(request: Request, locale: string): Promise<number> {
  try {
    const { items } = await apiFetch<{ items: unknown[] }>(request, `/api/manage/review?locale=${locale}`);
    return items.length;
  } catch {
    // The badge is a convenience: never fail a page because of it.
    return 0;
  }
}

export type LocaleLayoutData = Awaited<ReturnType<typeof loader>>;

const BOTTOM_BAR_HEIGHT = 64;

/** Only a navigation that takes longer than this shows the skeleton (no flicker). */
const SKELETON_DELAY_MS = 200;

/** True while a navigation to another page has been loading for a moment. */
function useSlowNavigation(): boolean {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const [slowKey, setSlowKey] = useState<string | null>(null);
  // A form submit (e.g. a practice answer) stays on the page: no skeleton.
  const key =
    navigation.state === "loading" && navigation.formMethod === undefined && navigation.location.pathname !== pathname
      ? navigation.location.key
      : null;

  useEffect(() => {
    if (key === null) return;
    const timer = setTimeout(() => setSlowKey(key), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);

  return key !== null && slowKey === key;
}

/** Only the teacher tab carries a count (lessons waiting for review). */
const badgeFor = (key: string, reviewCount: number) => (key === "teacher" ? reviewCount : 0);

export default function LocaleLayout() {
  const { t } = useTranslation();
  const { locale, user, reviewCount } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const items = navItems(user);
  const slowNavigation = useSlowNavigation();

  return (
    <ToastProvider>
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
                  component={Link}
                  to={localePath(locale, item.path)}
                  aria-current={isNavItemActive(item, locale, pathname) ? "page" : undefined}
                  variant={isNavItemActive(item, locale, pathname) ? "light" : "subtle"}
                >
                  {t(item.labelKey)}
                  {badgeFor(item.key, reviewCount) > 0 && (
                    <Badge size="sm" circle color="red" ml={6} aria-label={t("teacher.reviewCount", { count: reviewCount })}>
                      {reviewCount}
                    </Badge>
                  )}
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
          <OfflineBanner />
          <Breadcrumbs locale={locale} />
          {slowNavigation ? <PageSkeleton /> : <Outlet />}
        </Container>
      </AppShell.Main>

      <AppShell.Footer hiddenFrom="sm">
        <BottomNav items={items} locale={locale} badges={{ teacher: reviewCount }} />
      </AppShell.Footer>
    </AppShell>
    </ToastProvider>
  );
}
