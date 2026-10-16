import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import type { Locale } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import { Icon } from "../icons";
import type { NavItem } from "./nav-items";
import classes from "./bottom-nav.module.css";

/** Phone tab bar. `NavLink` marks the active tab with `aria-current="page"`. */
export function BottomNav({ items, locale }: { items: NavItem[]; locale: Locale }) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("nav.bottomBar")} className={classes.bar}>
      {items.map((item) => (
        <NavLink
          key={item.key}
          to={localePath(locale, item.path)}
          end={item.end}
          className={classes.tab}
        >
          <Icon name={item.icon} />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
