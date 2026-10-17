import { describe, expect, it } from "vitest";
import { isNavItemActive, navItems, staffNavItems } from "./nav-items";

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

  it("gives signed-in users the simulator and their profile instead of login", () => {
    for (const role of ["student", "teacher", "admin"] as const) {
      expect(navItems({ role }).map((item) => item.key)).toEqual([
        "home",
        "lessons",
        "calculators",
        "simulator",
        "account",
      ]);
    }
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

describe("staffNavItems", () => {
  it("gives teachers and admins the content page in the header (plan §3.2)", () => {
    for (const role of ["teacher", "admin"] as const) {
      expect(staffNavItems({ role }).map((item) => item.path)).toEqual(["teacher/content"]);
    }
  });

  it("gives students and guests nothing", () => {
    expect(staffNavItems({ role: "student" })).toEqual([]);
    expect(staffNavItems(null)).toEqual([]);
  });
});
