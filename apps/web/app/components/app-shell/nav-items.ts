import { hasAtLeastRole, type Locale, type Role } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import type { IconName } from "../icons";

export interface NavItem {
  key: "home" | "lessons" | "calculators" | "simulator" | "account" | "login" | "content";
  /** Path below the locale prefix. */
  path: string;
  /** i18next key of the label. */
  labelKey: `nav.${NavItem["key"]}`;
  icon: IconName;
  /** Active only on an exact match (the home tab). */
  end?: boolean;
  /** Further sections that belong to this tab. */
  alsoActiveOn?: string[];
}

const HOME: NavItem = { key: "home", path: "", labelKey: "nav.home", icon: "home", end: true };
/** "Tananyag" opens the syllabus (plan §3.3); lessons are reached through it. */
const LESSONS: NavItem = {
  key: "lessons",
  path: "syllabus",
  labelKey: "nav.lessons",
  icon: "book",
  alsoActiveOn: ["topics", "lessons"],
};
const CALCULATORS: NavItem = {
  key: "calculators",
  path: "calculators",
  labelKey: "nav.calculators",
  icon: "calculator",
};
const SIMULATOR: NavItem = {
  key: "simulator",
  path: "simulator",
  labelKey: "nav.simulator",
  icon: "gauge",
};
const ACCOUNT: NavItem = { key: "account", path: "account", labelKey: "nav.account", icon: "user" };
const LOGIN: NavItem = { key: "login", path: "login", labelKey: "nav.login", icon: "login" };
const CONTENT: NavItem = {
  key: "content",
  path: "teacher/content",
  labelKey: "nav.content",
  icon: "edit",
};

/**
 * The main navigation (docs/DEVELOPMENT_PLAN.md §3.2). Guests get the public
 * areas plus login; signed-in users get the simulator and their profile.
 * Teacher and admin menus join here once their pages exist.
 */
export function navItems(user: { role: Role } | null): NavItem[] {
  return user
    ? [HOME, LESSONS, CALCULATORS, SIMULATOR, ACCOUNT]
    : [HOME, LESSONS, CALCULATORS, LOGIN];
}

/**
 * The extra teacher/admin menu (plan §3.2). Desktop header only: the phone tab
 * bar keeps its five tabs, and the profile page links there instead.
 */
export function staffNavItems(user: { role: Role } | null): NavItem[] {
  return user && hasAtLeastRole(user.role, "teacher") ? [CONTENT] : [];
}

/** Whether the tab is the current one: its own section or one it covers. */
export function isNavItemActive(item: NavItem, locale: Locale, pathname: string): boolean {
  const within = (path: string) => {
    const target = localePath(locale, path);
    return pathname === target || pathname.startsWith(`${target}/`);
  };
  if (item.end) {
    return pathname === localePath(locale, item.path);
  }
  return within(item.path) || (item.alsoActiveOn ?? []).some(within);
}
