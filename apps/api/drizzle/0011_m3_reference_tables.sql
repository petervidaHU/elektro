CREATE TABLE "reference_table_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"columns" jsonb NOT NULL,
	"rows" jsonb NOT NULL,
	"status" text DEFAULT 'unverified' NOT NULL,
	"created_by" text,
	"verified_by" text,
	"verified_by_name" text,
	"verified_by_email" text,
	"verified_by_role" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reference_table_versions_table_version_uq" UNIQUE("table_id","version"),
	CONSTRAINT "reference_table_versions_verification_recorded" CHECK ("reference_table_versions"."status" = 'unverified' OR ("reference_table_versions"."verified_at" IS NOT NULL AND "reference_table_versions"."verified_by_name" IS NOT NULL AND "reference_table_versions"."verified_by_email" IS NOT NULL AND "reference_table_versions"."verified_by_role" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "reference_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reference_tables_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "reference_table_versions" ADD CONSTRAINT "reference_table_versions_table_id_reference_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."reference_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_table_versions" ADD CONSTRAINT "reference_table_versions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_table_versions" ADD CONSTRAINT "reference_table_versions_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_tables" ADD CONSTRAINT "reference_tables_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reference_table_versions_status_idx" ON "reference_table_versions" USING btree ("status");