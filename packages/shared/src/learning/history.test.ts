import { describe, expect, it } from "vitest";
import { dayKey, filterHistory, groupByDay, type HistoryEntry } from "./history.js";

const lesson = (at: string, topicId = "voltage-drop"): HistoryEntry => ({
  kind: "lesson",
  at,
  topicId: topicId as HistoryEntry["topicId"],
  slug: "x",
  title: "X",
  completed: true,
});
const practice = (at: string): HistoryEntry => ({
  kind: "practice",
  at,
  topicId: "voltage-drop",
  sessionId: "s1",
  taskCount: 5,
  unaided: 4,
  status: "finished",
});

describe("dayKey", () => {
  it("uses the learner's time zone, not UTC", () => {
    // 23:30 UTC on 1 March is already 2 March in Budapest (UTC+1).
    expect(dayKey("2026-03-01T23:30:00Z", "Europe/Budapest")).toBe("2026-03-02");
    expect(dayKey("2026-03-01T23:30:00Z", "UTC")).toBe("2026-03-01");
  });
});

describe("groupByDay", () => {
  it("groups newest first and keeps the entries of a day together", () => {
    const groups = groupByDay(
      [lesson("2026-03-01T10:00:00Z"), practice("2026-03-02T09:00:00Z"), lesson("2026-03-02T08:00:00Z")],
      "UTC",
    );
    expect(groups.map((group) => group.day)).toEqual(["2026-03-02", "2026-03-01"]);
    expect(groups[0]!.entries.map((entry) => entry.kind)).toEqual(["practice", "lesson"]);
  });
});

describe("filterHistory", () => {
  const entries = [lesson("2026-03-01T10:00:00Z"), practice("2026-03-02T09:00:00Z"), lesson("2026-03-03T09:00:00Z", "dc-circuits")];

  it("filters by type and topic, and keeps everything for no filter", () => {
    expect(filterHistory(entries, {})).toHaveLength(3);
    expect(filterHistory(entries, { kind: "practice" })).toHaveLength(1);
    expect(filterHistory(entries, { topicId: "dc-circuits" })).toHaveLength(1);
    expect(filterHistory(entries, { kind: "lesson", topicId: "voltage-drop" })).toHaveLength(1);
  });
});
