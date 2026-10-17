-- S8: approval audit trail (custom migration, written by hand).
--
-- 1. Snapshot the approver of every already approved translation from the
--    still existing account. v1 has no account deletion, so every approved row
--    still has its approver.
UPDATE "lesson_translations" AS t
SET "approved_by_name" = u."name",
    "approved_by_email" = u."email",
    "approved_by_role" = u."role"
FROM "user" AS u
WHERE t."approved_by" = u."id"
  AND t."status" = 'approved'
  AND t."approved_by_name" IS NULL;
--> statement-breakpoint

-- 2. Seed the review log with those approvals (from in_review, at approved_at).
INSERT INTO "content_review_events" (
  "content_kind", "content_slug", "translation_id", "version", "locale",
  "action", "from_status", "to_status",
  "actor_id", "actor_name", "actor_email", "actor_role", "note", "created_at"
)
SELECT 'lesson', l."slug", t."id", v."version", t."locale",
       'approve', 'in_review', 'approved',
       t."approved_by", t."approved_by_name", t."approved_by_email", t."approved_by_role",
       NULL, t."approved_at"
FROM "lesson_translations" AS t
JOIN "lesson_versions" AS v ON v."id" = t."lesson_version_id"
JOIN "lessons" AS l ON l."id" = v."lesson_id"
WHERE t."status" = 'approved'
  AND t."approved_by_name" IS NOT NULL
  AND t."approved_at" IS NOT NULL;
--> statement-breakpoint

-- 3. The review log is append-only. The only allowed change is the foreign key
--    `ON DELETE SET NULL` clearing `actor_id` when an account is deleted; the
--    name/email/role snapshot stays.
CREATE FUNCTION "content_review_events_append_only"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'content_review_events is append-only';
  END IF;
  IF NEW."actor_id" IS NOT NULL
     OR (to_jsonb(NEW) - 'actor_id') IS DISTINCT FROM (to_jsonb(OLD) - 'actor_id') THEN
    RAISE EXCEPTION 'content_review_events is append-only';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "content_review_events_append_only"
BEFORE UPDATE OR DELETE ON "content_review_events"
FOR EACH ROW EXECUTE FUNCTION "content_review_events_append_only"();
