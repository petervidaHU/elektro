import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import type { Locale } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import { Icon } from "../icons";
import { isNavItemActive, type NavItem } from "./nav-items";
import classes from "./bottom-nav.module.css";

/** Phone tab bar; the active tab carries `aria-current="page"`. */
export function BottomNav({
  items,
  locale,
  badges = {},
}: {
  items: NavItem[];
  locale: Locale;
  /** A count on a tab, e.g. lessons waiting for review on the teacher tab. */
  badges?: Partial<Record<NavItem["key"], number>>;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav aria-label={t("nav.bottomBar")} className={classes.bar}>
      {items.map((item) => (
        <Link
          key={item.key}
          to={localePath(locale, item.path)}
          aria-current={isNavItemActive(item, locale, pathname) ? "page" : undefined}
          className={classes.tab}
        >
          <span className={classes.icon}>
            <Icon name={item.icon} />
            {(badges[item.key] ?? 0) > 0 && (
              <span className={classes.badge} aria-label={t("teacher.reviewCount", { count: badges[item.key] })}>
                {badges[item.key]}
              </span>
            )}
          </span>
          <span>{t(item.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}
