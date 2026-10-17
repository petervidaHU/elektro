import { describe, expect, it } from "vitest";
import { formatDateTime } from "./format.js";

describe("formatDateTime", () => {
  it("formats a timestamp the Hungarian way, in the locale's time zone", () => {
    // 07:49 UTC is 09:49 in Budapest (CEST, UTC+2).
    expect(formatDateTime("2026-10-17T07:49:28Z", "hu")).toBe("2026. okt. 17. 9:49");
  });

  it("accepts Date objects and handles winter time", () => {
    expect(formatDateTime(new Date("2026-01-05T12:00:00Z"), "hu")).toBe("2026. jan. 5. 13:00");
  });
});

import { formatEngineering } from "./format.js";

describe("formatEngineering", () => {
  it("picks the SI prefix so the number stays readable", () => {
    expect(formatEngineering(0.0001, "F", "hu")).toBe("100 µF");
    expect(formatEngineering(0.0025, "H", "hu")).toBe("2,5 mH");
    expect(formatEngineering(4700, "Ω", "hu")).toBe("4,7 kΩ");
    expect(formatEngineering(2e-9, "F", "hu")).toBe("2 nF");
  });

  it("leaves ordinary magnitudes alone, and handles zero and negatives", () => {
    expect(formatEngineering(230, "V", "hu")).toBe("230 V");
    expect(formatEngineering(0, "V", "hu")).toBe("0 V");
    expect(formatEngineering(-0.005, "A", "hu")).toBe("-5 mA");
  });

  it("keeps three significant digits", () => {
    expect(formatEngineering(0.0012345, "s", "hu")).toBe("1,23 ms");
  });
});
