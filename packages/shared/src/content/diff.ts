export type DiffLine = { type: "same" | "add" | "remove"; text: string };

function linesOf(text: string): string[] {
  return text === "" ? [] : text.replace(/\r\n/g, "\n").split("\n");
}

/**
 * Line diff of two texts (longest common subsequence), for the review screen:
 * what changed between the live approved version and the version under review.
 * Lessons are a few hundred lines, so the quadratic table is fine.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = linesOf(before);
  const b = linesOf(after);
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] = a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i]! });
      i++;
      j++;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      result.push({ type: "remove", text: a[i++]! });
    } else {
      result.push({ type: "add", text: b[j++]! });
    }
  }
  while (i < a.length) result.push({ type: "remove", text: a[i++]! });
  while (j < b.length) result.push({ type: "add", text: b[j++]! });
  return result;
}
