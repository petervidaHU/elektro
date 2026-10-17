-- M4 (K10), custom migration written by hand: list the P2 physics calculators that now
-- exist in code (plan §2.2). Existing rows are left alone.
INSERT INTO "calculators" ("id", "topic_id", "position", "published") VALUES
  ('ac-impedance', 'ac-fundamentals', 9, true),
  ('capacitors', 'electric-field-and-capacitors', 10, true),
  ('inductors', 'magnetism-and-induction', 11, true),
  ('voltage-source', 'voltage-sources', 12, true),
  ('transformer-ratio', 'transformers', 13, true),
  ('charge-current', 'dc-circuits', 14, true),
  ('ac-values', 'ac-fundamentals', 15, true),
  ('kirchhoff', 'series-parallel-circuits', 16, true),
  ('wheatstone-bridge', 'series-parallel-circuits', 17, true),
  ('meter-range-extension', 'measuring-instruments', 18, true),
  ('measurement-error', 'measuring-instruments', 19, true),
  ('motor-basics', 'electric-motors', 20, true),
  ('short-circuit-current', 'overcurrent-protection', 21, true),
  ('illuminance', 'lighting-circuits', 22, true),
  ('pe-continuity-check', 'continuity-of-pe', 23, true),
  ('material-list', 'installation-planning', 24, true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "calculator_translations" ("calculator_id", "locale", "title", "description") VALUES
  ('ac-impedance', 'hu', 'Váltakozó áramú impedancia', 'Soros R, L, C kör impedanciája, árama, fázisszöge és teljesítménytényezője.'),
  ('capacitors', 'hu', 'Kondenzátorok', 'Soros és párhuzamos kapacitás, töltés, energia, időállandó és töltési görbe.'),
  ('inductors', 'hu', 'Tekercsek', 'Soros és párhuzamos induktivitás, energia, időállandó és az áram növekedése.'),
  ('voltage-source', 'hu', 'Valódi feszültségforrás', 'Kapocsfeszültség, rövidzárási áram és a legnagyobb átvihető teljesítmény.'),
  ('transformer-ratio', 'hu', 'Transzformátor áttétele', 'Feszültségek, menetszámok és áramok az ideális transzformátoron.'),
  ('charge-current', 'hu', 'Töltés és áram', 'Q = I · t bármelyik mennyiségre.'),
  ('ac-values', 'hu', 'Váltakozó mennyiségek', 'Effektív érték és csúcsérték, frekvencia és periódusidő.'),
  ('kirchhoff', 'hu', 'Kirchhoff törvényei', 'Két forrásos, három ágú hálózat ágáramai és csomóponti feszültsége.'),
  ('wheatstone-bridge', 'hu', 'Wheatstone-híd', 'Kiegyenlített híd ismeretlen ellenállása és a hídfeszültség.'),
  ('meter-range-extension', 'hu', 'Méréshatár-kiterjesztés', 'Söntellenállás árammérőhöz és előtét-ellenállás feszültségmérőhöz.'),
  ('measurement-error', 'hu', 'Mérési hiba', 'Digitális műszer pontossága: a valódi érték tartománya.'),
  ('motor-basics', 'hu', 'Motor alapadatai', 'Szinkron fordulatszám, szlip, névleges áram és csillag-delta indítás.'),
  ('short-circuit-current', 'hu', 'Zárlati áram', 'I_k = U₀ / Z_s, és eléri-e a megadott kioldó áramot.'),
  ('illuminance', 'hu', 'Megvilágítás', 'E = Φ / A és a szükséges lámpatestek száma.'),
  ('pe-continuity-check', 'hu', 'Védővezető folytonosságának értékelése', 'A mért ellenállás összevetése a számítottal.'),
  ('material-list', 'hu', 'Anyagjegyzék és költség', 'Tételek mennyisége és egységára alapján az összköltség.')
ON CONFLICT ("calculator_id", "locale") DO NOTHING;
