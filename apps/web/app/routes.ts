import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * URLs carry the locale: every app route lives under `/:locale/...`, and `/`
 * only redirects to the default locale. Pages and their access levels follow
 * docs/DEVELOPMENT_PLAN.md §3.3.
 */
export default [
  index("routes/locale-redirect.tsx"),

  route(":locale", "routes/locale-layout.tsx", [
    index("routes/home.tsx"),
    route("lessons", "routes/lessons.tsx"),
    route("lessons/:slug", "routes/lesson.tsx"),
    route("calculators", "routes/calculators.tsx"),
    route("calculators/voltage-drop", "routes/voltage-drop.tsx"),
    route("simulator", "routes/simulator.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("logout", "routes/logout.tsx"),
    route("account", "routes/account.tsx"),
  ]),
] satisfies RouteConfig;
