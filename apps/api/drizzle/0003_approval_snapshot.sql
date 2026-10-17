CREATE TABLE "content_review_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_kind" text NOT NULL,
	"content_slug" text NOT NULL,
	"translation_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"locale" text NOT NULL,
	"action" text NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"actor_email" text NOT NULL,
	"actor_role" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_translations" ADD COLUMN "approved_by_name" text;--> statement-breakpoint
ALTER TABLE "lesson_translations" ADD COLUMN "approved_by_email" text;--> statement-breakpoint
ALTER TABLE "lesson_translations" ADD COLUMN "approved_by_role" text;--> statement-breakpoint
ALTER TABLE "content_review_events" ADD CONSTRAINT "content_review_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_review_events_content_idx" ON "content_review_events" USING btree ("content_kind","content_slug","created_at");