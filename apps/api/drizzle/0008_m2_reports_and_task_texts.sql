CREATE TABLE "practice_task_texts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" text NOT NULL,
	"template_version" integer NOT NULL,
	"locale" text NOT NULL,
	"scenarios" jsonb NOT NULL,
	"step_labels" jsonb NOT NULL,
	"hints" jsonb NOT NULL,
	"status" text DEFAULT 'ai_draft' NOT NULL,
	"review_note" text,
	"approved_by" text,
	"approved_by_name" text,
	"approved_by_email" text,
	"approved_by_role" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "practice_task_texts_template_version_locale_uq" UNIQUE("template_id","template_version","locale"),
	CONSTRAINT "practice_task_texts_approval_recorded" CHECK ("practice_task_texts"."status" <> 'approved' OR ("practice_task_texts"."approved_at" IS NOT NULL AND "practice_task_texts"."approved_by_name" IS NOT NULL AND "practice_task_texts"."approved_by_email" IS NOT NULL AND "practice_task_texts"."approved_by_role" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "practice_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"current_version" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text,
	"target_kind" text NOT NULL,
	"target_id" text NOT NULL,
	"target_version" integer,
	"locale" text NOT NULL,
	"category" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_task_texts" ADD CONSTRAINT "practice_task_texts_template_id_practice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."practice_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_task_texts" ADD CONSTRAINT "practice_task_texts_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_reports_created_idx" ON "content_reports" USING btree ("created_at");