import { describe, expect, it } from "vitest";
import { navItems } from "./nav-items";

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
