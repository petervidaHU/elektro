import { describe, expect, it } from "vitest";
import { PLANNED_CALCULATORS, REQUIRED_TABLES, requirementStates, unmetRequirements } from "./required.js";

describe("tables the planned calculators wait for", () => {
  it("cable-selection waits for the capacity and correction tables and the permitted voltage drop", () => {
    const cable = PLANNED_CALCULATORS.find((item) => item.id === "cable-selection")!;
    expect(cable.requiresTables).toEqual([
      "current-carrying-capacity",
      "correction-factor-ambient-temperature",
      "correction-factor-grouping",
      "permitted-voltage-drop",
    ]);
    for (const key of cable.requiresTables) {
      expect(REQUIRED_TABLES.map((table) => table.key)).toContain(key);
    }
  });
});

describe("requirementStates", () => {
  const keys = ["a", "b", "c"];

  it("is missing without a table, unverified with only a draft, verified when a verified version is live", () => {
    const states = requirementStates(keys, [
      { key: "b", latest: { status: "unverified" }, liveVersion: null },
      { key: "c", latest: { status: "unverified" }, liveVersion: 1 },
    ]);
    expect(states).toEqual([
      { key: "a", state: "missing" },
      { key: "b", state: "unverified" },
      { key: "c", state: "verified" },
    ]);
  });

  it("counts a table whose newest version is verified as verified", () => {
    expect(requirementStates(["a"], [{ key: "a", latest: { status: "verified" }, liveVersion: 2 }])[0]!.state).toBe("verified");
  });
});

describe("unmetRequirements", () => {
  it("lists only what still blocks the calculator", () => {
    const states = requirementStates(["a", "b"], [{ key: "a", latest: { status: "verified" }, liveVersion: 1 }]);
    expect(unmetRequirements(states).map((item) => item.key)).toEqual(["b"]);
  });
});
