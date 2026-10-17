/**
 * Manual ordering of lists (lessons within a topic, calculators). The UI moves
 * one item at a time with up/down buttons (touch-friendly, no drag and drop)
 * and sends the whole new order; the API checks it is a reorder of what exists.
 */
export type MoveDirection = "up" | "down";

/** The list with `id` moved one place; unchanged at the edges or if unknown. */
export function moveItem(ids: readonly string[], id: string, direction: MoveDirection): string[] {
  const result = [...ids];
  const from = result.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;

  if (from === -1 || to < 0 || to >= result.length) {
    return result;
  }
  [result[from], result[to]] = [result[to] as string, result[from] as string];
  return result;
}

/** True when `requested` holds exactly the items of `current`, each once. */
export function isReorderOf(current: readonly string[], requested: readonly string[]): boolean {
  if (current.length !== requested.length || new Set(requested).size !== requested.length) {
    return false;
  }
  const known = new Set(current);
  return requested.every((id) => known.has(id));
}
