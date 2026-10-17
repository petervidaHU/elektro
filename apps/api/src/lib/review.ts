import { sql, type SQL } from "drizzle-orm";
import {
  applyContentAction,
  approvalFields,
  ERROR_CODES,
  reviewEventFields,
  snapshotReviewer,
  type ContentAction,
  type ContentStatus,
  type Locale,
} from "@elektro/shared";
import { contentReviewEvents } from "../db/schema/content.js";
import type { db } from "../db/index.js";
import { forbidden, HttpError } from "./http-error.js";
import type { AuthenticatedUser } from "../plugins/auth.js";

export type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

/** What a content row's review columns become after an action (plan §2.6, Q19). */
export interface ReviewColumns {
  status: ContentStatus;
  reviewNote: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  approvedByRole: "student" | "teacher" | "admin" | null;
  approvedAt: SQL | null;
  updatedAt: Date;
}

/**
 * The documented review step for any approvable entity other than lessons
 * (glossary terms, topic intros): the same rules as the lesson route - the
 * shared state machine decides, the approver snapshot is frozen, and one row
 * goes to the append-only log - all in the caller's transaction. `persist`
 * writes the returned columns to the entity's own table.
 */
export async function reviewContent<Row>(
  tx: Tx,
  target: {
    kind: "glossary_term" | "topic_intro";
    slug: string;
    rowId: string;
    version: number;
    locale: Locale;
    status: ContentStatus;
  },
  action: ContentAction,
  reviewer: AuthenticatedUser,
  note: string | undefined,
  persist: (columns: ReviewColumns) => Promise<Row>,
): Promise<Row> {
  const signed = snapshotReviewer(reviewer);
  if (!signed.ok) {
    throw signed.reason === "forbidden"
      ? forbidden()
      : new HttpError(409, ERROR_CODES.REVIEWER_IDENTITY_INCOMPLETE);
  }
  const transition = applyContentAction(target.status, action, reviewer.role);
  if (!transition.ok) {
    throw transition.reason === "forbidden"
      ? forbidden()
      : new HttpError(409, ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const row = await persist({
    status: transition.status,
    reviewNote: note ?? null,
    ...approvalFields(transition, signed.snapshot),
    approvedAt: transition.recordsApproval ? sql`now()` : null,
    updatedAt: new Date(),
  });

  await tx.insert(contentReviewEvents).values({
    contentKind: target.kind,
    contentSlug: target.slug,
    translationId: target.rowId,
    version: target.version,
    locale: target.locale,
    ...reviewEventFields({
      action,
      fromStatus: target.status,
      transition,
      reviewer: signed.snapshot,
      note,
    }),
    createdAt: sql`now()`,
  });
  return row;
}
