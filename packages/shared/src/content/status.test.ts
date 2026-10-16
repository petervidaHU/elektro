import { describe, expect, it } from "vitest";
import {
  applyContentAction,
  CONTENT_STATUSES,
  INITIAL_CONTENT_STATUS,
  isVisibleToStudent,
  nextStatuses,
} from "./status.js";
import { ROLES } from "../roles.js";

describe("applyContentAction", () => {
  it("walks the happy path ai_draft -> in_review -> approved", () => {
    const submitted = applyContentAction(INITIAL_CONTENT_STATUS, "submit_for_review", "teacher");
    expect(submitted).toEqual({ ok: true, status: "in_review", recordsApproval: false });

    const approved = applyContentAction("in_review", "approve", "teacher");
    expect(approved).toEqual({ ok: true, status: "approved", recordsApproval: true });
  });

  it("records approver + timestamp only for approve", () => {
    for (const action of ["submit_for_review", "request_changes"] as const) {
      const from = action === "submit_for_review" ? "ai_draft" : "in_review";
      const result = applyContentAction(from, action, "admin");
      expect(result.ok && result.recordsApproval).toBe(false);
    }
  });

  it("sends a review back for changes and allows resubmission", () => {
    const rejected = applyContentAction("in_review", "request_changes", "teacher");
    expect(rejected).toEqual({
      ok: true,
      status: "changes_requested",
      recordsApproval: false,
    });

    const resubmitted = applyContentAction("changes_requested", "submit_for_review", "teacher");
    expect(resubmitted.ok && resubmitted.status).toBe("in_review");
  });

  it("treats approved as terminal - a new version is required instead", () => {
    expect(nextStatuses("approved")).toEqual([]);

    for (const action of ["submit_for_review", "approve", "request_changes"] as const) {
      expect(applyContentAction("approved", action, "admin")).toEqual({
        ok: false,
        reason: "invalid_transition",
      });
    }
  });

  it("rejects approving something that is not in review", () => {
    expect(applyContentAction("ai_draft", "approve", "admin")).toEqual({
      ok: false,
      reason: "invalid_transition",
    });
    expect(applyContentAction("changes_requested", "approve", "admin")).toEqual({
      ok: false,
      reason: "invalid_transition",
    });
  });

  it("forbids students from any transition", () => {
    expect(applyContentAction("ai_draft", "submit_for_review", "student")).toEqual({
      ok: false,
      reason: "forbidden",
    });
    expect(applyContentAction("in_review", "approve", "student")).toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("allows teachers and admins to approve", () => {
    for (const role of ROLES.filter((candidate) => candidate !== "student")) {
      expect(applyContentAction("in_review", "approve", role).ok).toBe(true);
    }
  });

  it("checks the transition before the role, for every status", () => {
    // A student must never be told a transition is merely forbidden when the
    // transition itself is impossible - and vice versa.
    for (const status of CONTENT_STATUSES) {
      const result = applyContentAction(status, "approve", "student");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe(status === "in_review" ? "forbidden" : "invalid_transition");
      }
    }
  });
});

describe("isVisibleToStudent", () => {
  it("always shows approved content", () => {
    expect(isVisibleToStudent("approved", false)).toBe(true);
    expect(isVisibleToStudent("approved", true)).toBe(true);
  });

  it("hides unapproved content unless the admin setting allows it", () => {
    for (const status of CONTENT_STATUSES.filter((s) => s !== "approved")) {
      expect(isVisibleToStudent(status, false)).toBe(false);
      expect(isVisibleToStudent(status, true)).toBe(true);
    }
  });
});
