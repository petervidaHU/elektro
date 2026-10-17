-- Content management (custom migration, written by hand): list the calculator
-- that already exists in code, so nothing disappears when the calculator list
-- starts reading the registry. Texts are the current hu i18n texts.
INSERT INTO "calculators" ("id", "topic_id", "position", "published")
VALUES ('voltage-drop', 'voltage-drop', 0, true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "calculator_translations" ("calculator_id", "locale", "title", "description")
VALUES ('voltage-drop', 'hu', 'Feszültségesés', 'Vezeték feszültségesésének számítása.')
ON CONFLICT ("calculator_id", "locale") DO NOTHING;
