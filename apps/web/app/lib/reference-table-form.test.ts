import { describe, expect, it } from "vitest";
import { cellToText, parseCell, rowsFromText, textToRows } from "./reference-table-form";

describe("table cells typed by a teacher", () => {
  it("reads numbers with a decimal comma or point, and keeps other text", () => {
    expect(parseCell("2,5")).toBe(2.5);
    expect(parseCell("2.5")).toBe(2.5);
    expect(parseCell(" 14 ")).toBe(14);
    expect(parseCell("-3")).toBe(-3);
    expect(parseCell("A1")).toBe("A1");
    expect(parseCell("2,5 mm²")).toBe("2,5 mm²");
    expect(parseCell("")).toBe("");
  });

  it("shows numbers with the decimal comma", () => {
    expect(cellToText(2.5)).toBe("2,5");
    expect(cellToText("B2")).toBe("B2");
  });

  it("round-trips a grid of text", () => {
    const rows = [["1,5", "10"], ["2,5", "14"]];
    expect(rowsFromText(textToRows(rows))).toEqual([[1.5, 10], [2.5, 14]]);
    expect(textToRows([[1.5, "A"]])).toEqual([["1,5", "A"]]);
  });
});
