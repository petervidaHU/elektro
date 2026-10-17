import type {
  CalculatorDefinition,
  ContentStatus,
  Role,
  TopicId,
} from "@elektro/shared";
import { ApiError } from "./api";
import type { ListedCalculator } from "./calculators";

/** One row of `GET /api/manage/lessons` (plan §3.3 `/teacher/content`). */
export interface ManagedLesson {
  lessonId: string;
  slug: string;
  topicId: TopicId;
  position: number;
  archivedAt: string | null;
  updatedAt: string;
  latest: { version: number; title: string; status: ContentStatus; updatedAt: string } | null;
  live: {
    version: number;
    title: string;
    approvedAt: string | null;
    approvedByRole: Role | null;
    approvedByDeleted: boolean;
    approvedByName: string | null;
  } | null;
}

export interface ManagedCalculators {
  calculators: (ListedCalculator & { updatedAt: string })[];
  available: CalculatorDefinition[];
}

/** What an action returns on failure: the API's error code and field details. */
export interface ActionFailure {
  errorCode: string;
  fields?: string[];
}

/** Turns an API error into an `ActionFailure`; anything else is rethrown. */
export function actionFailure(error: unknown): ActionFailure {
  if (error instanceof ApiError) {
    return {
      errorCode: error.body.code,
      ...(error.body.details ? { fields: Object.keys(error.body.details) } : {}),
    };
  }
  throw error;
}
