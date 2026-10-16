/**
 * Editing rules of the on-screen numeric keypad, kept free of React so they
 * can be unit-tested. The text uses the locale's decimal separator; turn it
 * into a number with `parseLocaleNumber` from `@elektro/shared`.
 */
export const KEYPAD_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export type KeypadDigit = (typeof KEYPAD_DIGITS)[number];

export type KeypadKey = KeypadDigit | "decimal" | "sign" | "backspace" | "clear";

export interface KeypadOptions {
  decimalSeparator: string;
  allowNegative?: boolean;
  /** Maximum number of characters, sign and separator included. */
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 12;

function isDigit(key: KeypadKey): key is KeypadDigit {
  return (KEYPAD_DIGITS as readonly string[]).includes(key);
}

export function applyKeypadKey(text: string, key: KeypadKey, options: KeypadOptions): string {
  const { decimalSeparator, allowNegative = false, maxLength = DEFAULT_MAX_LENGTH } = options;
  const negative = text.startsWith("-");
  const body = negative ? text.slice(1) : text;
  const sign = negative ? "-" : "";

  switch (key) {
    case "clear":
      return "";
    case "backspace":
      return text.slice(0, -1);
    case "sign":
      if (!allowNegative) return text;
      return negative ? body : `-${body}`;
    case "decimal":
      if (body.includes(decimalSeparator) || text.length >= maxLength) return text;
      return `${sign}${body === "" ? "0" : body}${decimalSeparator}`;
    default:
      if (!isDigit(key) || text.length >= maxLength) return text;
      // A lone leading zero is replaced: "0" then "5" gives "5", not "05".
      if (body === "0") return `${sign}${key}`;
      return `${text}${key}`;
  }
}

/** Hardware keyboard support for desktop: maps `KeyboardEvent.key`. */
export function keyFromKeyboard(key: string): KeypadKey | null {
  if ((KEYPAD_DIGITS as readonly string[]).includes(key)) return key as KeypadDigit;
  switch (key) {
    case ",":
    case ".":
      return "decimal";
    case "-":
      return "sign";
    case "Backspace":
      return "backspace";
    case "Delete":
    case "Escape":
      return "clear";
    default:
      return null;
  }
}
