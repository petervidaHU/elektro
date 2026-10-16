import type { Role } from "@elektro/shared";
import type { IconName } from "../icons";

export interface NavItem {
  key: "home" | "lessons" | "calculators" | "simulator" | "account" | "login";
  /** Path below the locale prefix. */
  path: string;
  /** i18next key of the label. */
  labelKey: `nav.${NavItem["key"]}`;
  icon: IconName;
  /** Active only on an exact match (the home tab). */
  end?: boolean;
}

const HOME: NavItem = { key: "home", path: "", labelKey: "nav.home", icon: "home", end: true };
const LESSONS: NavItem = { key: "lessons", path: "lessons", labelKey: "nav.lessons", icon: "book" };
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
