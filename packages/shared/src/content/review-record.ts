import { hasAtLeastRole, type Role } from "../roles.js";
import type { ContentAction, ContentStatus, TransitionResult } from "./status.js";

/**
 * How a review is documented. Every review action is recorded with a
 * **snapshot** of the reviewer (id, name, email, role) taken at the moment of
 * the action. The snapshot is never updated afterwards, so the record stays
 * exact when the account is renamed, demoted or deleted (the user id is then
 * set to null by the database, the snapshot stays).
 */
export const REVIEWER_MIN_ROLE: Role = "teacher";

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ReviewerSnapshot {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export type SnapshotResult =
  | { ok: true; snapshot: ReviewerSnapshot }
  | { ok: false; reason: "forbidden" | "incomplete_identity" };

/** Freezes the reviewer's identity. Only teachers (or higher) may review. */
export function snapshotReviewer(reviewer: Reviewer): SnapshotResult {
  if (!hasAtLeastRole(reviewer.role, REVIEWER_MIN_ROLE)) {
    return { ok: false, reason: "forbidden" };
  }

  const name = reviewer.name.trim();
  const email = reviewer.email.trim();
  if (name === "" || email === "") {
    return { ok: false, reason: "incomplete_identity" };
  }

  return { ok: true, snapshot: { userId: reviewer.id, name, email, role: reviewer.role } };
}

type SuccessfulTransition = Extract<TransitionResult, { ok: true }>;

export interface ApprovalFields {
  approvedBy: string | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  approvedByRole: Role | null;
}

/**
 * The approver columns of a content row after a transition: the snapshot when
 * the transition records an approval, otherwise all null. The timestamp is set
 * by the database (`now()`) in the same statement.
 */
export function approvalFields(
  transition: SuccessfulTransition,
  reviewer: ReviewerSnapshot,
): ApprovalFields {
  if (!transition.recordsApproval) {
    return { approvedBy: null, approvedByName: null, approvedByEmail: null, approvedByRole: null };
  }
  return {
    approvedBy: reviewer.userId,
    approvedByName: reviewer.name,
    approvedByEmail: reviewer.email,
    approvedByRole: reviewer.role,
  };
}

export interface ReviewEventFields {
  action: ContentAction;
  fromStatus: ContentStatus;
  toStatus: ContentStatus;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: Role;
  note: string | null;
}

/** One row of the append-only review log. */
export function reviewEventFields(input: {
  action: ContentAction;
  fromStatus: ContentStatus;
  transition: SuccessfulTransition;
  reviewer: ReviewerSnapshot;
  note?: string | null;
}): ReviewEventFields {
  return {
    action: input.action,
    fromStatus: input.fromStatus,
    toStatus: input.transition.status,
    actorId: input.reviewer.userId,
    actorName: input.reviewer.name,
    actorEmail: input.reviewer.email,
    actorRole: input.reviewer.role,
    note: input.note ?? null,
  };
}
