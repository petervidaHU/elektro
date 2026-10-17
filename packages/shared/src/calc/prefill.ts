import type { CalculatorId } from "./catalogue.js";

/**
 * Pre-filling a calculator (plan K11): a lesson example links to the
 * calculator with the example's inputs. The calculator pages read these
 * values from the query string, so every field is listed here with what it
 * accepts - an author cannot link to an input a page does not have, and a
 * crafted URL cannot put a bad value into a page.
 */
export type PrefillField =
  | { kind: "number"; min?: number; max?: number }
  | { kind: "choice"; options: readonly string[] };

const positive: PrefillField = { kind: "number", min: 0 };
const signed: PrefillField = { kind: "number" };
const factor: PrefillField = { kind: "number", min: 0, max: 1 };
const choice = (...options: string[]): PrefillField => ({ kind: "choice", options });

const indexed = (name: string, field: PrefillField, count: number): Record<string, PrefillField> =>
  Object.fromEntries(Array.from({ length: count }, (_, i) => [`${name}${i + 1}`, field]));

export const PREFILL_FIELDS: Record<CalculatorId, Record<string, PrefillField>> = {
  "voltage-drop": {
    system: choice("single-phase", "three-phase"),
    material: choice("copper", "aluminium"),
    current: positive,
    length: positive,
    crossSection: positive,
    nominalVoltage: positive,
    powerFactor: factor,
  },
  "ohms-law": { unknown: choice("voltage", "current", "resistance"), voltage: positive, current: positive, resistance: positive },
  "equivalent-resistance": { mode: choice("series", "parallel", "mixed"), supply: positive, ...indexed("r", positive, 3) },
  "power-dc": {
    known: choice("ui", "ir", "ur"),
    voltage: positive,
    current: positive,
    resistance: positive,
    duration: positive,
    useful: positive,
  },
  "load-demand": {
    system: choice("single-phase", "three-phase"),
    powerFactor: factor,
    days: { kind: "number", min: 1, max: 31 },
    ...indexed("power", positive, 8),
    ...indexed("hours", { kind: "number", min: 0, max: 24 }, 8),
  },
  "power-ac-single": { known: choice("current", "power"), voltage: positive, current: positive, power: positive, powerFactor: factor },
  "power-three-phase": { known: choice("current", "power"), voltage: positive, current: positive, power: positive, powerFactor: factor },
  "connection-power": { system: choice("single-phase", "three-phase"), breaker: positive, demand: positive },
  "phase-balancing": { ...indexed("current", positive, 12), ...indexed("phase", choice("0", "1", "2"), 12) },
  // P2 physics. Capacitance is entered in µF, inductance in mH, times in ms.
  "ac-impedance": { resistance: positive, inductance: positive, capacitance: positive, frequency: positive, voltage: positive },
  capacitors: { mode: choice("single", "series", "parallel"), ...indexed("c", positive, 3), voltage: positive, resistance: positive, time: positive },
  inductors: {
    mode: choice("single", "series", "parallel"),
    ...indexed("l", positive, 3),
    current: positive,
    resistance: positive,
    voltage: positive,
    time: positive,
  },
  "voltage-source": { emf: positive, internalResistance: positive, loadResistance: positive },
  "transformer-ratio": {
    unknown: choice("secondaryVoltage", "primaryVoltage", "secondaryTurns", "primaryTurns"),
    primaryVoltage: positive,
    secondaryVoltage: positive,
    primaryTurns: positive,
    secondaryTurns: positive,
    secondaryCurrent: positive,
  },
  "charge-current": { unknown: choice("charge", "current", "time"), charge: positive, current: positive, time: positive },
  "ac-values": { given: choice("rms", "peak"), voltage: positive, frequency: positive },
  kirchhoff: { emf1: signed, resistance1: positive, emf2: signed, resistance2: positive, resistance3: positive },
  "wheatstone-bridge": { resistance1: positive, resistance2: positive, resistance3: positive, unknownResistance: positive, supply: positive },
  "meter-range-extension": { kind: choice("ammeter", "voltmeter"), meterResistance: positive, meterCurrent: positive, target: positive },
  "measurement-error": { reading: positive, percent: positive, digits: positive, resolution: positive },
  "motor-basics": {
    frequency: positive,
    polePairs: positive,
    rotorSpeed: positive,
    ratedPower: positive,
    voltage: positive,
    efficiency: factor,
    powerFactor: factor,
    startingRatio: positive,
  },
  "short-circuit-current": { voltage: positive, impedance: positive, trip: positive },
  illuminance: { flux: positive, area: positive, target: positive, luminaireFlux: positive, utilisation: factor },
  "pe-continuity-check": { resistivity: positive, length: positive, crossSection: positive, measured: positive, allowedFactor: positive },
  "material-list": { ...indexed("quantity", positive, 8), ...indexed("price", positive, 8), reserve: positive },
};

export type PrefillErrorReason = "unknown-field" | "invalid-value";

/** A number as typed in Hungarian or English notation, or `null`. */
function toNumber(text: string): number | null {
  const normalised = text.trim().replace(",", ".");
  if (!/^-?\d+(?:\.\d+)?$/.test(normalised)) return null;
  return Number(normalised);
}

function valid(field: PrefillField, text: string): boolean {
  if (field.kind === "choice") return field.options.includes(text);
  const value = toNumber(text);
  return value !== null && value >= (field.min ?? -Infinity) && value <= (field.max ?? Infinity);
}

export function validatePrefill(
  id: CalculatorId,
  params: Readonly<Record<string, string>>,
): { ok: boolean; errors: { field: string; reason: PrefillErrorReason }[] } {
  const spec = PREFILL_FIELDS[id];
  const errors: { field: string; reason: PrefillErrorReason }[] = [];
  for (const [name, text] of Object.entries(params)) {
    const field = Object.hasOwn(spec, name) ? spec[name] : undefined;
    if (!field) errors.push({ field: name, reason: "unknown-field" });
    else if (!valid(field, text)) errors.push({ field: name, reason: "invalid-value" });
  }
  return { ok: errors.length === 0, errors };
}

/** The query string for a link, with decimal points and the fields in the spec's order. */
export function prefillQuery(id: CalculatorId, params: Readonly<Record<string, string>>): string {
  const query = new URLSearchParams();
  for (const name of Object.keys(PREFILL_FIELDS[id])) {
    const text = params[name];
    if (text === undefined) continue;
    const field = PREFILL_FIELDS[id][name]!;
    query.set(name, field.kind === "number" ? String(toNumber(text) ?? text) : text);
  }
  return query.toString();
}

/** The valid fields of a page's query string; anything unknown or invalid is ignored. */
export function readPrefill(id: CalculatorId, search: URLSearchParams): Record<string, string> {
  const spec = PREFILL_FIELDS[id];
  const result: Record<string, string> = {};
  for (const [name, text] of search) {
    const field = Object.hasOwn(spec, name) ? spec[name] : undefined;
    if (field && valid(field, text)) result[name] = text;
  }
  return result;
}
