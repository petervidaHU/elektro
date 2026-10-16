import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useMatches } from "react-router";
import type { Locale } from "@elektro/shared";
import { localePath } from "../../i18n/locale";

/** One step of the trail: a translation key or a content title (e.g. a lesson). */
export interface Crumb {
  labelKey?: string;
  label?: string;
  /** Path below the locale prefix; the last crumb has none. */
  path?: string;
}

/**
 * Deep pages export `handle = { breadcrumbs: (data) => Crumb[] }`; the deepest
 * matching route that has one draws the trail. Top-level pages have no trail -
 * the tab bar already says where you are.
 */
export interface BreadcrumbHandle {
  breadcrumbs: (data: unknown) => Crumb[];
}

function hasBreadcrumbs(handle: unknown): handle is BreadcrumbHandle {
  return (
    typeof handle === "object" &&
    handle !== null &&
    typeof (handle as Partial<BreadcrumbHandle>).breadcrumbs === "function"
  );
}

export function Breadcrumbs({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const match = [...useMatches()].reverse().find((item) => hasBreadcrumbs(item.handle));

  if (!match || !hasBreadcrumbs(match.handle)) {
    return null;
  }

  const crumbs = match.handle.breadcrumbs(match.data);

  return (
    <nav aria-label={t("nav.breadcrumbs")}>
      <MantineBreadcrumbs mb="sm" separatorMargin={4}>
        {crumbs.map((crumb, index) => {
          const label = crumb.label ?? (crumb.labelKey ? t(crumb.labelKey) : "");
          return crumb.path !== undefined ? (
            <Anchor key={index} component={Link} to={localePath(locale, crumb.path)} size="sm">
              {label}
            </Anchor>
          ) : (
            <Text key={index} size="sm" c="dimmed" aria-current="page" lineClamp={1}>
              {label}
            </Text>
          );
        })}
      </MantineBreadcrumbs>
    </nav>
  );
}
