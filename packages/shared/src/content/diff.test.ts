import { describe, expect, it } from "vitest";
import { diffLines } from "./diff.js";

describe("diffLines", () => {
  it("marks identical text as unchanged", () => {
    expect(diffLines("a\nb", "a\nb")).toEqual([
      { type: "same", text: "a" },
      { type: "same", text: "b" },
    ]);
  });

  it("shows added and removed lines in order", () => {
    expect(diffLines("a\nb\nc", "a\nx\nc\nd")).toEqual([
      { type: "same", text: "a" },
      { type: "remove", text: "b" },
      { type: "add", text: "x" },
      { type: "same", text: "c" },
      { type: "add", text: "d" },
    ]);
  });

  it("treats a missing old text as all added", () => {
    expect(diffLines("", "a")).toEqual([{ type: "add", text: "a" }]);
  });

  it("ignores line ending differences", () => {
    expect(diffLines("a\r\nb", "a\nb").every((line) => line.type === "same")).toBe(true);
  });
});
