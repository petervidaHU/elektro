CREATE TABLE "calculator_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_translations_calculator_locale_uq" UNIQUE("calculator_id","locale")
);
--> statement-breakpoint
CREATE TABLE "calculators" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "archived_by" text;--> statement-breakpoint
ALTER TABLE "calculator_translations" ADD CONSTRAINT "calculator_translations_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculators" ADD CONSTRAINT "calculators_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calculators_position_idx" ON "calculators" USING btree ("position");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;