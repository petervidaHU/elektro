import { describe, expect, it } from "vitest";
import { isReorderOf, moveItem } from "./ordering.js";

describe("moveItem", () => {
  const ids = ["a", "b", "c"];

  it("moves an item one place up or down", () => {
    expect(moveItem(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveItem(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("keeps the order at the edges and for unknown ids", () => {
    expect(moveItem(ids, "a", "up")).toEqual(ids);
    expect(moveItem(ids, "c", "down")).toEqual(ids);
    expect(moveItem(ids, "x", "up")).toEqual(ids);
  });

  it("never mutates its input", () => {
    const input = ["a", "b"];
    moveItem(input, "b", "up");
    expect(input).toEqual(["a", "b"]);
  });
});

describe("isReorderOf", () => {
  it("accepts exactly the same items in any order", () => {
    expect(isReorderOf(["a", "b", "c"], ["c", "a", "b"])).toBe(true);
  });

  it("rejects missing, extra or duplicated items", () => {
    expect(isReorderOf(["a", "b"], ["a"])).toBe(false);
    expect(isReorderOf(["a", "b"], ["a", "b", "c"])).toBe(false);
    expect(isReorderOf(["a", "b"], ["a", "a"])).toBe(false);
  });
});
