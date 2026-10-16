/**
 * Seeded random numbers (mulberry32). A practice task is `template + seed`, so
 * the server can rebuild exactly the task the student saw - for checking and
 * for the history replay - without storing its numbers.
 */
export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  /** One of min, min + step, ..., up to max. */
  step(min: number, max: number, step: number): number;
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));

  return {
    next,
    int,
    step: (min, max, step) => min + int(0, Math.floor((max - min) / step)) * step,
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) {
        throw new Error("Cannot pick from an empty list");
      }
      return items[int(0, items.length - 1)] as T;
    },
  };
}

/** A fresh 32-bit seed (server side, when a session is planned). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 4_294_967_296) >>> 0;
}
