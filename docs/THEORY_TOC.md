# Theory lessons: table of contents and authoring brief

This file is the brief for writing the theory lessons with Claude (the Claude app).
It is self-contained: hand over the whole file and ask for one module at a time.
The syllabus behind it is `docs/DEVELOPMENT_PLAN.md` §1.2. If the two disagree, the
plan wins: fix this file.

## Workflow

1. Give this file to Claude and ask: *"Write the lessons of module X following the
   brief. Deliver each lesson as a separate .md file at the given path."*
2. Put the delivered files into **`apps/api/content/lessons/`**, keeping the paths
   (`hu/<module>/<topic>/<NN>-<slug>.md`).
3. Run **`npm run content:check`**. It validates paths, front matter, topics, slugs,
   order and the lesson format, and it lists every claim marked for verification.
   Fix every reported problem.
4. Run **`npm run db:seed:content`**. New lessons are created as `ai_draft`. Lessons
   still in `ai_draft` are updated from their file. Lessons already in review or
   approved are never touched.
5. A teacher reviews each lesson in the app: they submit it for review, then approve
   it or request changes.

---

## Part 1: Brief for the author (Claude)

### Who reads the lessons

- **Adult learners** in the Hungarian *villanyszerelő* training (Villanyszerelő
  4 0713 04 07, Épületvillamosság specialisation), mostly on a **phone**.
- They prepare for the exams: the **sector base exam** and the **central interactive
  exam**. The central exam's parts are I. components and materials, II. technology,
  III. calculations, and IV. electrical safety (40 % of the points). Then there is the
  **project exam**, where any error in shock protection fails the exam.
- Write **in Hungarian**, addressing the reader informally (*tegező*: "Ki tudod
  számítani…", "Figyelj arra, hogy…"). Use short sentences and plain words, and
  explain every technical term the first time it appears. Respectful, never
  childish.
- **Be decisive and exact.** The lesson *is* the learning material: state facts,
  values, steps and rules plainly and completely, as a good instructor would. No
  hedging ("általában", "nagyjából", "kb." where an exact value exists) and no
  deferring to other material: never write "a tankönyvből tanuld", "nézd meg a
  szabványban", "a pontos értéket a tankönyv tartalmazza" or similar. Name the
  source of a rule in the text where it helps the learner (e.g. "az MSZ 1585
  szerint"), but give the rule itself.
- **Be thorough.** Cover every point in the table's *Content* column in full depth:
  definitions, the exact values with units, the steps in order, the reason behind
  each rule, and what goes wrong if it is broken.

### File format

One lesson = one file at the path given in the table of contents:

```
hu/<module>/<topic>/<NN>-<slug>.md
```

- `<module>` and `<topic>` exactly as in the table (English IDs, lower case).
- `<NN>`: the two-digit position within the topic (`01`, `02`, …).
- `<slug>`: lower case ASCII letters, digits and hyphens. No accents.

Each file starts with front matter, then the lesson body:

```markdown
---
title: Ohm törvénye
summary: Egy mondatban, miről szól a lecke (ez jelenik meg a témaoldalon).
verify:
  - Minden olyan állítás, szám vagy szabványhivatkozás, amelyet az oktatónak forrás alapján ellenőriznie kell
---

:::goals
- 2–4 tanulási cél, „Ki tudod…”, „Megérted…” formában.
:::

## Első szakasz címe

Szöveg…
```

- `title` and `summary` are required. Use one line each, with no line breaks.
- `verify` is a list. Leave it out if there's nothing to verify, but use it
  generously (see the rules below).

### Lesson body: what you may use

Use **Markdown** with paragraphs, `##` sections (2–5 per lesson), `###` subheadings,
bullet and numbered lists, **bold**, *italic* and `inline code`. On top of that,
**only these blocks** are allowed. Anything else makes the import fail.

| Block | Use for |
| --- | --- |
| `:::goals` … `:::` | The learning goals. **Every lesson starts with it**, as a bullet list. |
| `:::example` … `:::` | A worked example, with numbered steps and units. |
| `:::safety` … `:::` | A safety point. **Required in every lesson of a safety-critical (🛡) topic.** |
| `:::mistake` … `:::` | A common mistake and why it is wrong. |
| `:::exam` … `:::` | How the topic appears in the exam. |
| `::formula{id="…"}` | A formula from the app's registry (one line, no closing `:::`). |

Formula IDs that exist today (use them; they render exactly as the calculator
computes):

| id | renders as |
| --- | --- |
| `conductor-resistance` | R = ρ · L / S |
| `voltage-drop` | ΔU = b · R · I · cos φ |
| `voltage-drop-direct` | ΔU = b · ρ · L / S · I · cos φ |
| `voltage-drop-percent` | ΔU% = ΔU / Uₙ · 100 |
| `permitted-voltage-drop` | ΔUₘₐₓ = ΔU%ₘₐₓ · Uₙ / 100 |
| `minimum-cross-section` | Sₘᵢₙ = b · ρ · L · I · cos φ / ΔUₘₐₓ |
| `phase-factor-single-phase` | b = 2 |
| `phase-factor-three-phase` | b = √3 |

**Every other formula** goes in as `inline code` on its own line, e.g.
`` `U = R · I` ``. Use the symbols `·`, `/`, `√`, `²`, Greek letters, and subscripts
like `Uₙ`. Explain every symbol with its unit.

**Not allowed:** HTML, images, tables, links to other websites, quizzes or questions
with answer options (quizzes live in a separate app), and any other `:::` block.
Describe diagrams in words. If a figure is truly needed, write `[Ábra: …]` describing
it, and add a `verify` entry asking for the figure.

### Rules (non-negotiable)

1. **Check every value against a source before you write it; never invent one.**
   This covers limit values, current-carrying capacities, disconnection times, test
   voltages, minimum insulation resistances, RCD trip values, body-current
   thresholds, cable laying depths, voltage-level boundaries, IP digit meanings,
   wording of standard procedures and first-aid protocol details.
   - **Verified** (you found it in a source you could actually read, see *Checked
     sources* below): write the **exact value** in the lesson, decisively, and add
     a `verify` entry naming the claim and the source you checked it against, e.g.
     "Törpefeszültség: legfeljebb 50 V AC / 120 V DC – MEE VÉT kézikönyv VII.1.1
     (MSZ 1)". The teacher confirms it against the standard during review.
   - **Not verifiable**: leave the claim out of the lesson entirely (don't replace
     it with a vague sentence or a pointer to the textbook) and add a `verify` entry
     starting with `HIÁNYZIK:` that names the missing value and where it should come
     from, so the teacher can add it.
   - In the *Content* column below, "`verify`-jal" means exactly this: exact value
     in the text plus a `verify` entry with its source.
2. **Physics is fine**: Ohm's law, power, Kirchhoff, √3 in three-phase, RMS,
   reactance and so on. Check every worked example's arithmetic twice. Use the
   Hungarian decimal comma (`2,5 mm²`, `0,0225 Ω·mm²/m`) and a space between a
   number and its unit (`16 A`, `230 V`).
3. **Resistivity of copper and aluminium**: the app calculates with values at
   operating temperature (copper 0,0225, aluminium 0,036 Ω·mm²/m; MSZ HD 60364-5-52
   Annex G). Textbooks often use 20 °C values. Whenever you use a resistivity, say
   which one it is, and tell the reader to always use the value a task gives.
4. **Safety first.** In 🛡 topics, state the safe procedure and never a shortcut.
   Never suggest working on live parts. Mention isolation (*feszültségmentesítés*)
   wherever work on an installation is described.
5. **Terminology** (keep it consistent): feszültségesés, keresztmetszet,
   kismegszakító, áram-védőkapcsoló (ÁVK), érintésvédelem / áramütés elleni védelem,
   alapvédelem, hibavédelem, szigetelési ellenállás, hurokimpedancia, védővezető
   (PE), PEN-vezető, EPH (egyenpotenciálra hozás), földelési ellenállás, jegyzőkönyv,
   szerelői ellenőrzés, feszültségmentesítés.
6. **Length**: 500–1200 words per lesson. One lesson should take a phone reader
   about 5–10 minutes. Split rather than cram.
7. Every lesson stands on its own, but may refer to earlier lessons by title.

### Checked sources

Sources that were read and used to check values so far (add to this list when you
verify against a new one):

- MEE Villamos biztonsági felülvizsgálók kézikönyve, VII. fejezet (Műszaki alapok):
  feszültségszintek, SELV/PELV, MSZ 1585 öt biztonsági művelete, megengedett
  érintési feszültség, lekapcsolási idők.
- ITM: Villamos biztonsági ismeretek (munkavédelmi jegyzet, 2022): feszültségszintek,
  MSZ 1585:2016 személycsoportok, feszültségmentesítés, mentés és elsősegély.
- feszultsegmentesites.hu (az MSZ 1585:2016 6.2. szakaszának összefoglalója): az öt
  biztonsági művelet, feszültségkémlelés, földelés-rövidrezárás sorrendje,
  feszültség alá helyezés.
- European Resuscitation Council Guidelines 2021: Basic Life Support.
- IEC/TS 60479-1 (az EMF-Portal összefoglalója alapján): az áram élettani hatásainak
  küszöbértékei.
- MEE VÉT kézikönyv VII. fejezet, 307–355. o. (a 356–390. oldal szövege nem olvasható
  ki): hálózati rendszerek betűjelei, N/PE/PEN, fő földelősín, EPH-követelmény,
  `Z_s · I_a ≤ U₀`, II.17. táblázat.
- en.wikipedia: Earthing system, Circuit breaker (B/C/D pillanatkioldás), Residual-current
  device, IP code, Appliance classes, Measurement category, Multimeter, Current clamp,
  Three-phase electric power, Electrical reactance, Electrical impedance, AC power.
- de.wikipedia (a harmonizált DIN VDE 0100 / HD 60364 alapján): PEN-Leiter, Schutzleiter,
  Potentialausgleich, Erder (Elektroinstallation), Fundamenterder, TT-System,
  IT-System (Elektrotechnik), Schutzklasse (Elektrotechnik), Schutztrennung, Kleinspannung,
  Schmelzsicherung, Fehlerstrom-Schutzschalter, Leitungsschutzschalter, Mantelleitung.
- Nem olvasható automatikusan: electrical-installation.org, docplayer.hu, vde-verlag.de.

### A complete example

The lesson `hu/sizing-and-protection/voltage-drop/01-feszultseges-szamitasa.md`
already exists in the repository. It is the reference for structure, tone and block
use. **Don't rewrite it**, unless asked.

---

## Part 2: Table of contents

Legend:
- 🛡 = safety-critical topic, so a `:::safety` block is required in every lesson.
- **Exam** = the exam parts the topic appears in.
- **PTT** = topic numbers of the Programtanterv (2020) the lesson must cover.

Topics marked *(later)* are content phase 2. Write them after the phase-1 topics.
Content phase 3 topics and the other two specialisations are not part of this TOC.

### Module `safety`: Biztonság

#### `electrical-safety-basics`: Villamos biztonság alapjai 🛡
Exam: alapvizsga, IV · PTT 3.3.1.6.4, 3.5.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/safety/electrical-safety-basics/01-aram-elettani-hatasai.md` | A villamos áram élettani hatásai | Mi történik a testben áramütéskor (izomgörcs, szívritmuszavar, égés); az áramütés súlyosságát befolyásoló tényezők: áramerősség, áramút, behatási idő, frekvencia, a test ellenállása. Az IEC/TS 60479-1 küszöbértékei (érzékelési, elengedési, kamrafibrillációs) pontos számmal, `verify`-jal. |
| `hu/safety/electrical-safety-basics/02-feszultsegszintek-es-munkavegzok.md` | Feszültségszintek és a munkavégzők | Feszültségszintek az MSZ 1 szerint (törpe-, kis-, nagyfeszültség váltakozó és egyenfeszültségen; a KIF/KÖF/NAF üzemi felosztás; határok `verify`-jal); képzetlen (laikus), kioktatott és szakképzett személy, az MSZ 1585:2016 I–V. személycsoportjai: ki mit végezhet. |
| `hu/safety/electrical-safety-basics/03-mentes-es-elsosegely.md` | Műszaki mentés és elsősegély áramütésnél | A sérült kiszabadítása saját veszélyeztetés nélkül (lekapcsolás, szigetelt eszköz); segélyhívás (112); eszmélet és légzés vizsgálata; újraélesztés pontos protokollal (arány, ütem, mélység, AED; ERC 2021, `verify`-jal); a teendők sorrendje; orvosi megfigyelés. |

#### `isolation-procedure`: Feszültségmentesítés 🛡
Exam: IV · KKK 6.3/12 · PTT 3.11.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/safety/isolation-procedure/01-feszultsegmentesites-ot-lepese.md` | A feszültségmentesítés öt lépése | Az öt lépés az MSZ 1585 szerint, a helyes sorrendben, mindegyiknél: mit, miért, mivel; miért nem cserélhető fel a sorrend. A lépések pontos megfogalmazása az MSZ 1585:2016 6.2. szakasza szerint (`verify`). |
| `hu/safety/isolation-procedure/02-eszkozok-es-vedoeszkozok.md` | A feszültségmentesítés eszközei | Feszültségkémlelő és használata (ellenőrzés előtte és utána), földelő-rövidrezáró eszköz, lakatolás és figyelmeztető táblák, egyéni védőeszközök. |
| `hu/safety/isolation-procedure/03-feszultseg-ala-helyezes.md` | Feszültség alá helyezés és a munkaterület átadása | A visszakapcsolás menete fordított sorrendben; ki adhat engedélyt; a munkaterület átadása-átvétele; tipikus hibák. |

#### `occupational-safety`: Munkavédelem és tűzvédelem *(later)*
PTT 3.5.2.6.1–4, 3.5.1.6.6–7

| File | Title | Content |
| --- | --- | --- |
| `hu/safety/occupational-safety/01-munkavedelem-alapjai.md` | A munkavédelem alapjai | A munkavédelem célja, munkáltató és munkavállaló kötelezettségei (1993. évi XCIII. tv. – `verify`), kockázatok felismerése, egyéni védőeszközök. |
| `hu/safety/occupational-safety/02-villamos-tuzvedelem.md` | Villamos tűzvédelem | Hogyan okoz tüzet a villamos berendezés (túlterhelés, rossz kötés, ív); megelőzés; teendő villamos tűznél (oltóanyagok – `verify`). |
| `hu/safety/occupational-safety/03-magasban-vegzett-munka.md` | Magasban végzett munka | Létra és állvány biztonságos használata, leesés elleni védelem; szabályok `verify`-jal. |

### Module `fundamentals`: Villamos alapok

#### `dc-circuits`: Egyenáramú körök
Exam: alapvizsga · PTT 3.3.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/dc-circuits/01-villamos-alapfogalmak.md` | Villamos alapfogalmak | Töltés, áram (iránya, egysége), feszültség, ellenállás, vezetés – hétköznapi hasonlatokkal és pontos definícióval, mértékegységekkel. |
| `hu/fundamentals/dc-circuits/02-az-aramkor.md` | Az áramkör felépítése | Forrás, fogyasztó, vezeték, kapcsoló; zárt és nyitott kör; az áramkör rajzjelei szövegesen leírva; energiaforrások és fogyasztók csoportosítása. |
| `hu/fundamentals/dc-circuits/03-vezetok-szigetelok-felvezetok.md` | Vezetők, szigetelők, félvezetők | Az anyagok csoportosítása villamos szempontból, példák; miért fontos a szigetelés a gyakorlatban. |

#### `ohms-law`: Ohm törvénye
Exam: alapvizsga · PTT 3.3.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/ohms-law/01-ohm-torvenye.md` | Ohm törvénye | `U = R · I` és átrendezései; mértékegységek; két kidolgozott példa (áram, ellenállás számítása). |
| `hu/fundamentals/ohms-law/02-meres-ohm-torvenyevel.md` | Mérések és Ohm törvénye | U-I jelleggörbe; lineáris (ellenállás) és nem lineáris (izzó) fogyasztó; hogyan igazoljuk a törvényt méréssel. |

#### `conductor-resistance`: Vezetők ellenállása
PTT 3.3.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/conductor-resistance/01-vezeto-ellenallasa.md` | A vezető ellenállása | `::formula{id="conductor-resistance"}`; fajlagos ellenállás fogalma, réz és alumínium összehasonlítása (lásd 3. szabály); kidolgozott példa. |
| `hu/fundamentals/conductor-resistance/02-homersekletfugges.md` | Az ellenállás hőmérsékletfüggése | Miért nő a fémek ellenállása melegen; hőmérsékleti együttható (értékek `verify`); miért számol a vezetékméretezés üzemi hőmérsékletű értékkel. |

#### `series-parallel-circuits`: Soros és párhuzamos kapcsolás
Exam: alapvizsga · PTT 3.3.1.6.1, 3.4.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/series-parallel-circuits/01-soros-kapcsolas.md` | Soros kapcsolás | Eredő ellenállás, közös áram, feszültségek összege; példa. |
| `hu/fundamentals/series-parallel-circuits/02-parhuzamos-kapcsolas.md` | Párhuzamos kapcsolás | Eredő ellenállás (két ellenállásra is: `R = R₁ · R₂ / (R₁ + R₂)`), közös feszültség, áramok összege; példa; miért párhuzamosak a lakás fogyasztói. |
| `hu/fundamentals/series-parallel-circuits/03-kirchhoff-torvenyei.md` | Kirchhoff törvényei | Csomóponti és huroktörvény; csomópont, ág, hurok fogalma; alkalmazás egyszerű körre. |
| `hu/fundamentals/series-parallel-circuits/04-vegyes-kapcsolas-es-osztok.md` | Vegyes kapcsolás, feszültség- és áramosztó | Vegyes kapcsolás lépésenkénti egyszerűsítése (2–3 ellenállás); feszültségosztó terheletlen és terhelt állapotban; áramosztó; Wheatstone-híd elve. |

#### `voltage-sources`: Feszültségforrások *(later)*
PTT 3.4.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/voltage-sources/01-idealis-es-valos-generator.md` | Ideális és valós feszültségforrás | Belső ellenállás, kapocsfeszültség, rajzi jelölés. |
| `hu/fundamentals/voltage-sources/02-uzemallapotok.md` | Üresjárás, rövidzárás, terhelés | A három üzemállapot; rövidzárási áram; források soros és párhuzamos kapcsolása. |

#### `power-and-energy`: Teljesítmény és energia
Exam: III · PTT 3.3.1.6.1, 3.4.1.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/power-and-energy/01-villamos-teljesitmeny.md` | Villamos teljesítmény | `P = U · I`, `P = I² · R`, `P = U² / R`; watt, kilowatt; példák háztartási fogyasztókra. |
| `hu/fundamentals/power-and-energy/02-villamos-munka-es-energia.md` | Villamos munka és energia | `W = P · t`; kWh; fogyasztásmérő; energiaköltség számítása (a tarifát a feladat adja). |
| `hu/fundamentals/power-and-energy/03-hatasfok.md` | Hatásfok | Hasznos és felvett teljesítmény, veszteség, hőhatás; példa. |
| `hu/fundamentals/power-and-energy/04-fogyasztok-energiaigenye.md` | Fogyasztók teljesítmény- és energiaigénye | Több fogyasztó összteljesítménye, napi/havi energia, terhelő áram számítása teljesítményből (egyfázisú; a háromfázisút a háromfázisú témánál); vizsga III. rész. |

#### `electric-field-and-capacitors`: Villamos erőtér, kondenzátor *(later)*
PTT 3.4.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/electric-field-and-capacitors/01-villamos-eroter.md` | A villamos erőtér | Töltések közötti erő, térerősség, potenciál; szigetelők viselkedése, átütés. |
| `hu/fundamentals/electric-field-and-capacitors/02-kondenzator.md` | A kondenzátor | Kapacitás, `Q = C · U`, síkkondenzátor; soros és párhuzamos kapcsolás. |
| `hu/fundamentals/electric-field-and-capacitors/03-toltes-es-kisutes.md` | Töltés, kisütés, időállandó | `τ = R · C`; tárolt energia; miért veszélyes egy feltöltött kondenzátor (biztonság!). |

#### `magnetism-and-induction`: Mágneses tér és indukció *(later)*
PTT 3.4.1.6.3

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/magnetism-and-induction/01-magneses-ter.md` | A mágneses tér | Mágnes és áramjárta vezető tere, tekercs; indukció, fluxus, gerjesztés. |
| `hu/fundamentals/magnetism-and-induction/02-elektromagneses-indukcio.md` | Elektromágneses indukció | Indukciótörvény, Lenz-törvény, mozgási és nyugalmi indukció; gyakorlati példák (generátor, transzformátor). |
| `hu/fundamentals/magnetism-and-induction/03-onindukcio-es-tekercs.md` | Önindukció, a tekercs | Induktivitás, be- és kikapcsolási jelenségek, `τ = L / R`; miért keletkezik szikra induktív kör bontásakor. |

#### `ac-fundamentals`: Váltakozó áram alapjai
Exam: III · PTT 3.4.1.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/ac-fundamentals/01-szinuszos-mennyisegek.md` | Szinuszos váltakozó mennyiségek | Periódusidő, frekvencia (`f = 1 / T`), csúcsérték, effektív érték (`U = Uₘ / √2`); mit jelent a 230 V. |
| `hu/fundamentals/ac-fundamentals/02-r-l-c-valtakozo-aramon.md` | Ellenállás, tekercs és kondenzátor váltakozó áramon | Fázishelyzet; induktív és kapacitív reaktancia (`X_L = 2 · π · f · L`, `X_C = 1 / (2 · π · f · C)`), frekvenciafüggés. |
| `hu/fundamentals/ac-fundamentals/03-impedancia.md` | Impedancia | Soros RL, RC, RLC kör; `Z = √(R² + X²)`; fázisszög; példa. |
| `hu/fundamentals/ac-fundamentals/04-valtakozo-aramu-teljesitmeny.md` | Hatásos, meddő és látszólagos teljesítmény | P, Q, S; teljesítménytényező (cos φ); teljesítményháromszög; áram számítása `P = U · I · cos φ`-ből; vizsga III. rész. |

#### `three-phase-systems`: Háromfázisú rendszerek
Exam: III · PTT 3.4.1.6.5

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/three-phase-systems/01-haromfazisu-rendszer.md` | A háromfázisú feszültségrendszer | Három fázis, fáziseltolás, fázis- és vonali feszültség (230 V / 400 V, `U_v = √3 · U_f`), három- és négyvezetékes rendszer. |
| `hu/fundamentals/three-phase-systems/02-csillag-es-delta.md` | Csillag- és deltakapcsolás | Fázis- és vonali mennyiségek mindkét kapcsolásban; mikor melyiket használjuk. |
| `hu/fundamentals/three-phase-systems/03-haromfazisu-teljesitmeny.md` | Háromfázisú teljesítmény | `P = √3 · U · I · cos φ`; vonali áram számítása teljesítményből; példa; vizsga III. rész. |
| `hu/fundamentals/three-phase-systems/04-terheles-es-nullavezeto.md` | Szimmetrikus és aszimmetrikus terhelés | A nullavezető szerepe; mi történik nullaszakadáskor (biztonság!); forgó mágneses mező elve röviden. |

#### `measuring-instruments`: Mérőműszerek és alapmérések
Exam: alapvizsga · PTT 3.3.1.6.5

| File | Title | Content |
| --- | --- | --- |
| `hu/fundamentals/measuring-instruments/01-meresi-alapismeretek.md` | Mérési alapismeretek | Analóg és digitális műszer, méréshatár, pontosság, leolvasás. |
| `hu/fundamentals/measuring-instruments/02-multimeter-hasznalata.md` | A multiméter használata | Feszültségmérés (párhuzamosan), árammérés (sorosan), ellenállásmérés (csak feszültségmentes körben); méréshatár választása; mérési kategóriák (CAT – jelentésük `verify`). 🛡 tartalom: `:::safety` kötelező. |
| `hu/fundamentals/measuring-instruments/03-lakatfogo-es-mereseszkozok.md` | Lakatfogó és egyéb mérőeszközök | Lakatfogós árammérés elve és előnye; feszültségkémlelő és multiméter különbsége. |

### Module `documentation`: Dokumentáció

#### `wiring-diagrams`: Villamos rajzok és rajzjelek
Exam: I · PTT 3.3.1.6.2, 3.4.3.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/documentation/wiring-diagrams/01-villamos-rajzok-fajtai.md` | A villamos rajzok fajtái | Egyvonalas, többvonalas, elvi, kapcsolási, szerelési, elrendezési, nyomvonal- és áramútrajz: mire való melyik. |
| `hu/documentation/wiring-diagrams/02-rajzjelek.md` | Fontos rajzjelek | Vezetékek, kapcsolók, dugaszolóaljzat, lámpa, kismegszakító, ÁVK, mérő – szavakkal leírva (`[Ábra: …]` + `verify` ha kell). |
| `hu/documentation/wiring-diagrams/03-vilagitasi-kapcsolasok-rajzai.md` | Világítási kapcsolások rajzai | Egyvonalas és működési rajz kapcsolata; lépcsőházi világítás rajza. |
| `hu/documentation/wiring-diagrams/04-elosztok-es-fovezetek-rajzai.md` | Elosztók és fővezeték rajzai | Fővezetéki terv, elosztó áramútrajza és elrendezési rajza. |
| `hu/documentation/wiring-diagrams/05-vezerlesi-rajzok.md` | Vezérlési rajzok | Nyomógomb, mágneskapcsoló rajzjele; öntartás és keresztreteszelés rajza. |

### Module `installation`: Szerelés

#### `installation-planning`: A szerelési munka előkészítése *(later)*
Exam: I · PTT 3.6.1.6.1, 3.6.2.6.1

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/installation-planning/01-munka-felmerese.md` | A munka felmérése a tervből | Kiviteli terv olvasása, munkafázisok, műveleti sorrend, idő- és létszámigény. |
| `hu/installation/installation-planning/02-anyagjegyzek-es-arajanlat.md` | Anyag- és szerszámjegyzék, árajánlat | Anyagmennyiség meghatározása, anyagjegyzék, egyszerű árajánlat. |

#### `conductors-and-cross-section`: Vezetékek és keresztmetszet
Exam: I · PTT 3.6.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/conductors-and-cross-section/01-vezetekek-felepitese-es-jelolese.md` | Vezetékek felépítése és jelölése | Ér, szigetelés, köpeny; harmonizált és VDE jelölés (jelölések jelentése `verify`); érszínek (`verify`). |
| `hu/installation/conductors-and-cross-section/02-epuletvillamossagi-vezetekek.md` | Épületvillamossági vezeték- és kábeltípusok | A gyakori típusok és felhasználásuk; halogénmentes és tűzálló vezeték: mikor és miért. |
| `hu/installation/conductors-and-cross-section/03-vezetekkotesek.md` | Vezetékkötések | Követelmények (villamos és mechanikai szilárdság); csavaros, rugós, préselt kötés; érvéghüvely; hibás kötés veszélyei. |
| `hu/installation/conductors-and-cross-section/04-szabvanyos-keresztmetszetek.md` | Szabványos keresztmetszetek | A szabványos sor (1,5; 2,5; 4; 6; 10; 16; 25; 35; 50 … mm² – MSZ EN 60228); mitől függ a választás (feszültségesés, terhelhetőség, védelem) – rávezetés a méretezésre. |

#### `cables-and-cable-laying`: Kábelek és kábelfektetés *(later)*
Exam: I, II · PTT 3.6.1.6.2, 3.10.1.6.3

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/cables-and-cable-laying/01-kabelek-szerkezete.md` | A kábelek szerkezete | Erek, szigetelés, köpeny, páncél; kisfeszültségű földkábel. |
| `hu/installation/cables-and-cable-laying/02-kabelfektetes.md` | Kábelfektetés földben és épületben | Kábelárok, homokágy, téglázás, jelzőszalag; keresztezések; MSZ 13207 – mélységek és távolságok csak `verify`-jal; tűzszakaszok átvezetése. |
| `hu/installation/cables-and-cable-laying/03-kabelvegelzaro-es-osszekoto.md` | Kábelvégelzáró és kábelösszekötő | Zsugortechnológia lépései, tűzvédelmi szabályok; szerelői ellenőrzés. |

#### `installation-methods`: Szerelési módok
Exam: II · PTT 3.6.1.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/installation-methods/01-falon-kivuli-szereles.md` | Falon kívüli szerelés | Védőcsővel és anélkül; anyagok, szerelvények; előnyök, hátrányok. |
| `hu/installation/installation-methods/02-sullyesztett-szereles.md` | Süllyesztett szerelés | Falba, álpadlóba, betonba; védőcsövek, dobozok; szerelési zónák (`verify`). |
| `hu/installation/installation-methods/03-ip-vedettseg.md` | IP-védettség | Az IP-kód felépítése és jelentése (számjegyek jelentése `verify`); hol milyen védettség kell (fürdőszoba, kültér – `verify`). |

#### `lighting-circuits`: Világítási áramkörök
PTT 3.3.1.6.3, 3.6.1.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/lighting-circuits/01-egysarku-es-ketsarku-kapcsolas.md` | Egysarkú és kétsarkú kapcsolás | Felépítés, működés; miért a fázist kapcsoljuk (biztonság!). |
| `hu/installation/lighting-circuits/02-valto-es-keresztkapcsolas.md` | Váltó- és keresztkapcsolás | Két, illetve több helyről kapcsolt világítás. |
| `hu/installation/lighting-circuits/03-lepcsohazi-automata-impulzusrele.md` | Lépcsőházi automata és impulzusrelé | Működés, bekötés elve, alkalmazás. |
| `hu/installation/lighting-circuits/04-erzekelos-vilagitas.md` | Mozgás-, jelenlét- és fényérzékelős világítás | Érzékelőtípusok és felhasználásuk. |
| `hu/installation/lighting-circuits/05-vilagitastechnikai-alapfogalmak.md` | Világítástechnikai alapfogalmak | Fényáram, megvilágítás (`E = Φ / A`), színhőmérséklet, színvisszaadás, fényhasznosítás; ajánlott megvilágítási értékek csak `verify`-jal. |

#### `building-controls`: Épületvillamossági vezérlések *(later)*
PTT 3.6.2.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/building-controls/01-idorelek-es-celrelek.md` | Időrelék és célrelék | Típusok, alkalmazás világításvezérlésben. |
| `hu/installation/building-controls/02-biztonsagi-vilagitas.md` | Biztonsági és vészvilágítás | Célja, részei, telepítési előírások (`verify`). |

#### `distribution-boards`: Elosztóberendezések
Exam: projekt · PTT 3.6.1.6.1, 3.8.1.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/distribution-boards/01-elosztok-fajtai.md` | Az elosztók fajtái és felépítése | Lakás- és ipari elosztó, tokozás, védettség, sínrendszer. |
| `hu/installation/distribution-boards/02-eloszto-keszulekei.md` | Az elosztó készülékei | Főkapcsoló, kismegszakítók, ÁVK, túlfeszültség-levezető, sorkapcsok, N- és PE-sín; feliratozás. |
| `hu/installation/distribution-boards/03-eloszto-szerelese.md` | Elosztó szerelése és üzembe helyezése | Szerelési sorrend, bekötés rendje, ellenőrzés üzembe helyezés előtt (feszültségmentesítés!). |

#### `service-connection-and-metering`: Csatlakozóberendezés és mérőhely 🛡
Exam: projekt · KKK 6.3/3–4 · PTT 3.10.1.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/service-connection-and-metering/01-csatlakozoberendezes.md` | A csatlakozóberendezés részei | Leágazási és csatlakozási pont, csatlakozó vezeték (kábeles, szabadvezetékes) – MSZ 447 (`verify`). |
| `hu/installation/service-connection-and-metering/02-meretlen-es-mert-fovezetek.md` | Méretlen és mért fővezeték | Mi a különbség, mi hol van, ki a felelős érte. |
| `hu/installation/service-connection-and-metering/03-merohely-kialakitasa.md` | A mérőhely kialakítása | Fogyasztásmérő szekrény, egy- és háromfázisú direkt mérés; az elosztói engedélyes előírásai (`verify`). |
| `hu/installation/service-connection-and-metering/04-fofoldelosin-es-potencialrogzites.md` | Fő földelősín és potenciálrögzítő földelés | Fő földelősín szerepe, potenciálrögzítő földelés fogalma és követelményei (`verify`). |

#### `motor-control`: Motorvezérlések, mágneskapcsolók *(later)*
Exam: II · PTT 3.3.1.6.3, 3.8.1.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/motor-control/01-magneskapcsolo-es-ontartas.md` | Mágneskapcsoló és öntartás | Felépítés, működés; indítás-leállítás nyomógombbal; több helyről vezérlés; vészleállítás. |
| `hu/installation/motor-control/02-forgasiranyvaltas.md` | Forgásirányváltás és reteszelés | Két fázis felcserélése; villamos és mechanikus reteszelés – miért kötelező. |
| `hu/installation/motor-control/03-csillag-delta-inditas.md` | Csillag-delta indítás | Miért kell, hogyan működik, az indítási áram csökkenése (arány levezetése). |

#### `photovoltaic-systems`: Napelemes (fotovoltaikus) rendszerek 🛡 *(later)*
Exam: IV · KKK 6.3/8

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/photovoltaic-systems/01-napelemes-rendszer-felepitese.md` | A napelemes rendszer felépítése | Napelem mint áramgenerátor, string, inverter, mérés, hálózatra csatlakozás. |
| `hu/installation/photovoltaic-systems/02-pv-veszelyek-es-feszultsegmentesites.md` | A PV-rendszerek veszélyei | Fény alatt mindig feszültség alatt; DC ív; speciális feszültségmentesítés; tűzvédelmi szabályok (`verify`). |

#### `power-system`: Villamosenergia-rendszer *(later)*
PTT 3.10.1.6.1–2

| File | Title | Content |
| --- | --- | --- |
| `hu/installation/power-system/01-energiarendszer.md` | A villamosenergia-rendszer | Termelés, szállítás, elosztás; erőművek csoportosítása; terhelési görbe. |
| `hu/installation/power-system/02-halozatok-fajtai.md` | Hálózatok fajtái és feszültségszintjei | Sugaras, íves, gyűrűs, hurkolt hálózat; feszültségszintek (`verify`). |

### Module `sizing-and-protection`: Méretezés és védelem

#### `supply-systems`: Hálózati rendszerek (TN, TT, IT) 🛡
PTT 3.5.1.6.2, 3.10.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/supply-systems/01-halozati-rendszerek-jelolese.md` | A hálózati rendszerek betűjelei | Az első és második betű jelentése; N, PE, PEN vezető. |
| `hu/sizing-and-protection/supply-systems/02-tn-rendszerek.md` | TN-C, TN-S, TN-C-S | Felépítés, hol alkalmazzák; a PEN szétválasztása és utána tilos újra egyesíteni (biztonság!). |
| `hu/sizing-and-protection/supply-systems/03-tt-es-it-rendszer.md` | TT- és IT-rendszer | Felépítés, alkalmazás, mi következik belőle a védelemre. |

#### `voltage-drop`: Feszültségesés
Exam: III · PTT 3.6.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/voltage-drop/01-feszultseges-szamitasa.md` | A feszültségesés számítása | **Exists already; don't rewrite.** |
| `hu/sizing-and-protection/voltage-drop/02-keresztmetszet-valasztasa-feszultsegesesre.md` | Keresztmetszet választása feszültségesésre | `::formula{id="permitted-voltage-drop"}`, `::formula{id="minimum-cross-section"}`; kerekítés a szabványos sorra; ellenőrzés a választott keresztmetszettel (`::formula{id="voltage-drop-direct"}`); kidolgozott példa – a megengedett esés a feladatban megadott érték. |

#### `current-carrying-capacity`: Vezetékek terhelhetősége
Exam: III · PTT 3.6.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/current-carrying-capacity/01-terhelhetoseg-fogalma.md` | A terhelhetőség fogalma | Miért melegszik a vezeték, mi korlátozza (szigetelés hőállósága); terhelhetőség = tartósan megengedett áram. |
| `hu/sizing-and-protection/current-carrying-capacity/02-terhelhetoseget-befolyasolo-tenyezok.md` | A terhelhetőséget befolyásoló tényezők | Szerelési mód (referencia-módok), környezeti hőmérséklet, csoportosítás, szigetelés anyaga; helyesbítő tényezők elve – táblázati értékek NÉLKÜL (MSZ HD 60364-5-52 B melléklet). |
| `hu/sizing-and-protection/current-carrying-capacity/03-vezetek-kivalasztasa-szamitassal.md` | Vezeték kiválasztása számítással | A vizsga III. részének menete: terhelő áram → terhelhetőség táblázatból, helyesbítés → feszültségesés ellenőrzése → választás. Példában a táblázati értékeket a feladat „kivonatként” adja meg. |

#### `overcurrent-protection`: Túláramvédelem, kismegszakító
PTT 3.6.1.6.5

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/overcurrent-protection/01-tulterheles-es-zarlat.md` | Túlterhelés és zárlat | A túláram fajtái, hatásaik, bekapcsolási áramlökés. |
| `hu/sizing-and-protection/overcurrent-protection/02-olvadobiztositok.md` | Olvadóbiztosítók | Működés, fajták (Neozed, Diazed, késes), jellemző adatok. |
| `hu/sizing-and-protection/overcurrent-protection/03-kismegszakitok.md` | Kismegszakítók | Működés (termikus és elektromágneses kioldó), jelleggörbék (B, C, D – kioldási tartományok csak `verify`-jal), zárlati megszakítóképesség. |
| `hu/sizing-and-protection/overcurrent-protection/04-vedelmi-osszehangolas.md` | Túláramvédelem és vezeték összehangolása | `I_b ≤ I_n ≤ I_z` jelentése; szelektivitás elve; miért nem szabad nagyobb kismegszakítót tenni egy vezetékre. |

#### `shock-protection`: Áramütés elleni védelem (érintésvédelem) 🛡
Exam: IV, projekt · PTT 3.5.1.6.1–2, 3.6.1.6.3

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/shock-protection/01-alapvedelem.md` | Alapvédelem | Közvetlen érintés elleni védelem: szigetelés, burkolat, elhatárolás; IP-védettség kapcsolata. |
| `hu/sizing-and-protection/shock-protection/02-hibavedelem-onmukodo-lekapcsolas.md` | Hibavédelem: a táplálás önműködő lekapcsolása | Testzárlat, hibaáram útja, a védővezető és a védelmi eszköz együttműködése; lekapcsolási idők csak `verify`-jal. |
| `hu/sizing-and-protection/shock-protection/03-vedovezeto-nelkuli-vedelmek.md` | Védővezető nélküli védelmi módok | Kettős vagy megerősített szigetelés, SELV/PELV, védőelválasztás: elv, jelölés a készüléken. |
| `hu/sizing-and-protection/shock-protection/04-erintesvedelmi-osztalyok.md` | Érintésvédelmi osztályok | I., II., III. osztály; jelölések; mit jelent ez a bekötésnél. A projektvizsgán az érintésvédelmi hiba érvénytelen vizsgát jelent – `:::exam`. |

#### `earthing-and-bonding`: Földelés és egyenpotenciálra hozás 🛡
PTT 3.5.1.6.2, 3.5.1.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/earthing-and-bonding/01-foldeles-alapfogalmai.md` | A földelés alapfogalmai | Földelő, földelővezető, védővezető, fő földelősín; üzemi és védőföldelés. |
| `hu/sizing-and-protection/earthing-and-bonding/02-eph.md` | Egyenpotenciálra hozás (EPH) | Fő és helyi EPH, mit kell bekötni (`verify`), miért. |
| `hu/sizing-and-protection/earthing-and-bonding/03-foldelok-fajtai.md` | Földelők fajtái | Rúd-, szalag-, alapföldelő; a földelési ellenállást befolyásoló tényezők. |

#### `rcd-protection`: Áram-védőkapcsoló (ÁVK) 🛡
PTT 3.5.1.6.2, 3.6.1.6.3

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/rcd-protection/01-avk-mukodese.md` | Az ÁVK működése | Összegáram-transzformátor elve; miért érzékeli a földzárlatot; mire nem véd (fázis–nulla érintés). |
| `hu/sizing-and-protection/rcd-protection/02-avk-alkalmazasa-es-bekotese.md` | Az ÁVK alkalmazása és bekötése | Típusok és névleges kioldó áramok (`verify`); hol kötelező (`verify`); bekötés: N-t is át kell vezetni; próbagomb. |

#### `lightning-protection`: Villámvédelem *(later)*
Exam: IV · PTT 3.5.1.6.4, 3.6.2.6.4

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/lightning-protection/01-kulso-villamvedelem.md` | Külső villámvédelem | Felfogó, levezető, földelő; villámcsapás valószínűségét befolyásoló tényezők. |
| `hu/sizing-and-protection/lightning-protection/02-villamvedelmi-foldeles-ellenorzes.md` | Villámvédelmi földelés és ellenőrzés | Földelőfajták, vizsgáló csatlakozó, műszeres ellenőrzés. |

#### `surge-protection`: Túlfeszültség-védelem *(later)*
Exam: IV · PTT 3.5.1.6.5, 3.6.2.6.5

| File | Title | Content |
| --- | --- | --- |
| `hu/sizing-and-protection/surge-protection/01-tulfeszultsegek.md` | A túlfeszültség keletkezése és hatása | Közvetlen és közvetett villámhatás, kapcsolási túlfeszültség; belső villámvédelem. |
| `hu/sizing-and-protection/surge-protection/02-tulfeszultseg-levezetok.md` | Túlfeszültség-levezetők (T1, T2, T3) | Fokozatok, hol a helyük, összehangolás; vizsga IV. rész. |

### Module `machines`: Villamos gépek *(later)*

#### `transformers`: Transzformátorok
PTT 3.4.1.6.3, 3.8.1.6.2

| File | Title | Content |
| --- | --- | --- |
| `hu/machines/transformers/01-transzformator-mukodese.md` | A transzformátor működése | Felépítés, áttétel (`U₁ / U₂ = N₁ / N₂`, áramáttétel), üresjárás és rövidzárás. |
| `hu/machines/transformers/02-kulonleges-transzformatorok.md` | Különleges transzformátorok és mérőváltók | Biztonsági és elválasztó transzformátor; áram- és feszültségváltó (áramváltó szekunder köre nem szakadhat meg – biztonság!). |

#### `electric-motors`: Villamos motorok
PTT 3.4.1.6.5, 3.8.1.6.3–5

| File | Title | Content |
| --- | --- | --- |
| `hu/machines/electric-motors/01-aszinkronmotor.md` | Forgó mágneses mező és aszinkronmotor | Szinkron fordulatszám (`n_s = 60 · f / p`), szlip, felépítés, működés. |
| `hu/machines/electric-motors/02-motor-adattablaja-es-inditasa.md` | Az adattábla és az indítás | Adattábla adatai, névleges áram számítása, indítási áramlökés. |
| `hu/machines/electric-motors/03-egyenaramu-es-univerzalis-motorok.md` | Egyenáramú és univerzális motorok | Működés, alkalmazás röviden. |

### Module `verification`: Ellenőrzés és mérés

#### `initial-verification`: Szerelői ellenőrzés 🛡
Exam: IV · PTT 3.5.1.6.3, 3.6.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/initial-verification/01-szereloi-ellenorzes-celja.md` | A szerelői ellenőrzés célja és menete | Miért és mikor kell; a lépések sorrendje (MSZ HD 60364-6 – `verify`); dokumentálás. |
| `hu/verification/initial-verification/02-szemrevetelezes.md` | Szemrevételezés | Mit nézünk meg feszültségmentes állapotban: kötések, védővezetők, feliratok, védelmi eszközök kiválasztása. |
| `hu/verification/initial-verification/03-meresek-sorrendje.md` | A mérések sorrendje | Folytonosság → szigetelés → … → működési próbák; miért ez a sorrend (`verify`). |

#### `continuity-of-pe`: Védővezető (PE) folytonossága 🛡
PTT 3.5.1.6.3, 3.6.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/continuity-of-pe/01-vedovezeto-folytonossaganak-merese.md` | A védővezető folytonosságának mérése | Mérés célja, menete, műszer; EPH-vezetők mérése; kiértékelés elve (határérték `verify`). |

#### `insulation-resistance`: Szigetelési ellenállás 🛡
PTT 3.5.1.6.3, 3.6.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/insulation-resistance/01-szigetelesi-ellenallas-merese.md` | A szigetelési ellenállás mérése | Mérés célja, előkészítése (fogyasztók leválasztása, feszültségmentesítés), menete; mérőfeszültségek és minimális értékek csak `verify`-jal. |

#### `loop-impedance`: Hurokimpedancia 🛡
PTT 3.5.1.6.3

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/loop-impedance/01-hurokimpedancia-fogalma-es-merese.md` | A hurokimpedancia és mérése | A hibahurok útja; mérés elve és menete. |
| `hu/verification/loop-impedance/02-hurokimpedancia-kiertekelese.md` | A hurokimpedancia kiértékelése | Kapcsolat a védelmi eszköz kioldóáramával és a lekapcsolási idővel; képlet `Z_s · I_a ≤ U₀` elve – értékek `verify`. |

#### `rcd-testing`: Áram-védőkapcsoló vizsgálata 🛡
PTT 3.5.1.6.3, 3.6.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/rcd-testing/01-avk-vizsgalata.md` | Az ÁVK vizsgálata | Próbagomb és műszeres mérés különbsége; kioldási idő és kioldási áram mérése; követelmények csak `verify`-jal. |

#### `earth-resistance`: Földelési ellenállás *(later)*
PTT 3.5.1.6.3–4

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/earth-resistance/01-foldelesi-ellenallas-merese.md` | A földelési ellenállás mérése | Mérési módszerek, szondák elhelyezése; kiértékelés TT-rendszerben (értékek `verify`). |

#### `measurement-report`: Mérési jegyzőkönyv
PTT 3.6.2.6.6

| File | Title | Content |
| --- | --- | --- |
| `hu/verification/measurement-report/01-jegyzokonyv-tartalma.md` | A mérési jegyzőkönyv | Kötelező tartalmi és formai elemek (`verify`), kitöltés menete, aláírás és felelősség. |

---

## Totals

| Module | Topics | Lessons now | Lessons later |
| --- | --- | --- | --- |
| safety | 3 | 6 | 3 |
| fundamentals | 11 | 26 | 8 |
| documentation | 1 | 5 | 0 |
| installation | 11 | 19 | 14 |
| sizing-and-protection | 9 | 21 | 4 |
| machines | 2 | 0 | 5 |
| verification | 7 | 9 | 1 |
| **Total** | **44** | **86** (one already exists) | **35** |

Suggested order for writing: safety → sizing-and-protection → verification →
fundamentals → installation → documentation, then the *(later)* topics. The
safety-critical and exam-heavy topics come first.
