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
    route("syllabus", "routes/syllabus.tsx"),
    route("topics/:topicId", "routes/topic.tsx"),
    route("lessons", "routes/lessons.tsx"),
    route("lessons/:slug", "routes/lesson.tsx"),
    route("lessons/:slug/summary", "routes/lesson-summary.tsx"),
    route("practice/:topicId", "routes/practice-start.tsx"),
    route("practice/s/:sessionId", "routes/practice-session.tsx"),
    route("practice/s/:sessionId/summary", "routes/practice-summary.tsx"),
    route("progress", "routes/progress.tsx"),
    route("calculators", "routes/calculators.tsx"),
    route("calculators/voltage-drop", "routes/voltage-drop.tsx"),
    route("simulator", "routes/simulator.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("logout", "routes/logout.tsx"),
    route("account", "routes/account.tsx"),
    route("teacher/content", "routes/teacher-content.tsx"),
    route("teacher/content/lessons/new", "routes/teacher-lesson-new.tsx"),
    route("teacher/content/lessons/:slug", "routes/teacher-lesson-edit.tsx"),
    route("teacher/content/calculators/new", "routes/teacher-calculator-new.tsx"),
    route("teacher/content/calculators/:id", "routes/teacher-calculator-edit.tsx"),
  ]),
] satisfies RouteConfig;
