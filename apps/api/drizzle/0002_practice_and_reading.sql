CREATE TABLE "lesson_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"lesson_version_id" uuid,
	"last_section" text,
	"first_opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_reads_user_lesson_uq" UNIQUE("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"task_count" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"tasks" jsonb NOT NULL,
	"mastery_at_start" text DEFAULT 'none' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "task_index" integer;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "template_version" integer;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "seed" bigint;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "difficulty" integer;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "outcome" text DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "mastery_level" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "lessons_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "lessons_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "tasks_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "unaided_rate_last10" real;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD COLUMN "last_activity_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lesson_reads" ADD CONSTRAINT "lesson_reads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_reads" ADD CONSTRAINT "lesson_reads_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_reads" ADD CONSTRAINT "lesson_reads_lesson_version_id_lesson_versions_id_fk" FOREIGN KEY ("lesson_version_id") REFERENCES "public"."lesson_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "practice_sessions_user_topic_idx" ON "practice_sessions" USING btree ("user_id","topic_id","status");--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_session_task_uq" UNIQUE("session_id","task_index");