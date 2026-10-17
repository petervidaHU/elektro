import { describe, expect, it } from "vitest";
import { isNavItemActive, navItems } from "./nav-items";

/** docs/DEVELOPMENT_PLAN.md §3.2: the tabs differ for guests and users. */
describe("navItems", () => {
  it("gives guests home, lessons, calculators and login", () => {
    expect(navItems(null).map((item) => item.key)).toEqual([
      "home",
      "lessons",
      "calculators",
      "login",
    ]);
  });

  it("gives students the simulator and their profile instead of login", () => {
    expect(navItems({ role: "student" }).map((item) => item.key)).toEqual([
      "home",
      "lessons",
      "calculators",
      "simulator",
      "account",
    ]);
  });

  it("gives teachers and admins their own area in place of the simulator", () => {
    for (const role of ["teacher", "admin"] as const) {
      expect(navItems({ role }).map((item) => item.key)).toEqual([
        "home",
        "lessons",
        "calculators",
        "teacher",
        "account",
      ]);
    }
  });

  it("keeps the teacher tab active on all teacher pages", () => {
    const teacher = navItems({ role: "teacher" }).find((item) => item.key === "teacher")!;
    for (const path of ["/hu/teacher/students", "/hu/teacher/students/u1", "/hu/teacher/review/x", "/hu/teacher/reports", "/hu/teacher/insights"]) {
      expect(isNavItemActive(teacher, "hu", path), path).toBe(true);
    }
    expect(isNavItemActive(teacher, "hu", "/hu/teacher/content")).toBe(false);
  });

  it("matches the home tab exactly, so it is not active on every page", () => {
    const home = navItems(null).find((item) => item.key === "home");
    expect(home).toMatchObject({ path: "", end: true });
  });
});

describe("isNavItemActive", () => {
  const [home, lessons] = navItems(null);

  it("matches the home tab only on the locale root", () => {
    expect(isNavItemActive(home!, "hu", "/hu")).toBe(true);
    expect(isNavItemActive(home!, "hu", "/hu/syllabus")).toBe(false);
  });

  it("keeps the lessons tab active inside topics and lessons", () => {
    for (const path of ["/hu/syllabus", "/hu/topics/voltage-drop", "/hu/lessons/x", "/hu/lessons/x/summary"]) {
      expect(isNavItemActive(lessons!, "hu", path), path).toBe(true);
    }
    expect(isNavItemActive(lessons!, "hu", "/hu/calculators")).toBe(false);
    expect(isNavItemActive(lessons!, "hu", "/hu/syllabusx")).toBe(false);
  });
});
