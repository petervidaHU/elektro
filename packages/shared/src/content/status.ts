import { hasAtLeastRole, type Role } from "../roles.js";

/**
 * Content approval lifecycle. Content starts as an AI-generated draft and is
 * approved per **locale and version**: approving `hu` v2 of a lesson says
 * nothing about `de` v2, and editing an approved part creates a new version
 * while the previously approved version stays live.
 *
 * Because a version is immutable once approved, `approved` is a terminal state
 * of that (version, locale) pair - there is no transition out of it.
 */
export const CONTENT_STATUSES = [
  "ai_draft",
  "in_review",
  "approved",
  "changes_requested",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const INITIAL_CONTENT_STATUS: ContentStatus = "ai_draft";

export const CONTENT_ACTIONS = ["submit_for_review", "approve", "request_changes"] as const;

export type ContentAction = (typeof CONTENT_ACTIONS)[number];

interface TransitionRule {
  from: readonly ContentStatus[];
  to: ContentStatus;
  /** Minimum role allowed to perform the action. */
  requiredRole: Role;
  /** Whether performing the action stamps approver + timestamp. */
  recordsApproval: boolean;
}

const TRANSITIONS: Record<ContentAction, TransitionRule> = {
  submit_for_review: {
    from: ["ai_draft", "changes_requested"],
    to: "in_review",
    requiredRole: "teacher",
    recordsApproval: false,
  },
  approve: {
    from: ["in_review"],
    to: "approved",
    requiredRole: "teacher",
    recordsApproval: true,
  },
  request_changes: {
    from: ["in_review"],
    to: "changes_requested",
    requiredRole: "teacher",
    recordsApproval: false,
  },
};

export function isContentStatus(value: unknown): value is ContentStatus {
  return (
    typeof value === "string" && (CONTENT_STATUSES as readonly string[]).includes(value)
  );
}

export function isContentAction(value: unknown): value is ContentAction {
  return (
    typeof value === "string" && (CONTENT_ACTIONS as readonly string[]).includes(value)
  );
}

/** Statuses a given status can move to, ignoring role. */
export function nextStatuses(status: ContentStatus): readonly ContentStatus[] {
  return CONTENT_ACTIONS.filter((action) => TRANSITIONS[action].from.includes(status)).map(
    (action) => TRANSITIONS[action].to,
  );
}

export type TransitionResult =
  | { ok: true; status: ContentStatus; recordsApproval: boolean }
  | { ok: false; reason: "invalid_transition" | "forbidden" };

/**
 * Pure state-machine step. The caller persists the result and, when
 * `recordsApproval` is true, stores the approver id and the timestamp.
 */
export function applyContentAction(
  current: ContentStatus,
  action: ContentAction,
  role: Role,
): TransitionResult {
  const rule = TRANSITIONS[action];

  if (!rule.from.includes(current)) {
    return { ok: false, reason: "invalid_transition" };
  }
  if (!hasAtLeastRole(role, rule.requiredRole)) {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, status: rule.to, recordsApproval: rule.recordsApproval };
}

/** The actions `role` may take on content in `status` - what a review panel offers. */
export function availableContentActions(status: ContentStatus, role: Role): ContentAction[] {
  return CONTENT_ACTIONS.filter((action) => applyContentAction(status, action, role).ok);
}

/**
 * Whether a (version, locale) pair may be shown to a student.
 *
 * `allowUnapprovedDrafts` is an admin setting, never hard-coded.
 */
export function isVisibleToStudent(
  status: ContentStatus,
  allowUnapprovedDrafts: boolean,
): boolean {
  return status === "approved" || allowUnapprovedDrafts;
}
