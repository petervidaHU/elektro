import { describe, expect, it } from "vitest";
import { applyContentAction } from "./status.js";
import {
  approvalFields,
  redactDeletedReviewer,
  reviewEventFields,
  snapshotReviewer,
  type Reviewer,
} from "./review-record.js";

const teacher: Reviewer = {
  id: "u-teacher",
  name: "Kovács Anna",
  email: "anna.kovacs@example.com",
  role: "teacher",
};

describe("snapshotReviewer", () => {
  it("freezes id, name, email and role of a teacher", () => {
    expect(snapshotReviewer(teacher)).toEqual({
      ok: true,
      snapshot: {
        userId: "u-teacher",
        name: "Kovács Anna",
        email: "anna.kovacs@example.com",
        role: "teacher",
      },
    });
  });

  it("accepts admins (admin ranks above teacher) and records the role", () => {
    const result = snapshotReviewer({ ...teacher, id: "u-admin", role: "admin" });
    expect(result.ok && result.snapshot.role).toBe("admin");
  });

  it("rejects students: only teachers (or higher) may review", () => {
    expect(snapshotReviewer({ ...teacher, role: "student" })).toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("trims name and email, and rejects a reviewer without a name or email", () => {
    const trimmed = snapshotReviewer({ ...teacher, name: "  Kovács Anna ", email: " a@b.hu " });
    expect(trimmed.ok && trimmed.snapshot).toMatchObject({ name: "Kovács Anna", email: "a@b.hu" });

    for (const incomplete of [{ name: "  " }, { email: "" }]) {
      expect(snapshotReviewer({ ...teacher, ...incomplete })).toEqual({
        ok: false,
        reason: "incomplete_identity",
      });
    }
  });
});

describe("approvalFields", () => {
  it("stamps the approver snapshot when the transition records an approval", () => {
    const transition = applyContentAction("in_review", "approve", "teacher");
    const snapshot = snapshotReviewer(teacher);
    if (!transition.ok || !snapshot.ok) throw new Error("setup");

    expect(approvalFields(transition, snapshot.snapshot)).toEqual({
      approvedBy: "u-teacher",
      approvedByName: "Kovács Anna",
      approvedByEmail: "anna.kovacs@example.com",
      approvedByRole: "teacher",
    });
  });

  it("clears every approver field for the other actions", () => {
    const snapshot = snapshotReviewer(teacher);
    if (!snapshot.ok) throw new Error("setup");

    for (const [from, action] of [
      ["ai_draft", "submit_for_review"],
      ["in_review", "request_changes"],
    ] as const) {
      const transition = applyContentAction(from, action, "teacher");
      if (!transition.ok) throw new Error("setup");
      expect(approvalFields(transition, snapshot.snapshot)).toEqual({
        approvedBy: null,
        approvedByName: null,
        approvedByEmail: null,
        approvedByRole: null,
      });
    }
  });
});

describe("reviewEventFields", () => {
  it("documents who did what, from which status to which, with the note", () => {
    const transition = applyContentAction("in_review", "request_changes", "teacher");
    const snapshot = snapshotReviewer(teacher);
    if (!transition.ok || !snapshot.ok) throw new Error("setup");

    expect(
      reviewEventFields({
        action: "request_changes",
        fromStatus: "in_review",
        transition,
        reviewer: snapshot.snapshot,
        note: "A 3. képletnél hiányzik a mértékegység.",
      }),
    ).toEqual({
      action: "request_changes",
      fromStatus: "in_review",
      toStatus: "changes_requested",
      actorId: "u-teacher",
      actorName: "Kovács Anna",
      actorEmail: "anna.kovacs@example.com",
      actorRole: "teacher",
      note: "A 3. képletnél hiányzik a mértékegység.",
    });
  });

  it("stores a missing note as null", () => {
    const transition = applyContentAction("in_review", "approve", "teacher");
    const snapshot = snapshotReviewer(teacher);
    if (!transition.ok || !snapshot.ok) throw new Error("setup");

    const event = reviewEventFields({
      action: "approve",
      fromStatus: "in_review",
      transition,
      reviewer: snapshot.snapshot,
    });
    expect(event.note).toBeNull();
    expect(event.toStatus).toBe("approved");
  });
});

describe("redactDeletedReviewer", () => {
  const event = {
    id: "e1",
    actorId: "u-teacher" as string | null,
    actorName: "Kovács Anna",
    actorEmail: "anna.kovacs@example.com",
    actorRole: "teacher" as const,
  };

  it("leaves a reviewer whose account still exists untouched", () => {
    expect(redactDeletedReviewer(event)).toEqual({ ...event, actorDeleted: false });
  });

  it("hides the name and email of a deleted reviewer, keeping the role", () => {
    expect(redactDeletedReviewer({ ...event, actorId: null })).toEqual({
      id: "e1",
      actorId: null,
      actorName: null,
      actorEmail: null,
      actorRole: "teacher",
      actorDeleted: true,
    });
  });
});
