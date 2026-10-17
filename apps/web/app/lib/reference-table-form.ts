import type { TableCell } from "@elektro/shared";

const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

/** A typed cell: a plain number (decimal comma or point) becomes a number, anything else stays text. */
export function parseCell(text: string): TableCell {
  const trimmed = text.trim();
  return NUMBER.test(trimmed) ? Number(trimmed.replace(",", ".")) : trimmed;
}

/** A cell as shown in the editor: numbers with the Hungarian decimal comma. */
export function cellToText(cell: TableCell): string {
  return typeof cell === "number" ? String(cell).replace(".", ",") : cell;
}

export const textToRows = (rows: readonly (readonly TableCell[])[]): string[][] =>
  rows.map((row) => row.map(cellToText));

export const rowsFromText = (rows: readonly (readonly string[])[]): TableCell[][] =>
  rows.map((row) => row.map(parseCell));
