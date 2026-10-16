import { describe, expect, it } from "vitest";
import { decimalSeparator, parseLocaleNumber } from "./parse.js";

describe("decimalSeparator", () => {
  it("is a comma in Hungarian", () => {
    expect(decimalSeparator("hu")).toBe(",");
  });
});

describe("parseLocaleNumber (hu)", () => {
  it("parses integers and decimal-comma numbers", () => {
    expect(parseLocaleNumber("16", "hu")).toBe(16);
    expect(parseLocaleNumber("2,5", "hu")).toBe(2.5);
    expect(parseLocaleNumber("0,0225", "hu")).toBe(0.0225);
  });

  it("accepts a decimal point too (English keyboards)", () => {
    expect(parseLocaleNumber("2.5", "hu")).toBe(2.5);
  });

  it("accepts negative values and a leading separator", () => {
    expect(parseLocaleNumber("-3,5", "hu")).toBe(-3.5);
    expect(parseLocaleNumber(",5", "hu")).toBe(0.5);
  });

  it("ignores surrounding whitespace and space-like digit grouping", () => {
    expect(parseLocaleNumber("  7,2 ", "hu")).toBe(7.2);
    // Hungarian groups thousands with a (narrow) no-break space.
    expect(parseLocaleNumber("1 234,5", "hu")).toBe(1234.5);
    expect(parseLocaleNumber("1\u00a0234", "hu")).toBe(1234);
    expect(parseLocaleNumber("1\u202f234", "hu")).toBe(1234);
  });

  it("rejects empty, incomplete and malformed input with null", () => {
    for (const text of ["", " ", "-", ",", "2,", "2,5,1", "2.5,1", "abc", "1e3", "--1", "1-"]) {
      expect(parseLocaleNumber(text, "hu"), JSON.stringify(text)).toBeNull();
    }
  });
});
