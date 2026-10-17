import { Badge, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { localePath } from "../../i18n/locale";
import { useLayoutData } from "../../lib/use-layout-data";

const TABS = [
  { path: "teacher/students", key: "students" },
  { path: "teacher/review", key: "review" },
  { path: "teacher/glossary", key: "glossary" },
  { path: "teacher/intros", key: "intros" },
  { path: "teacher/reference-tables", key: "referenceTables" },
  { path: "teacher/reports", key: "reports" },
  { path: "teacher/insights", key: "insights" },
] as const;

/**
 * The teacher area's sections (plan §3.3), with the number of lessons waiting
 * for review on the review tab. Content lives on the syllabus page (U14).
 */
export function TeacherTabs() {
  const { t } = useTranslation();
  const { locale, reviewCount } = useLayoutData();
  const { pathname } = useLocation();

  return (
    <Group component="nav" gap="xs" aria-label={t("teacher.sections")} mb="md">
      {TABS.map((tab) => {
        const target = localePath(locale, tab.path);
        const active = pathname === target || pathname.startsWith(`${target}/`);
        return (
          <Link
            key={tab.key}
            to={target}
            aria-current={active ? "page" : undefined}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              borderRadius: 22,
              textDecoration: "none",
              fontWeight: active ? 700 : 500,
              color: "inherit",
              background: active ? "var(--mantine-primary-color-light)" : "var(--mantine-color-default-hover)",
            }}
          >
            {t(`teacher.tabs.${tab.key}`)}
            {tab.key === "review" && reviewCount > 0 && (
              <Badge size="sm" circle color="red" aria-label={t("teacher.reviewCount", { count: reviewCount })}>
                {reviewCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </Group>
  );
}
