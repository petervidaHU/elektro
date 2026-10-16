DROP INDEX "lessons_topic_id_idx";--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "lessons_topic_id_position_idx" ON "lessons" USING btree ("topic_id","position");