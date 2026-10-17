-- M3 (K13), custom migration written by hand: list the installation calculators
-- that now exist in code (plan §2.2). Existing rows are left alone.
INSERT INTO "calculators" ("id", "topic_id", "position", "published") VALUES
  ('connection-power', 'service-connection-and-metering', 7, true),
  ('phase-balancing', 'distribution-boards', 8, true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "calculator_translations" ("calculator_id", "locale", "title", "description") VALUES
  ('connection-power', 'hu', 'Csatlakozási teljesítmény', 'A mérőhelyi kismegszakítóval felvehető teljesítmény, összevetve a fogyasztói igénnyel.'),
  ('phase-balancing', 'hu', 'Fázisok terhelése', 'Áramkörök elosztása az L1, L2, L3 fázisra, fázisáramok és javaslat az egyenletesebb elosztásra.')
ON CONFLICT ("calculator_id", "locale") DO NOTHING;
