import type { SessionStatus } from "../practice/view.js";
import type { TopicId } from "../syllabus/topics.js";

/** One entry of the history feed (plan §3.4 J6); simulator entries join later. */
export type HistoryEntry =
  | { kind: "lesson"; at: string; topicId: TopicId; slug: string; title: string; completed: boolean }
  | {
      kind: "practice";
      at: string;
      topicId: TopicId;
      sessionId: string;
      taskCount: number;
      unaided: number;
      status: SessionStatus;
    };

export type HistoryKind = HistoryEntry["kind"];

/** Calendar day of a timestamp in a time zone, `YYYY-MM-DD`. */
export function dayKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export interface HistoryDay {
  day: string;
  entries: HistoryEntry[];
}

/** Reverse-chronological feed grouped by day. */
export function groupByDay(entries: readonly HistoryEntry[], timeZone: string): HistoryDay[] {
  const sorted = [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const days: HistoryDay[] = [];
  for (const entry of sorted) {
    const day = dayKey(entry.at, timeZone);
    const last = days[days.length - 1];
    if (last && last.day === day) {
      last.entries.push(entry);
    } else {
      days.push({ day, entries: [entry] });
    }
  }
  return days;
}

export interface HistoryFilter {
  kind?: HistoryKind;
  topicId?: TopicId;
}

export function filterHistory(entries: readonly HistoryEntry[], filter: HistoryFilter): HistoryEntry[] {
  return entries.filter(
    (entry) =>
      (filter.kind === undefined || entry.kind === filter.kind) &&
      (filter.topicId === undefined || entry.topicId === filter.topicId),
  );
}
