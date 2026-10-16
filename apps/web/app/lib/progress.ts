import type { MasteryLevel, TopicId } from "@elektro/shared";
import { apiFetch } from "./api";

export interface TopicProgressRow {
  topicId: TopicId;
  masteryLevel: MasteryLevel;
  lessonsCompleted: number;
  lessonsTotal: number;
  tasksCompleted: number;
  unaidedRate: number | null;
  lastActivityAt: string | null;
}

/** The signed-in user's progress per topic (empty for guests). */
export async function getProgress(request: Request, signedIn: boolean): Promise<TopicProgressRow[]> {
  if (!signedIn) {
    return [];
  }
  const { topics } = await apiFetch<{ topics: TopicProgressRow[] }>(request, "/api/progress");
  return topics;
}
