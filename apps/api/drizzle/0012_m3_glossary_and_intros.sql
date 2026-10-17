CREATE TABLE "glossary_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "glossary_terms_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "glossary_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"version" integer NOT NULL,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	"status" text DEFAULT 'ai_draft' NOT NULL,
	"review_note" text,
	"approved_by" text,
	"approved_by_name" text,
	"approved_by_email" text,
	"approved_by_role" text,
	"approved_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "glossary_translations_term_locale_version_uq" UNIQUE("term_id","locale","version"),
	CONSTRAINT "glossary_translations_approval_recorded" CHECK ("glossary_translations"."status" <> 'approved' OR ("glossary_translations"."approved_at" IS NOT NULL AND "glossary_translations"."approved_by_name" IS NOT NULL AND "glossary_translations"."approved_by_email" IS NOT NULL AND "glossary_translations"."approved_by_role" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "topic_intro_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" text NOT NULL,
	"locale" text NOT NULL,
	"version" integer NOT NULL,
	"text" text NOT NULL,
	"status" text DEFAULT 'ai_draft' NOT NULL,
	"review_note" text,
	"approved_by" text,
	"approved_by_name" text,
	"approved_by_email" text,
	"approved_by_role" text,
	"approved_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topic_intro_translations_topic_locale_version_uq" UNIQUE("topic_id","locale","version"),
	CONSTRAINT "topic_intro_translations_approval_recorded" CHECK ("topic_intro_translations"."status" <> 'approved' OR ("topic_intro_translations"."approved_at" IS NOT NULL AND "topic_intro_translations"."approved_by_name" IS NOT NULL AND "topic_intro_translations"."approved_by_email" IS NOT NULL AND "topic_intro_translations"."approved_by_role" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_translations" ADD CONSTRAINT "glossary_translations_term_id_glossary_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."glossary_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_translations" ADD CONSTRAINT "glossary_translations_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_translations" ADD CONSTRAINT "glossary_translations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_intro_translations" ADD CONSTRAINT "topic_intro_translations_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_intro_translations" ADD CONSTRAINT "topic_intro_translations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "glossary_translations_status_idx" ON "glossary_translations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topic_intro_translations_status_idx" ON "topic_intro_translations" USING btree ("status");