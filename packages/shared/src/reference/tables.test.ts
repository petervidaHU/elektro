import { describe, expect, it } from "vitest";
import {
  applyTableAction,
  excerptRows,
  isVisibleTable,
  referenceTableInputSchema,
  type ReferenceTableContent,
} from "./tables.js";

const content: ReferenceTableContent = {
  columns: [
    { id: "section", label: "S", unit: "squareMillimetre" },
    { id: "current", label: "I", unit: "ampere" },
  ],
  rows: [
    [1.5, 10],
    [2.5, 14],
    [4, 19],
  ],
};

const input = { key: "example-table", title: "Példa", source: "Saját példa, nem szabványérték", ...content };

describe("referenceTableInputSchema", () => {
  it("accepts a well-formed table", () => {
    expect(referenceTableInputSchema.safeParse(input).success).toBe(true);
  });

  it("requires a source, so no value is stored without one", () => {
    expect(referenceTableInputSchema.safeParse({ ...input, source: "  " }).success).toBe(false);
  });

  it("rejects a malformed key", () => {
    expect(referenceTableInputSchema.safeParse({ ...input, key: "Bad Key" }).success).toBe(false);
  });

  it("rejects rows whose length differs from the columns, and duplicate column ids", () => {
    expect(referenceTableInputSchema.safeParse({ ...input, rows: [[1, 2, 3]] }).success).toBe(false);
    expect(
      referenceTableInputSchema.safeParse({ ...input, columns: [input.columns[0], input.columns[0]] }).success,
    ).toBe(false);
  });

  it("rejects non-finite numbers and empty tables", () => {
    expect(referenceTableInputSchema.safeParse({ ...input, rows: [[Number.NaN, 1]] }).success).toBe(false);
    expect(referenceTableInputSchema.safeParse({ ...input, rows: [] }).success).toBe(false);
  });

  it("accepts text cells next to numbers", () => {
    const result = referenceTableInputSchema.safeParse({
      ...input,
      columns: [{ id: "method", label: "Mód" }, { id: "current", label: "I", unit: "ampere" }],
      rows: [["A1", 14]],
    });
    expect(result.success).toBe(true);
  });
});

describe("table state machine", () => {
  it("lets a teacher or admin verify an unverified table", () => {
    for (const role of ["teacher", "admin"] as const) {
      expect(applyTableAction("unverified", "verify", role)).toEqual({ ok: true, status: "verified" });
    }
  });

  it("forbids students, and refuses to verify twice or a superseded table", () => {
    expect(applyTableAction("unverified", "verify", "student")).toEqual({ ok: false, reason: "forbidden" });
    expect(applyTableAction("verified", "verify", "teacher")).toEqual({ ok: false, reason: "invalid_transition" });
    expect(applyTableAction("superseded", "verify", "teacher")).toEqual({ ok: false, reason: "invalid_transition" });
  });

  it("supersedes only a verified table", () => {
    expect(applyTableAction("verified", "supersede", "teacher")).toEqual({ ok: true, status: "superseded" });
    expect(applyTableAction("unverified", "supersede", "teacher")).toEqual({ ok: false, reason: "invalid_transition" });
  });
});

describe("student visibility", () => {
  it("shows students only verified tables; staff also see unverified ones", () => {
    expect(isVisibleTable("verified", "student")).toBe(true);
    expect(isVisibleTable("unverified", "student")).toBe(false);
    expect(isVisibleTable("superseded", "student")).toBe(false);
    expect(isVisibleTable("unverified", null)).toBe(false);
    expect(isVisibleTable("unverified", "teacher")).toBe(true);
    expect(isVisibleTable("superseded", "teacher")).toBe(false);
  });
});

describe("excerptRows", () => {
  it("returns only the requested rows, in table order, never the whole table by accident", () => {
    expect(excerptRows(content, [2, 0]).rows).toEqual([[1.5, 10], [4, 19]]);
    expect(excerptRows(content, [2, 0]).columns).toEqual(content.columns);
  });

  it("ignores indexes that do not exist", () => {
    expect(excerptRows(content, [7]).rows).toEqual([]);
  });
});
