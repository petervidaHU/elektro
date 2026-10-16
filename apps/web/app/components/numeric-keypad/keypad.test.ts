import { describe, expect, it } from "vitest";
import { applyKeypadKey, keyFromKeyboard, type KeypadKey } from "./keypad";

const type = (keys: KeypadKey[], start = "", options = {}) =>
  keys.reduce((text, key) => applyKeypadKey(text, key, { decimalSeparator: ",", ...options }), start);

describe("applyKeypadKey", () => {
  it("appends digits", () => {
    expect(type(["1", "6"])).toBe("16");
  });

  it("replaces a lone leading zero instead of producing 05", () => {
    expect(type(["0", "5"])).toBe("5");
    expect(type(["0", "0"])).toBe("0");
  });

  it("adds the locale decimal separator once, with a leading zero if needed", () => {
    expect(type(["2", "decimal", "5"])).toBe("2,5");
    expect(type(["decimal", "5"])).toBe("0,5");
    expect(type(["2", "decimal", "decimal", "5"])).toBe("2,5");
    expect(type(["0", "decimal", "0", "5"])).toBe("0,05");
  });

  it("toggles the sign only when negatives are allowed", () => {
    expect(type(["5", "sign"], "", { allowNegative: true })).toBe("-5");
    expect(type(["5", "sign", "sign"], "", { allowNegative: true })).toBe("5");
    expect(type(["sign", "5"], "", { allowNegative: true })).toBe("-5");
    expect(type(["5", "sign"])).toBe("5");
  });

  it("deletes the last character, including a lone minus", () => {
    expect(type(["backspace"], "2,5")).toBe("2,");
    expect(type(["backspace"], "-")).toBe("");
    expect(type(["backspace"], "")).toBe("");
  });

  it("clears everything", () => {
    expect(type(["clear"], "-12,5")).toBe("");
  });

  it("stops accepting digits at the maximum length", () => {
    expect(type(["1", "2", "3", "4"], "", { maxLength: 3 })).toBe("123");
  });
});

describe("keyFromKeyboard", () => {
  it("maps a hardware keyboard to keypad keys", () => {
    expect(keyFromKeyboard("7")).toBe("7");
    expect(keyFromKeyboard(",")).toBe("decimal");
    expect(keyFromKeyboard(".")).toBe("decimal");
    expect(keyFromKeyboard("-")).toBe("sign");
    expect(keyFromKeyboard("Backspace")).toBe("backspace");
    expect(keyFromKeyboard("Delete")).toBe("clear");
    expect(keyFromKeyboard("Escape")).toBe("clear");
  });

  it("ignores every other key", () => {
    expect(keyFromKeyboard("a")).toBeNull();
    expect(keyFromKeyboard("Enter")).toBeNull();
    expect(keyFromKeyboard("Tab")).toBeNull();
  });
});
