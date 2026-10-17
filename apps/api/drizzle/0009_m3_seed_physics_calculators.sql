-- M3 (K7), custom migration written by hand: list the physics calculators that
-- now exist in code (plan §2.2). Teachers can reorder, retitle or unpublish
-- them on the content page; existing rows are left alone.
INSERT INTO "calculators" ("id", "topic_id", "position", "published") VALUES
  ('ohms-law', 'ohms-law', 1, true),
  ('equivalent-resistance', 'series-parallel-circuits', 2, true),
  ('power-dc', 'power-and-energy', 3, true),
  ('load-demand', 'power-and-energy', 4, true),
  ('power-ac-single', 'ac-fundamentals', 5, true),
  ('power-three-phase', 'three-phase-systems', 6, true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "calculator_translations" ("calculator_id", "locale", "title", "description") VALUES
  ('ohms-law', 'hu', 'Ohm-törvény', 'Feszültség, áram vagy ellenállás kiszámítása a másik kettőből.'),
  ('equivalent-resistance', 'hu', 'Eredő ellenállás', 'Soros, párhuzamos és vegyes kapcsolás eredő ellenállása, áramai és feszültségei.'),
  ('power-dc', 'hu', 'Egyenáramú teljesítmény és energia', 'Teljesítmény, energia (kWh) és hatásfok.'),
  ('load-demand', 'hu', 'Fogyasztói igény', 'Összteljesítmény, napi és havi energia, tervezési áram (Ib).'),
  ('power-ac-single', 'hu', 'Egyfázisú váltakozó áramú teljesítmény', 'Hatásos, látszólagos és meddő teljesítmény, cos φ.'),
  ('power-three-phase', 'hu', 'Háromfázisú teljesítmény', 'Hatásos, látszólagos és meddő teljesítmény szimmetrikus háromfázisú fogyasztónál.')
ON CONFLICT ("calculator_id", "locale") DO NOTHING;
