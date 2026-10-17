import type { Locale, Role } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import type { IconName } from "../icons";

export interface NavItem {
  key: "home" | "lessons" | "calculators" | "simulator" | "teacher" | "account" | "login";
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
/** Teachers and admins: students, review queue, reports, insights (plan §3.3). */
const TEACHER: NavItem = {
  key: "teacher",
  path: "teacher/students",
  labelKey: "nav.teacher",
  icon: "clipboard",
  alsoActiveOn: ["teacher/review", "teacher/reports", "teacher/insights", "teacher/reference-tables", "teacher/glossary", "teacher/intros"],
};
const ACCOUNT: NavItem = { key: "account", path: "account", labelKey: "nav.account", icon: "user" };
const LOGIN: NavItem = { key: "login", path: "login", labelKey: "nav.login", icon: "login" };

/**
 * The main navigation (docs/DEVELOPMENT_PLAN.md §3.2). Guests get the public
 * areas plus login; signed-in users get the simulator and their profile.
 * Teachers and admins swap the simulator tab for their own area (the
 * simulator stays on the home page); the bar keeps five tabs on a phone.
 */
export function navItems(user: { role: Role } | null): NavItem[] {
  if (!user) {
    return [HOME, LESSONS, CALCULATORS, LOGIN];
  }
  return user.role === "student"
    ? [HOME, LESSONS, CALCULATORS, SIMULATOR, ACCOUNT]
    : [HOME, LESSONS, CALCULATORS, TEACHER, ACCOUNT];
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
