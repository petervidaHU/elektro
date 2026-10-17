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
