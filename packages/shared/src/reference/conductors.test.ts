import { describe, expect, it } from "vitest";
import {
  nextStandardCrossSection,
  STANDARD_CROSS_SECTIONS_MM2,
} from "./conductors.js";

describe("nextStandardCrossSection", () => {
  it("returns the requested size when it is already standard", () => {
    expect(nextStandardCrossSection(2.5)).toBe(2.5);
  });

  it("rounds up to the next size in the series", () => {
    expect(nextStandardCrossSection(2.6)).toBe(4);
    expect(nextStandardCrossSection(0.1)).toBe(1.5);
  });

  it("returns undefined above the tabulated series", () => {
    const largest = STANDARD_CROSS_SECTIONS_MM2[STANDARD_CROSS_SECTIONS_MM2.length - 1]!;
    expect(nextStandardCrossSection(largest + 1)).toBeUndefined();
  });

  it("keeps the series sorted ascending", () => {
    const sorted = [...STANDARD_CROSS_SECTIONS_MM2].sort((a, b) => a - b);
    expect([...STANDARD_CROSS_SECTIONS_MM2]).toEqual(sorted);
  });
});
