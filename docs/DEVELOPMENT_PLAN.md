# Development plan: syllabus, calculations, UX

> **This document is the single source of truth for scope, design and business
> decisions.** The `CLAUDE.md` files hold the durable engineering rules and link
> here. When a decision changes, update the *Decisions* table below (and §5) in the
> same PR, and update `CLAUDE.md` if a rule is affected. Never leave the two
> contradicting each other.

Status: **draft v2** (2026-10-16). This plan builds on the foundation that already
exists: auth and roles, i18n, lesson approval, the voltage-drop engine and
calculator, and the `topic_progress` / `practice_attempts` tables. It covers three
workstreams:

1. **Theory syllabus.** Mapped to the official curriculum documents in `docs/`.
2. **Calculations.** A calculator catalogue, a reference-data strategy and a step-checked practice engine.
3. **UI/UX.** Complete user journeys with feedback, summaries, history and dashboards.

The rules in `CLAUDE.md` still apply: i18n keys only, touch-first, server-side
authorization, formulas only in `packages/shared` with a source comment and tests,
and **no invented limit values**. Wherever this plan needs a value from a standard
or a table, it is marked **`[REF DATA]`** and handled through the reference-data
process in §2.3.

### Source documents

| File | What it is | Used for |
| --- | --- | --- |
| `docs/Villanyszerelő-2024.08.29.-v4.pdf` | **KKK**: *Képzési és kimeneti követelmények*, Villanyszerelő **4 0713 04 07**, v4 (2024) | Required outcomes (§6), exam structure (§7–8). This is the authoritative "what must be learned" |
| `docs/Villanyszerelő-2020.06.22.-v1.pdf` | **PTT**: *Programtanterv*, v1 (2020) | Subjects (*tantárgy*), topics (*témakör*) and their content (§3). Used for syllabus structure and order |

> The 2020 PTT is the latest Programtanterv (confirmed, Q13). The KKK is newer
> (2024, v4); where the two differ, the KKK wins.

Key facts from the documents that shape this plan:
- **Three specialisations** (*szakmairány*): Épületvillamosság, Villamos hálózat, Villamos készülék és berendezés.
- **Exam, central interactive part** (KKK 8.3 / 8.12 / 8.21, identical for all three specialisations):
  - I. Components and materials (20 %)
  - II. Technology (20 %)
  - III. **Calculations (20 %)**: *"Egy szabványos keresztmetszetű csatlakozó vezeték feszültségesés, terhelhetőség, valamint a terhelhetőséget befolyásoló tényezők figyelembevételével … történő kiválasztása számítással. Fogyasztók teljesítmény és energia igényének … meghatározása."*
  - IV. **Electrical safety (40 %)**: isolation procedure, the steps of the installer's check (*szerelői ellenőrzés*), lightning and surge protection, shock protection, PV.
- **Project exam**: *"Áramütés elleni védelem kialakításában elkövetett hiba érvénytelen vizsgának minősül!"* An error in shock protection fails the exam outright, so shock protection is the most safety-critical topic in the app.
- **Sector base exam** (KKK 7.2) calculations: voltage, current, resistance and equivalent resistance in simple circuits.
- **Allowed exam aids** (KKK 8.9): the relevant standards, *Villamos Ágazati Típusterv*, and a non-programmable calculator. Students are expected to **look values up in tables**, which shapes the reference-data approach in §2.3.
- **Standards named in the documents**: MSZ 1 (voltage levels), MSZ 1585 (isolation procedure, 5 steps), MSZ HD 60364-4-41 (shock protection), MSZ 447 (service connection and metering), MSZ 13207 (cable laying), OTSZ, VMBSZ.

### Decisions

| # | Question | Decision |
| - | --- | --- |
| – | Syllabus basis | KKK (2024) + PTT (2020), mapped in §1.2 |
| – | Specialisation | **Épületvillamosság first.** The shared base and Épületvillamosság get full content. Topics specific to Villamos hálózat or Villamos készülék és berendezés get topic IDs only, with content later |
| – | Guest access | Approved lessons + calculators are public. Practice, simulator, history and progress need a login |
| – | Teacher visibility | Teachers see all students' progress and history (no classes in v1) |
| – | Practice strictness | Guided and forgiving: tolerance-based checking, unlimited retries, hints on request, everything recorded, never blocking |
| Q1 | Registration | **Open self-registration**; every new account is a `student` |
| Q2 | Resistivity convention | Undecided. Keep the current default (operating temperature, MSZ HD 60364-5-52 Annex G) and **show a warning in the UI** (§2.4) |
| Q3 | Reference data | Resolved by the reference-data process in §2.3 |
| Q4 | Tolerance | Sensible defaults per step type, **shown on the UI**. Built so that it can later become configurable (§2.5) |
| Q5 | Session length | Student picks **3 / 5 / 10**, default **5** |
| Q6 | Mastery & "struggling" | Use the defaults in §3.6. Not critical, so tune later |
| Q7 | Task texts | v1: i18n files reviewed in PRs. **The DB tables for review/approval are created now** (§2.7) |
| Q8 | Problem reports | **Stub in v1**: button + stored report + read-only teacher list (§3.4 J9) |
| Q9 | Machines/control topics | Topic IDs added, content later |
| Q10 | Simulator card for guests | Shown locked with "Jelentkezz be" |
| Q11 | Privacy | Short notice on registration and on the History page; data kept until the account is deleted. **Exception (decided 2026-10-17):** the name, email and role of a reviewer stay in the approval record after their account is deleted (Q19), because approvals of safety-critical content must stay traceable. They are **hidden**: never shown in the UI, and only admins can retrieve them (admin-only API). The GDPR basis and retention are still open (Q20) |
| Q12 | Curriculum documents | Supplied; mapping done in §1.2 |
| Q13 | Newer PTT? | No. **The 2020 PTT is the latest**; use it |
| Q15 | Who verifies reference tables | **Teachers** (any user with role `teacher` or higher) |
| Q16 | Pre-filled candidate reference values | **Yes.** Claude pre-fills candidate values with citations, stored as `unverified`, and a teacher verifies them (§2.3) |
| Q17 | Exam-style (multiple-choice) answer mode | **Not in v1** |
| Q19 | Approval record | **Every approval is documented precisely** (2026-10-17, task S8): who (only `teacher` or higher; user id + a **snapshot** of name, email and role taken at approval time) and when (database timestamp). The snapshot is never updated, so it survives renaming, demotion or deletion of the account. Every review action (submit, approve, request changes) also goes to an append-only review log. **Admins may approve too** (they rank above teachers; confirmed 2026-10-17), and the record shows the role. Teacher+ can read the log; students and guests never see reviewer emails. Once a reviewer's account is deleted, their name and email are hidden from the app and only admins can retrieve them (Q11). Applies to lessons now, and to every later approvable entity: glossary (S5), topic intros (S6), task texts (§2.7), reference-table verification (§2.3) |
| Q21 | Content management | **Decided 2026-10-17 (task U14).** The **syllabus page** has a **detailed list view** for teachers and admins (no standalone page; revised the same day): a Mantine `Table` per module with a header row per topic, listing every lesson and calculator in detail (type, status, newest and live version, approver, dates), with new / edit / ordering (up/down buttons, touch-friendly) and a module filter. **Teachers and admins** use it; deleting is **admin-only**. Calculators are **code** (engine + page + tests; formulas never come from the database): a **calculator registry** in the database lists them, with topic, order, published flag and per-locale title/description. "New calculator" adds one that is already implemented in code; "delete" only takes it off the list. Calculator texts are not part of the approval workflow (short UI texts, edited directly by teacher+) |
| Q22 | Admin edits | **An admin's lesson edit goes live directly** (decided 2026-10-17): it is approved in the same save with the `publish_directly` action and recorded in the approval record like any approval (Q19). A teacher's edit is a draft (`ai_draft`) and goes through review |
| Q23 | Deleting a lesson | **Archive, restorable** (decided 2026-10-17): an archived lesson is hidden from everyone but admins (lists, reading, progress), its versions, reading history and approval log stay, and an admin can restore it (it goes to the end of its topic). The hard `DELETE /api/lessons/:slug` stays for housekeeping and e2e cleanup |
| Q24 | Teacher navigation | **Teachers and admins get a "Tanári" tab in place of "Szimulátor"** on the phone bar (decided with M2, to keep five tabs); the simulator stays reachable from the home page. The tab leads to students / review queue / problem reports / insights and carries the number of lessons waiting for review as a badge |
| Q26 | K8a pre-filled tables | **Postponed by the user (M3):** the reference tables start empty. Teachers enter values with their source, or the pre-fill is resolved later; until a table exists and is verified, `cable-selection` (K9) stays blocked | The UI says so: the teacher reference-table list shows a "missing tables" checklist for `cable-selection` (`REQUIRED_TABLES`, `PLANNED_CALCULATORS` in `reference/required.ts`), and `/calculators` shows a "Hamarosan" card for it (staff also see how many tables are missing) |
| Q25 | K12 task-text rows | **The mirrored i18n texts are stored `approved` with a fixed marker** (M2, K12): approver snapshot name "Repository review (pull request)", e-mail `repository-review@elektro.invalid`, role `admin`, no `approved_by` account. They were reviewed in the pull request, and the next real review replaces the marker. The scenario is a map `scenarios` (key → text), because a template can have several scenario variants (e.g. single- and three-phase) |
| Q18 | Extra calculators from the theory TOC review | **Added to the §2.2 catalogue** (2026-10-16). Highest value: `connection-power`, `phase-balancing` (P1), `material-list`, `short-circuit-current` (P2) |

---

## 1. Theory syllabus

### 1.1 Structure

```
Module (modul)          groups PTT subjects; e.g. "E. Méretezés és védelem"
 └─ Topic (téma)        = one TopicId in packages/shared; the unit of progress
     └─ Lesson (lecke)  1..n lessons per topic, ordered
         └─ Sections    goals, body, worked example, key terms, common mistakes, safety
```

Topic metadata lives in `packages/shared/src/syllabus/`. It is language-neutral and
has no user-facing text:

```ts
interface TopicMeta {
  id: TopicId;
  module: ModuleId;
  order: number;                       // position within the module
  prerequisites: TopicId[];            // drives "recommended next"; never locks content
  specialisations: Specialisation[];   // "building" | "network" | "equipment"
  ptt: string[];                       // PTT témakör refs, e.g. ["3.6.1.6.2"]
  kkk: string[];                       // KKK outcome/exam refs, e.g. ["6.3/5", "exam:III"]
  examParts: ExamPart[];               // "base" | "I" | "II" | "III" | "IV" | "project"
  safetyCritical?: boolean;            // shows a "Biztonságkritikus" badge
  contentPhase: 1 | 2 | 3;             // 1 = now, 2 = next, 3 = IDs only
}
```

- The `ptt` / `kkk` refs make the mapping auditable. A teacher can check every
  topic against the documents.
- `examParts` lets the UI show **"Vizsgán: III. Számítási feladatok"** on a topic.
  Adult learners care a lot about exam relevance.
- `TOPIC_GROUPS` (`basics` / `installation` / `measurement`) is replaced by `MODULES`.

### 1.2 Syllabus (Épületvillamosság + shared base)

Legend:
- **ID status**: `ex` = TopicId already exists; `new` = add to `TOPIC_IDS`.
- **Ph**: content phase.
- **Calc / Sim**: has a calculator or simulator part.
- 🛡 = safety-critical.

PTT refs are témakör numbers from the 2020 Programtanterv. KKK refs are row numbers
of §6.2 (base), §6.3 (shared across specialisations) and §6.4.2 (Épületvillamosság),
or exam parts.

#### A. Biztonság (safety, always first)
PTT: *Villamos biztonságtechnika* (3.5.1), *Munkavédelem* (3.5.2), *Villamos alapismeretek* 3.3.1.6.4

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| A1 | `electrical-safety-basics` 🛡 | new | Physiological effects of current; factors in shock severity; voltage levels (MSZ 1); lay / instructed / skilled persons (MSZ 1585); rescue and first aid | 3.3.1.6.4, 3.5.1.6.1 | 6.2/8, 6.2/10 | 1 | – | – |
| A2 | `isolation-procedure` 🛡 | new | **The 5 steps of isolation (MSZ 1585)**; voltage testers; earthing and short-circuiting tools; re-energising | 3.11.2.6.6 | 6.3/12, exam:IV | 1 | – | ✓ (step order) |
| A3 | `occupational-safety` | new | Workplace safety law basics, PPE, fire protection, work at height | 3.5.2.6.1–4, 3.5.1.6.6–7 | 6.3/14, 6.2/10 | 2 | – | – |

#### B. Villamos alapok (fundamentals)
PTT: *Villamos alapismeretek* (3.3.1, 288 h), *Elektrotechnika* (3.4.1, 108 h)

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| B1 | `dc-circuits` | ex | Charge, current, voltage, resistance, conduction; circuit structure; sources and loads; conductors, insulators, semiconductors | 3.3.1.6.1 | 6.2/6–7, exam:base | 1 | – | – |
| B2 | `ohms-law` | ex | Ohm's law; measuring U, I, R | 3.3.1.6.1 | 6.2/7, exam:base | 1 | ✓ | – |
| B3 | `conductor-resistance` | new | Resistivity; length and cross-section; temperature dependence | 3.3.1.6.1 | 6.2/7 | 1 | ✓ | – |
| B4 | `series-parallel-circuits` | ex | Series, parallel and mixed (2–3 resistors); Kirchhoff I–II; voltage and current divider; Wheatstone bridge | 3.3.1.6.1, 3.4.1.6.1 | exam:base | 1 | ✓ | – |
| B5 | `voltage-sources` | new | Ideal and real sources, internal resistance; open circuit, short circuit, loaded; series and parallel sources | 3.4.1.6.1 | – | 2 | ✓ | – |
| B6 | `power-and-energy` | ex | Work, power, efficiency; energy cost; **consumer power and energy demand** | 3.3.1.6.1, 3.4.1.6.1 | exam:III | 1 | ✓ | – |
| B7 | `electric-field-and-capacitors` | new | Electric field, capacitance, series and parallel capacitors, charging and time constant, stored energy | 3.4.1.6.2 | – | 2 | ✓ | – |
| B8 | `magnetism-and-induction` | new | Magnetic quantities, induction and Lenz's law, self- and mutual induction, inductors, transformer principle | 3.4.1.6.3 | – | 2 | ✓ | – |
| B9 | `ac-fundamentals` | ex | Sinusoidal quantities, RMS and peak, frequency; R, L, C in AC; reactance, impedance; RL / RC / RLC; P, Q, S, power factor | 3.4.1.6.4 | exam:III | 1 | ✓ | – |
| B10 | `three-phase-systems` | ex | Star and delta; phase and line quantities; 3- and 4-wire; symmetric and asymmetric load; three-phase power; rotating field | 3.4.1.6.5 | exam:III | 1 | ✓ | – |
| B11 | `measuring-instruments` | new | Analogue and digital instruments, ranges, accuracy, multimeter use; connecting ammeter and voltmeter; U–I characteristics | 3.3.1.6.5 | 6.2/7 | 1 | – | ✓ |
| B12 | `power-electronics-basics` | new | Diodes, LEDs, transistors as switches; rectifiers, power supplies; inverters, frequency converters (overview) | 3.4.2.6.1–3 | – | 3 | – | – |
| B13 | `logic-basics` | new | Logic gates, truth tables (basis for controls) | 3.4.2.6.4, 3.3.1.6.5 | – | 3 | – | – |

#### C. Dokumentáció (drawings and documentation)
PTT: *Villamos dokumentáció* (3.4.3, 72 h), 3.3.1.6.2

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| C1 | `wiring-diagrams` | new | Drawing types (single-line, multi-line, wiring, layout, route, current-path); symbols; lighting circuit diagrams; main-feeder plan; distribution board diagrams; control symbols (self-holding, interlocking) | 3.3.1.6.2, 3.4.3.6.2 | 6.2/6, 6.3/1, exam:I | 1 | – | ✓ (symbol drill, later) |

#### D. Szerelés (installation work, Épületvillamosság)
PTT: *Épületvillamosság 1.* (3.6.1, 180 h), *Épületvillamosság 2.* (3.6.2, 514 h), *Villamos hálózatok 1.* (3.10.1)

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| D1 | `installation-planning` | new | Survey from the design documents; materials and tool list; work phases; time estimate; quotation | 3.6.1.6.1, 3.6.2.6.1 | 6.3/2, exam:I | 2 | ✓ (material list, later) | – |
| D2 | `conductors-and-cross-section` | ex | Conductor data, marking systems (harmonised, VDE), common building wire types, halogen-free and fire-resistant; joint requirements | 3.6.1.6.2 | 6.3/1, exam:I | 1 | ✓ | – |
| D3 | `cables-and-cable-laying` | new | Cable structure; laying (MSZ 13207): trench, sand bed, warning tape, crossings; terminations and joints (heat-shrink); fire barriers | 3.6.1.6.2, 3.10.1.6.3 | 6.3/5–6, 6.4.2/6–8, exam:I–II | 2 | – | – |
| D4 | `installation-methods` | new | Surface and flush installation, with or without conduit; materials; IP ratings; special methods | 3.6.1.6.4 | 6.3/2, 6.4.2/1, exam:II | 1 | – | – |
| D5 | `lighting-circuits` | new | Basic switching circuits (one-way, two-pole, two-way, intermediate); staircase timer, impulse relay; motion/presence/light sensors; lighting basics (luminous flux, illuminance, colour temperature, CRI) | 3.3.1.6.3, 3.6.1.6.6 | 6.4.2/4 | 1 | ✓ (illuminance) | ✓ (wiring, later) |
| D6 | `building-controls` | new | Time relays, dedicated relays, lighting automation; safety and emergency lighting | 3.6.2.6.2 | 6.4.2/4–5 | 2 | – | – |
| D7 | `building-automation` | new | Smart-building systems: sensors, actuators, bus systems, EMC | 3.6.2.6.3 | 6.4.2/2 | 3 | – | – |
| D8 | `distribution-boards` | new | Board types and equipment, terminals, current-path and layout drawings; installing and commissioning a board | 3.6.1.6.1, 3.8.1.6.6 | 6.4.2/10, exam:project | 1 | – | – |
| D9 | `service-connection-and-metering` 🛡 | new | Service connection parts (MSZ 447); unmetered and metered main feeders; meter point; main earthing bar; potential-fixing earthing | 3.10.1.6.4 | 6.3/3–4, exam:project | 1 | – | – |
| D10 | `motor-control` | new | Contactors, self-holding, start/stop from several places, direction reversal, star-delta; interlocking, two-hand start, emergency stop | 3.3.1.6.3, 3.8.1.6.4 | 6.3/7, exam:II | 2 | – | ✓ (later) |
| D11 | `photovoltaic-systems` 🛡 | new | PV as a current generator; PV hazards and special isolation rules; fire and electrical safety | 3.9.2.6.2 | 6.3/8, exam:IV | 2 | ✓ (later) | – |
| D12 | `temporary-site-supply` | new | Temporary lighting and power supply on construction sites | – | 6.4.2/9 | 3 | – | – |
| D13 | `power-system` | new | Energy system overview: generation, transmission, distribution; network types; voltage levels | 3.10.1.6.1–2 | – | 2 | – | – |

#### E. Méretezés és védelem (sizing and protection)
PTT: 3.5.1.6.2, 3.6.1.6.2–5, 3.6.2.6.4–5, 3.10.1.6.2

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| E1 | `supply-systems` 🛡 | new | TN-C, TN-S, TN-C-S, TT, IT: structure and consequences; N, PE, PEN | 3.5.1.6.2, 3.10.1.6.2 | 6.4.2/11 | 1 | – | – |
| E2 | `voltage-drop` | ex | Why it matters; sizing by voltage drop; permitted values `[REF DATA]` | 3.6.1.6.2 | 6.3/5, **exam:III** | **1 (milestone)** | ✓ (exists) | – |
| E3 | `current-carrying-capacity` | new | Current-carrying capacity, installation reference methods, **correction factors** (grouping, ambient temperature) `[REF DATA]` | 3.6.1.6.2 | 6.3/5, **exam:III** | 1 | ✓ | – |
| E4 | `overcurrent-protection` | ex | Overload vs short circuit, inrush; fuses (Neozed, Diazed, …) and MCBs: characteristics, ratings, breaking capacity; coordination; selectivity | 3.6.1.6.5 | 6.2/8, 6.4.2/12 | 1 | ✓ | – |
| E5 | `shock-protection` 🛡 | ex | Basic protection (insulation, enclosures, IP); fault protection; automatic disconnection; protection without PE: double insulation, SELV/PELV, electrical separation; protection classes | 3.5.1.6.1–2, 3.6.1.6.3 | 6.3/9, 6.4.2/3, **exam:IV, project** | 1 | ✓ | ✓ |
| E6 | `earthing-and-bonding` 🛡 | ex | Earthing, protective and bonding conductors (EPH); electrode types; factors in earth resistance | 3.5.1.6.2, 3.5.1.6.4 | 6.4.2/11 | 1 | – | – |
| E7 | `rcd-protection` 🛡 | ex | How an RCD works, its role, wiring | 3.5.1.6.2, 3.6.1.6.3 | 6.2/8, 6.4.2/12 | 1 | ✓ | – |
| E8 | `lightning-protection` | new | External lightning protection: air terminal, down conductor, earth electrode; documentation; instrument checks | 3.5.1.6.4, 3.6.2.6.4 | 6.3/11, exam:IV | 2 | – | – |
| E9 | `surge-protection` | new | Causes and effects of surges; internal lightning protection; T1/T2/T3 SPDs and their coordination | 3.5.1.6.5, 3.6.2.6.5 | 6.3/10, exam:IV | 2 | – | – |

#### F. Villamos gépek (machines, overview for Épületvillamosság)
PTT: 3.4.1.6.3–5; detail in 3.8.1 (other specialisations)

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| F1 | `transformers` | new | Principle, ratio, single- and three-phase, special transformers, instrument transformers | 3.4.1.6.3, 3.8.1.6.2 | 6.4.3/1,6 | 2 | ✓ | – |
| F2 | `electric-motors` | new | Rotating field, synchronous speed, slip; asynchronous motor, starting current, star-delta; DC and universal motors (overview) | 3.4.1.6.5, 3.8.1.6.3–5 | 6.3/7 | 2 | ✓ | – |

#### G. Ellenőrzés és mérés (verification and measurement)
PTT: *Szerelői ellenőrzés* 3.5.1.6.3, *A villamos munka átadása, ellenőrzése* 3.6.2.6.6

| # | TopicId | ID | Content | PTT | KKK | Ph | Calc | Sim |
| - | --- | --- | --- | --- | --- | - | - | - |
| G1 | `initial-verification` 🛡 | new | **Steps of the installer's check (szerelői ellenőrzés)**; visual inspection; signs and labels; handing over | 3.5.1.6.3, 3.6.2.6.6 | 6.3/9, 6.4.2/3, **exam:IV** | 1 | – | ✓ (sequence) |
| G2 | `continuity-of-pe` 🛡 | ex | PE and bonding continuity measurement | 3.5.1.6.3, 3.6.2.6.6 | 6.4.2/3 | 1 | ✓ | ✓ |
| G3 | `insulation-resistance` 🛡 | ex | Insulation resistance measurement; test voltages and minimum values `[REF DATA]` | 3.5.1.6.3, 3.6.2.6.6 | 6.4.2/3 | 1 | ✓ | ✓ |
| G4 | `loop-impedance` 🛡 | ex | Fault loop; measuring and evaluating against the protective device | 3.5.1.6.3 | 6.4.2/3 | 1 | ✓ | ✓ |
| G5 | `rcd-testing` 🛡 | ex | Trip test and evaluation `[REF DATA]` | 3.5.1.6.3, 3.6.2.6.6 | 6.4.2/3 | 1 | ✓ | ✓ |
| G6 | `earth-resistance` | ex | Earth resistance measurement and evaluation | 3.5.1.6.3–4 | – | 2 | ✓ | ✓ |
| G7 | `measurement-report` | ex | Measurement and verification report (*jegyzőkönyv*): form and content requirements | 3.6.2.6.6 | 6.2/9, 6.4.2/3 | 1 | – | ✓ |

#### H. Topics specific to other specialisations (IDs only, content phase 3)
- Villamos hálózat: `overhead-lines` (3.11.2.6.1), `network-switchgear` (3.11.2.6.2), `substations` (3.11.2.6.3), `network-earthing` (3.11.2.6.4), `public-lighting` (3.11.2.6.5), `network-operation` (3.11.2.6.6–7).
- Villamos készülék és berendezés: `industrial-distribution` (3.9.2.6.1–2), `power-factor-correction` (3.9.2.6.1), `industrial-controls` (3.9.2.6.3), `machine-maintenance` (3.9.2.6.4), `equipment-testing` (3.9.2.6.5).

Not included: *Gépészeti alapismeretek* (metalwork, 3.3.2) and *Munkavállalói ismeretek / idegen nyelv* (3.1, 3.2). They are hands-on or general subjects with little value for this app.

> **First milestone remains E2 voltage drop end to end.** Topics with `contentPhase`
> 2–3 show as "Hamarosan" on the syllabus page.

### 1.3 Lesson format

Every lesson has the same skeleton, so AI drafts (phase 5) and teacher review are
consistent. The lesson body stays Markdown with a small set of **custom blocks**,
which are rendered by the web app and validated by a shared zod schema on save:

| Block | Purpose |
| --- | --- |
| `:::goals` | 2–4 learning goals ("A lecke végére tudni fogod...") |
| `:::formula{id=voltage-drop}` | Renders a formula **from `packages/shared`** by ID, so the text and the engine can never disagree |
| `:::example` | Worked example; may contain `::calculator{id="ohms-law" voltage=230 resistance=46}`, a button that opens the calculator with those inputs (ids and input names come from `PREFILL_FIELDS` in `calc/prefill.ts`; an unknown id, input or value is rejected on save) |
| `:::safety` | Safety callout, highlighted. Mandatory in 🛡 topics |
| `:::mistake` | Common mistake + why it's wrong |
| `:::exam` | "Így jelenik meg a vizsgán": which exam part the topic belongs to and what kind of task to expect |
| `:term[label]{id=key}` | Inline reference to a glossary term (tap to see the definition in a bottom sheet). It is an inline text directive, not a `:::` block, because it sits inside a sentence; an unknown key renders as plain text |
| `:::next` | Rendered automatically: calculator / practice / simulator links for the topic |

**Authoring workflow (v1):** lessons are written with Claude from the brief and
table of contents in [`THEORY_TOC.md`](THEORY_TOC.md), delivered as files under
`apps/api/content/lessons/<locale>/<module>/<topic>/<NN>-<slug>.md`, validated with
`npm run content:check` and loaded with `npm run db:seed:content` as `ai_draft`.
Approval then happens in the app as usual.

Additional content entities, each with the same versioning and approval as lessons:
- **Glossary (fogalomtár):** language-neutral `glossary_terms` + per-locale
  translations. Seed it with the domain terms from `CLAUDE.md`.
- **Topic intro:** a short per-locale description of each topic for the syllabus and topic hub pages.

### 1.4 Syllabus implementation tasks

| # | Task | Where |
| - | --- | --- |
| S1 | `MODULES`, `TopicMeta` (order, prerequisites, specialisations, PTT/KKK refs, exam parts, safety flag, content phase); add the new TopicIds; i18n keys + the i18n test | shared, web |
| S2 | `lessons.position` column + migration; order the lesson list | api |
| S3 | Markdown block renderer + zod validation of lesson bodies (unknown blocks are rejected on save) | shared, web, api |
| S4 | `formula` block registry: formula ID → rendered expression + engine function | shared |
| S5 | Glossary entity with approval workflow (reuse the lesson state machine) | api, web. Done: `glossary_terms` + `glossary_translations` (migration `0012`), `/glossary`, `/teacher/glossary`, review screen `/teacher/review/glossary/:key`, seed `npm run db:seed:glossary` (10 `ai_draft` terms for the domain terms in CLAUDE.md) |
| S6 | Topic intro texts (content entity, approval) | api, web. Done: `topic_intro_translations`, `/teacher/intros`, shown on the topic hub and the syllabus cards; no intro texts are authored yet |
| S7 | Unit test that every `ptt` / `kkk` ref has the right format, and a generated mapping table (`npm run syllabus:report` → Markdown) for teacher review | shared |
| S8 | **Approval audit trail** (Q19): approver snapshot on the translation (`approved_by_name/_email/_role` + `approved_at`, DB check that an `approved` row has all of them), append-only `content_review_events` log, `GET /lessons/:slug/reviews` (teacher+; deleted reviewers redacted) and `GET /admin/lessons/:slug/reviews` (admin-only, full record). Done for lessons; every later approvable entity reuses it (see §2.6) | shared, api |

---

## 2. Calculations

### 2.1 Two modes per calculator

1. **Calculator (kalkulátor).** Free input, instant result, every intermediate
   step shown with the formula and substituted values. It is public for guests.
2. **Practice (gyakorlás).** A generated task. The student enters each step and
   gets per-step feedback. It requires a login and is recorded in the history.

Both modes call the **same engine functions** in `packages/shared/src/calc/`.
Each engine function returns its **intermediate steps**, not only the final result:

```ts
// packages/shared/src/calc/types.ts (proposal)
interface CalcStep {
  id: string;              // "phase-factor", "resistance", "drop-volts", ...
  value: number;           // SI (or the field-documented domain unit)
  unit: Unit;              // "V" | "A" | "ohm" | "mm2" | "%" | ...
  formulaId: string;       // links to the formula registry (rendered in UI)
}
interface CalcResult<T> { result: T; steps: CalcStep[] }
```

### 2.2 Calculator catalogue

The priorities follow the documents. **Exam part III** (cable selection by voltage
drop + current-carrying capacity + correction factors; consumer power and energy
demand) and the **sector base exam** (U, I, R, equivalent resistance) come first.

Each row's data needs fall into one of three kinds:
- **Physics:** textbook formulas only, so the calculator can be built now.
- **Material:** material constants, which go through the reference-data process (§2.3).
- **Table:** values from standards tables, which go through the reference-data process (§2.3).

| ID | Topic | Calculates | Data | Prio |
| --- | --- | --- | --- | --- |
| `ohms-law` | ohms-law | U, I or R from the other two | physics | **P1** |
| `equivalent-resistance` | series-parallel-circuits | Series, parallel and mixed (2–3 R); branch currents and voltages; voltage and current divider | physics | **P1** |
| `conductor-resistance` | conductor-resistance | R = ρ·L/S; R at temperature θ | material: ρ at 20 °C, α | **P1** |
| `power-dc` | power-and-energy | P = U·I = I²R = U²/R; efficiency; energy (kWh) and cost (tariff is an input) | physics | **P1** |
| `load-demand` | power-and-energy | **Consumer power and energy demand**: sum of loads, daily/monthly energy, design current Ib (1- and 3-phase) | physics | **P1** |
| `power-ac-single` | ac-fundamentals | P, Q, S, cos φ; current from power | physics | **P1** |
| `power-three-phase` | three-phase-systems | P = √3·U·I·cos φ; star/delta phase and line conversions | physics | **P1** |
| `voltage-drop` | voltage-drop | ΔU, ΔU% (**exists**); **add**: required cross-section → next standard size; pass/fail vs limit | material (exists, see §2.4); permitted ΔU% = table | **P1** |
| `cable-selection` | current-carrying-capacity | **The exam III task**: from Ib, installation method, correction factors → minimum S by capacity; then the voltage-drop check → chosen standard S | table: current-carrying capacity per method, correction factors | **P1** (needs ref data) |
| `ac-impedance` | ac-fundamentals | X_L, X_C, Z of series RL / RC / RLC; current, voltages, phase angle | physics | P2 |
| `capacitors` | electric-field-and-capacitors | Series/parallel C; Q = C·U; time constant τ = R·C; energy | physics | P2 |
| `inductors` | magnetism-and-induction | Series/parallel L; τ = L/R; energy | physics | P2 |
| `voltage-source` | voltage-sources | Terminal voltage with internal resistance; short-circuit current; max power transfer | physics | P2 |
| `illuminance` | lighting-circuits | E = Φ / A; number of luminaires for a target illuminance (simplified, no utilisation factor unless supplied) | physics; target lux values = table | P2 |
| `overcurrent-coordination` | overcurrent-protection | Check Ib ≤ In ≤ Iz (+ the I2 condition) | table: standard In series, I2/In per device | P2 |
| `disconnection-check` | shock-protection, loop-impedance | Max permitted Zs for a device; pass/fail of a measured Zs | table: Ia per device type and characteristic, U0, disconnection times | P2 |
| `transformer-ratio` | transformers | U, I, N ratios | physics | P2 |
| `motor-basics` | electric-motors | Synchronous speed n_s = 60·f/p; slip; rated current from nameplate (P, U, η, cos φ); star-delta starting current ratio | physics | P2 |
| `rcd-tt-check` | rcd-protection, earth-resistance | Max RA for a given IΔn; pass/fail | table: touch voltage limit | P3 |
| `insulation-evaluation` | insulation-resistance | Pass/fail of a measured value for a circuit's nominal voltage | table: test voltage + minimum value | P3 |
| `rcd-test-evaluation` | rcd-testing | Pass/fail of trip time / trip current | table: limits per RCD type | P3 |
| `power-factor-correction` | power-factor-correction | Q_C = P·(tan φ1 − tan φ2); capacitance | physics | P3 (other specialisation) |
| `connection-power` | service-connection-and-metering | Available power from the meter-point MCB (1- and 3-phase, `P = U·I`, `P = √3·U·I`); compare with the consumer demand from `load-demand` | physics | **P1** |
| `phase-balancing` | distribution-boards | Assign circuits to L1/L2/L3; current per phase; the most loaded phase; suggest a more even split | physics | **P1** |
| `material-list` | installation-planning | Material quantities from a plan's data: cable lengths per type, conduit, boxes; cost with prices given in the task | physics (arithmetic) | **P2** |
| `short-circuit-current` | overcurrent-protection | Prospective fault current `I_k = U₀ / Z_s`; does the MCB's magnetic trip operate | physics; trip multiple per characteristic = table | **P2** |
| `charge-current` | dc-circuits | `Q = I·t` | physics | P2 |
| `kirchhoff` | series-parallel-circuits | Node and loop laws on a two-loop circuit, step-checked | physics | P2 |
| `wheatstone-bridge` | series-parallel-circuits | Balance condition; unknown resistance | physics | P2 |
| `ac-values` | ac-fundamentals | Peak ↔ RMS (`U = Uₘ / √2`), `f = 1 / T` | physics | P2 |
| `meter-range-extension` | measuring-instruments | Shunt and series resistor for range extension | physics | P2 |
| `measurement-error` | measuring-instruments | Digital meter accuracy (± % of reading + digits); range of the true value | physics (meter data given in the task) | P2 |
| `pe-continuity-check` | continuity-of-pe | Compare a measured PE resistance with `R = ρ·L/S` of the conductor | material: ρ | P2 |
| `body-current` | electrical-safety-basics | Current through the body `I = Uₑ / Rₜ`; compare with the IEC/TS 60479-1 thresholds | physics; body impedance = table | P3 |
| `neutral-current` | three-phase-systems | Neutral current of an unbalanced load (phasor sum of the phase currents) | physics | P3 |
| `pv-string` | photovoltaic-systems | String voltage and current from module data (series/parallel); check against the inverter input range | physics (module and inverter data given in the task) | P3 |
| `line-losses` | power-system | Line loss `P = I²·R` for the same power at two voltage levels (why transmission uses high voltage) | physics | P3 |
| `ip-code` | installation-methods | Decode an IP code (helper, no practice) | table: IP digit meanings | P3 |
| `earth-electrode` | earthing-and-bonding | Approximate resistance of a rod electrode from soil resistivity | table: soil resistivity, approximation formula | P3 |
| `measurement-report-practice` | measurement-report | Fill the pass/fail column of a report from measured values (uses the evaluation calculators and the simulator) | table (via the evaluators) | P3 |

Every row needs:
- an engine function + zod schema;
- unit tests, including the textbook's worked examples once they are supplied;
- a calculator page + i18n keys;
- practice templates;
- an entry in `CALCULATOR_IDS` (`packages/shared/src/calc/catalogue.ts`) and a name
  in `contentAdmin.calculatorIds`, after which teachers can list it in the app.

**Calculator registry (Q21, U14).** Which calculators students see, under which
topic, in which order and with which title/description is data
(`calculators` + `calculator_translations`), managed in the syllabus page's detailed list. The
calculator list, the topic hubs and the lesson pages read it from
`GET /api/calculators`; a calculator page answers 404 while its calculator is not
listed or not published (teachers and admins can preview it).

### 2.3 Reference data process (resolves Q3)

The problem: about a third of the calculators need values from copyrighted standards
(MSZ HD 60364-4-41, -5-52, -6; MSZ EN 60898-1; RCD standards) or from the course
textbook. The code must never guess them. The exam itself lets students use the
standards, so **reading the value from a table is part of the skill being taught.**

The approach:

1. **Reference tables are data, not code constants.** A new content entity
   `reference_tables` holds language-neutral rows. Each table has:
   - `key` (e.g. `iz-pvc-copper-method-a1`) and `schema` (column definitions with units);
   - `rows jsonb`;
   - `source` (standard or textbook, edition, table/page);
   - `status`: `unverified` → `verified` → `superseded`;
   - `verifiedBy`, `verifiedAt` and `version`, with the same verifier snapshot
     (name, email, role) and review-log entry as lesson approvals (Q19, §2.6).

   Changing a verified table creates a new version, just like lessons.
2. **The engine stays explicit.** Calculators receive table values as inputs, which
   is the existing pattern (`calculateVoltageDrop` takes resistivity explicitly). A
   wrong table can never silently change a formula.
3. **Only verified tables reach students.** Calculators and task templates that
   depend on a table are hidden, or shown as "Hamarosan", until the table is
   `verified`. Admins and teachers can preview them while unverified.
4. **Who fills the tables?** A teacher enters or pastes values in a simple table
   editor (teacher+ route), citing the source. **Claude pre-fills candidate values**
   (decided, Q16) with exact citations to publicly available sources (manufacturer
   catalogues, published textbook excerpts). These are always stored as `unverified`.
   A teacher checks them against the school's standard or textbook before they go
   live. Any `teacher` may verify (Q15). Pre-filling starts with the tables for
   `cable-selection` and the permitted voltage drop (task K8a).
5. **Practice uses table excerpts.** Like the exam, a task shows a small excerpt
   ("Kivonat a táblázatból") taken from the verified table. The student practises
   reading the table and calculating, never memorising numbers.
6. **Copyright.** Standards are copyrighted, so the app shows only **excerpts needed
   for a task**, never full tables for download. The `source` field is always shown
   under the excerpt.

Tables needed, by first use:

| Table | Used by | First needed |
| --- | --- | --- |
| Current-carrying capacity per installation method / insulation / material | `cable-selection` | M3 |
| Correction factors: ambient temperature, grouping | `cable-selection` | M3 |
| Permitted voltage drop | `voltage-drop` pass/fail, `cable-selection` | M1b (pass/fail can use a teacher-supplied value; until then only ΔU and ΔU% are shown) |
| Material constants: ρ at 20 °C and at operating temperature, α | `conductor-resistance`, `voltage-drop` | M3 (current constants are already sourced; move them into the table and keep the code values as test fixtures) |
| Standard rated currents of MCBs/fuses; I2 conventions | `overcurrent-coordination` | M4 |
| Ia per MCB characteristic, disconnection times, U0 | `disconnection-check` | M4 |
| Insulation test voltages and minimums; RCD trip limits; touch-voltage limit | evaluation calculators | M4+ |

### 2.4 Resistivity convention (Q2: undecided)

- The default stays as it is: operating temperature (MSZ HD 60364-5-52 Annex G).
- **UI warning** on the voltage-drop calculator and in its tasks: an info `Alert`
  (i18n) stating which ρ is used and that textbooks often use the 20 °C value,
  which gives results about 25 % lower.
- In **practice tasks, ρ is always printed as a given value** in the task
  statement, so the student's answer never depends on which convention they learned.
- Prepared for later: an admin setting `calc.resistivity_convention`
  (`operating` | `20c`) that selects which reference-table column is used. It is not
  built in v1, only noted.

### 2.5 Practice engine

**Task template.** This is code in `packages/shared/src/practice/`, one file per template:

```ts
interface TaskTemplate<P> {
  id: string;                         // "voltage-drop.basic-single-phase"
  version: number;                    // bump when generate/solve/steps change
  topicId: TopicId;
  difficulty: 1 | 2 | 3;              // 1 = one formula, 2 = multi-step, 3 = design/selection
  requiresTables?: string[];          // reference_tables keys; hidden until verified
  scenarioKey: string;                // i18n key for the word problem, interpolated with params
  generate(rng: SeededRng, tables): P;// realistic ranges, teacher-reviewed
  solve(params: P, tables): CalcResult<...>;  // calls the engine; never re-implements maths
  steps: StepSpec[];
}

interface StepSpec {
  stepId: string;                     // matches CalcStep.id
  input: "number" | "select" | "choice";
  options?: (params) => Option[];     // e.g. standard cross-sections
  tolerance?: Tolerance;              // overrides the default for this step type
  hintKeys: string[];                 // progressive: formula → substitution → partial value
  misconceptions?: MisconceptionCheck[];
}
```

**Deterministic and server-checked.**
- A task instance = `templateId + templateVersion + seed`. Client and server generate identical parameters.
- **Every step is checked by the API** (built in M1b): the client sends only the
  number or the choice, the server rebuilds the task from its seed, checks the
  step and stores the verdict. The client never computes a verdict. (The first
  draft had the client check first and the server re-check on submit; checking
  only on the server is simpler and gives the same instant feedback.)

**Tolerance (Q4: common sense, visible, configurable later).**

| Step type | Default | Reasoning |
| --- | --- | --- |
| Final physical value (V, A, Ω, W, …) | ±1 % relative | Matches 3 significant figures of hand calculation |
| Intermediate value | ±2 % relative | Absorbs the student's own rounding of earlier steps |
| Percentages (ΔU%) | ±0,05 percentage points absolute | A relative tolerance on small percentages is too strict |
| Selection (standard size, device rating) | exact | It is a choice, not a number |

- Under every numeric answer, the UI shows **"Elfogadott eltérés: ±1 %"** (i18n, formatted per locale).
- Tolerances live in one shared module (`practice/tolerance.ts`), so they can later be
  read from an admin setting without touching templates.
- A value outside tolerance but within 3× tolerance gets "≈ Majdnem: kerekítsd
  pontosabban" instead of ✗.

**Guided feedback (forgiving).**
- Each step is checked as soon as it is entered: ✓ correct / ≈ close / ✗ incorrect.
- **Error carried forward:** step *n* is checked against the student's own step *n−1*
  value, so one early mistake doesn't mark every later step wrong. The summary shows
  the original error.
- **Misconception detectors:** when a wrong value matches a known mistake, the
  feedback names it. Examples: forgot the factor 2 for single-phase, used √3 for
  single-phase, used total cable length instead of one-way, entered mm² as m², and
  percent vs fraction.
  Each detector is a pure function with a unit test and an i18n message.
- **Hints:** up to 3 levels per step, revealed on tap. Hint use is recorded.
- **Retries:** unlimited. After 2 wrong tries, a "Mutasd a megoldást" button appears.
  Revealing the solution counts like a used hint.
- **Units:** the unit is shown next to the input. The student does not type units.

**Touch-first number entry.** A shared **`<NumericKeypad>`** component: an on-screen
keypad with digits, decimal comma, ± and backspace, sized for thumbs (≥ 44 px). It is
used for practice answers on touch devices, while a hardware keyboard still works on
desktop. Parsing is locale-aware (`parseLocaleNumber` in shared, with tests).

**Sessions (Q5).** The student picks the length with a SegmentedControl
(**3 / 5 / 10**, default 5). Difficulty ramps 1 → 3 across the session. A session can
be left at any time and resumed.

### 2.6 Data model changes

```
practice_sessions     id, user_id, topic_id, task_count, started_at, finished_at,
                      status (active|finished|abandoned)
practice_attempts     (exists) + session_id, template_id, template_version, seed, difficulty,
                      steps jsonb [{stepId, answers[], verdict, hintsUsed, solutionShown,
                                    misconception?, tolerance}],
                      duration_ms, completed_without_help bool
lesson_reads          user_id, lesson_id, lesson_version_id, first_opened_at, completed_at,
                      last_section
topic_progress        replace the three booleans with: lesson_status, simulator_status,
                      mastery_level (none|started|practising|mastered),
                      unaided_rate_last10, last_activity_at
reference_tables      see 2.3 (+ reference_table_versions)
content_reports       see 3.4 J9
practice_task_texts   see 2.7
lesson_translations   (exists) + approved_by_name, approved_by_email, approved_by_role   (S8)
lessons               (exists) + archived_at, archived_by (FK, set null)                  (U14, Q23)
calculators           id (= CALCULATOR_IDS), topic_id, position, published, updated_by,  (U14, Q21)
                      created_at, updated_at
calculator_translations calculator_id (FK, cascade), locale, title, description          (U14)
content_review_events append-only: content_kind, content_slug, translation_id, version,  (S8)
                      locale, action, from_status, to_status, actor_id (FK, set null),
                      actor_name, actor_email, actor_role, note, created_at
```

**Approval record (S8, Q19).** An approval is stored as `approved_by` (FK to the
user, `ON DELETE SET NULL`) plus a snapshot of the approver's name, email and role
and `approved_at` (database `now()`). The snapshot is written once, in the same
transaction as the status change, and never updated; a check constraint rejects an
`approved` row without it. Every review action also adds one row to
`content_review_events`. A trigger makes that table append-only: the only allowed
change is the FK clearing `actor_id` when an account is deleted. The log has no FK
to the content row, so it outlives a deleted lesson too. Only `teacher` or higher
can review (`snapshotReviewer` in `packages/shared`; admins rank above teachers and
may approve, and their role is recorded). **Deleted reviewers:** the snapshot stays,
but `GET /lessons/:slug/reviews` (teacher+, used by the UI) returns them as
`actorDeleted: true` without name and email (`redactDeletedReviewer`). Only the
admin-only `GET /admin/lessons/:slug/reviews` returns the full record; no UI uses it.
New approvable entities (glossary,
topic intros, task texts, reference tables) get the same snapshot columns and write
to the same log with their own `content_kind`.

`topic_progress` stays a **denormalised cache** that can be recomputed from
`lesson_reads` + `practice_attempts` (+ simulator results). It is updated in the same
transaction as each write, and an admin script can rebuild all of it.

### 2.7 Task texts: prepared for review (Q7)

- **v1 runtime:** scenario, step labels and hint texts come from i18n files
  (`practice.<templateId>.*`). They are reviewed by a teacher in the PR.
- **Prepared now:** the schema for DB-backed, approvable task texts, mirroring lessons:
  - `practice_templates`: `id` (= template id), `topic_id`, `current_version`
  - `practice_task_texts`: `template_id`, `template_version`, `locale`, `scenarios jsonb` (scenario key → text),
    `step_labels jsonb`, `hints jsonb`, `status` (same `CONTENT_STATUSES`),
    `review_note`, `approved_by`, `approved_by_name`, `approved_by_email`,
    `approved_by_role`, `approved_at` (approval record, §2.6 / Q19)
- A seed script syncs i18n texts into the table as `approved` (they were reviewed in
  the PR). From phase 5 (AI generation), the loader reads the DB and new texts start
  as `ai_draft`.
- Attempts store `template_version`, so the history replay always shows the text and
  steps the student actually saw.

### 2.8 Calculation tasks

| # | Task |
| - | --- |
| K1 | Engine refactor: return `CalcResult` with steps; formula registry (shared) |
| K2 | Locale number parsing + `<NumericKeypad>` (web) |
| K3 | Practice core: `TaskTemplate`, seeded RNG, tolerance module, checker with error carried forward, misconception framework (shared, fully unit-tested) |
| K4 | Practice API: create session, get task, check step, finish session (server re-check, persist, update progress) |
| K5 | Practice UI: task screen, step feedback, tolerance display, hints, solution reveal, session summary |
| K6 | Voltage-drop templates (difficulty 1–3) + misconception detectors + ρ warning, which completes **milestone 1** |
| K7 | P1 physics calculators + templates: ohms-law, equivalent-resistance, power-dc, load-demand, power-ac-single, power-three-phase. Done: engine in `calc/physics.ts`, one page route `calculators/:calculatorId`, 14 practice templates in `practice/templates/physics.ts` (`load-demand` has no demand or diversity factors, plain sum), registry rows seeded by migration `0009` |
| K8 | Reference-tables entity: schema, versioning, verify workflow, teacher table editor, table-excerpt component. Done: `reference_tables` + `reference_table_versions` (migration `0011`), `/api/reference-tables`, verifier snapshot + `content_review_events` entries (kind `reference_table`, actions `create`/`verify`/`supersede`), `TableExcerpt`. Calculators and templates that depend on a table are not gated yet (`requiresTables` arrives with K9, the first user) |
| K8a | Pre-fill candidate reference tables as `unverified`, with citations: current-carrying capacity, correction factors, permitted voltage drop, material constants |
| K9 | `conductor-resistance` + `cable-selection` (exam III), once the tables are verified |
| K10 | P2 calculators (physics first, then table-dependent ones once verified) |
| K11 | Calculator ↔ lesson links (`:::example` opens the calculator pre-filled; calculator shows "learn the theory" link). Done: `::calculator` leaf directive, `readPrefill` on every calculator page, `TheoryLink` (first readable lesson of the topic, else the topic page) |
| K12 | `practice_templates` / `practice_task_texts` tables + i18n → DB sync script (unused at runtime in v1). Done: `npm run db:sync:practice-texts` (Q25) |
| K13 | P1 calculators from the TOC review: `connection-power`, `phase-balancing` + templates. Done: `calc/installation.ts`, 6 templates in `practice/templates/installation.ts`, migration `0010`; phase balancing suggests a split with the "largest circuit first onto the least loaded phase" rule |

---

## 3. UI / UX

### 3.1 Principles

- **Phone first.** Single column, bottom navigation on `base`, thumb-reachable primary
  actions (sticky bottom action bar on task screens). Everything works with touch only.
- **Always a next step.** Every page ends with one clear primary action (continue,
  next task, next lesson). There are no dead ends.
- **Feedback is immediate and specific.** It says *what* is wrong and *why*, not just "hibás".
- **Encouraging tone for adult learners.** The UI never shames, uses no childish
  gamification, and treats progress as information rather than a score.
- **Exam-aware.** Topics show their exam part. 🛡 topics carry a "Biztonságkritikus"
  badge, because a shock-protection error fails the project exam.
- **Accessible.** Colour is never the only signal (✓/✗ icons + text), the contrast
  meets WCAG AA, and `prefers-reduced-motion` is respected.

### 3.2 Navigation

| Phone (bottom tab bar) | Desktop (header) |
| --- | --- |
| Kezdőlap · Tananyag · Számolás · Szimulátor · Profil (teachers/admins manage content from the Tananyag tab, U14; they get a "Tanári" tab in place of Szimulátor, Q24) | same + user menu |

Guests see Kezdőlap · Tananyag · Számolás · Belépés.

### 3.3 Page inventory

All under `/:locale`. 🔓 = public, 👤 = student+, 🎓 = teacher+, 🛠 = admin.

| Route | Page | Access |
| --- | --- | --- |
| `/` | **Landing** for guests (what the app is, start reading, log in, register) / **Dashboard** when logged in | 🔓/👤 |
| `/register` | Self-registration (creates `student`), with the **privacy notice** (teachers can see progress; data kept until account deletion) | 🔓 |
| `/login` | Login with `returnTo` | 🔓 |
| `/syllabus` | Syllabus: modules → topics; exam-part and 🛡 badges; "Hamarosan" for later content phases; progress rings when logged in. **Teachers/admins** also get the **detailed list** view (default for them, switchable to the cards; U14, Q21): per module a table of every topic's lessons and calculators with status, live version + approver, dates, ordering, edit, "Új lecke" / "Új kalkulátor" per topic, archive/restore and remove (🛠 only) | 🔓 / 🎓 |
| `/topics/:topicId` | **Topic hub**: intro, exam relevance, lessons, calculator, practice, simulator (locked for guests, "Jelentkezz be"), my progress on this topic | 🔓 |
| `/lessons/:slug` | Lesson reader: progress bar, sections, glossary pop-ups, "Kész vagyok", report-a-problem | 🔓 |
| `/lessons/:slug/summary` | Lesson summary: key points, terms, recommended next | 🔓 |
| `/glossary` | Glossary (search + alphabetic, touch-friendly) | 🔓 |
| `/calculators`, `/calculators/:id` | Calculator list and calculators, with shown steps, source line under any table values, ρ warning where relevant | 🔓 |
| `/practice/:topicId` | Practice start: session length 3/5/10, resume active session | 👤 |
| `/practice/s/:sessionId` | Task screen (step by step) | 👤 |
| `/practice/s/:sessionId/summary` | **Session summary** | 👤 |
| `/progress` | **My progress**: per module/topic, mastery, exam-part coverage, active days | 👤 |
| `/history` | **History**: activity feed with a short privacy notice at the top | 👤 |
| `/history/practice/:sessionId` | Read-only replay of a session: every step, answers, hints, misconceptions | 👤 (own) / 🎓 |
| `/account` | Name, password change | 👤 |
| `/teacher/students` | Student list: last activity, topics mastered, struggling flag | 🎓 |
| `/teacher/students/:userId` | Student detail: same views as `/progress` + `/history` for that student | 🎓 |
| `/teacher/review` | Review queue (lessons, glossary, intros in `ai_draft` / `in_review`) | 🎓 |
| `/teacher/review/:id` | Review screen: rendered preview (phone-width toggle), diff to the live version, approve / request changes with note | 🎓 |
| `/teacher/content` | Redirects to `/syllabus`, where the content list lives (U14). Glossary and topic intros join that list later | 🎓 |
| `/teacher/content/lessons/new`, `/teacher/content/lessons/:slug` | Lesson form: topic, title, summary, Markdown body (slug only when new). Teacher save = draft, admin save = live (Q22) | 🎓 |
| `/teacher/content/calculators/new`, `/teacher/content/calculators/:id` | Calculator registry form: calculator (from code, when new), topic, title, description, published | 🎓 |
| `/teacher/reference-tables` | Reference tables: list with status, editor, verify action (§2.3) | 🎓 |
| `/teacher/reports` | Problem reports (stub: read-only list) | 🎓 |
| `/teacher/insights` | Aggregate: hardest steps, most common misconceptions per topic | 🎓 |
| `/admin/users`, `/admin/settings` | Users (create, role, reset password), settings | 🛠 |

### 3.4 User journeys

**J1 – Guest discovers the app**
1. Landing → "Nézd meg a tananyagot" → Syllabus.
2. Taps topic *Feszültségesés* (badge "Vizsgán: III.") → Topic hub (practice and simulator cards locked: "Jelentkezz be").
3. Reads the lesson → at the end, `:::next` offers the calculator → uses the calculator.
4. Taps "Gyakorlás" → Login, with a "Nincs fiókod? Regisztrálj" link → after login or
   registration, straight back to the practice start (`returnTo`).

**J2 – Returning student (core loop)**
1. Login → **Dashboard**:
   - "Folytasd ahol abbahagytad": the active practice session or the last unfinished lesson.
   - "Ajánlott következő": the next unmastered topic whose prerequisites are done, or a topic with recent mistakes.
   - Exam readiness strip: coverage of exam parts I–IV and the base exam (share of related topics practising/mastered). This is information, not a score.
   - Last 3 history entries → link to History.
2. Continue → Task screen (J3) → Session summary → "Ajánlott következő" → ...

**J3 – Practice session (step-checked)**
1. Practice start: topic, session length (3/5/10, default 5), estimated time, "Kezdés" (or "Folytatás").
2. Task screen, per task:
   - Scenario text + given values in a compact table, including any **table excerpt** (with source) and ρ as a given value.
   - Steps listed vertically. The current step is expanded, later steps are collapsed, and earlier ones show ✓/≈/✗.
   - The step shows an answer field with `<NumericKeypad>` (or a touch picker for choices), the fixed unit, **"Elfogadott eltérés: ±1 %"**, and "Ellenőrzés". The formula is hint level 2, not shown up front, so looking at it counts as help (built in M1b).
   - Feedback is inline: ✓ + short confirmation; ≈ "kerekítsd pontosabban"; ✗ + misconception message if detected; "Tipp" (levels 1 → 3); after 2 tries, "Mutasd a megoldást".
   - After the last step: task recap (the correct path) → "Következő feladat".
3. Leaving mid-session: the state is saved, and a toast says "Elmentettük, bármikor folytathatod".

**J4 – Session summary** (`/practice/s/:id/summary`)
- Headline: e.g. "4/5 feladat segítség nélkül".
- Per task: ✓ / ✓ with help / ✗, time, hints used. Tap to see the replay.
- **"Erre figyelj"**: the misconceptions detected in this session, each with a link to the lesson section that explains it.
- Topic mastery before → after.
- Actions: "Új gyakorlás" · "Vissza a témához" · "Ajánlott következő".

**J5 – Lesson**
1. The reader shows section progress (sticky thin bar) and remembers the last section for resume.
2. Glossary terms open in a bottom sheet (no navigation away).
3. `:::safety` and `:::exam` blocks are visually distinct.
4. End → "Kész vagyok" → lesson summary (key points, terms, next: calculator / practice / next lesson).

**J6 – History & progress**
- History: short privacy notice at the top, then a reverse-chronological feed grouped by day. Each entry is typed (📖 lesson, ✏️ practice, 🔌 simulator) with its result and links to its replay. It can be filtered by topic and type.
- Progress: syllabus tree with a mastery level per topic and module totals. Per topic it shows the accuracy trend (sparkline), the last activity and the most frequent misconception.

**J7 – Teacher monitoring**
1. Students list: sortable by last activity / progress, with a "struggling" flag (§3.6).
2. Student detail → the same Progress + History components, read-only, with session replay.
3. Insights: per topic, the steps with the highest error rate and the top misconceptions. This tells the teacher which lessons to improve.

**J8 – Teacher content review & reference data**
1. Review queue with a count badge in the nav.
2. Review screen: rendered as the student sees it (phone-width toggle) + diff against the live approved version → approve / request changes (note required). It shows the **approval record**: who approved the live version (name, email, role) and when, plus the review history from `GET /lessons/:slug/reviews` (a reviewer whose account was deleted is shown only as "törölt fiók" with their role; never with name or email).
3. Reference tables: open an `unverified` table → compare with the cited source → "Ellenőriztem" (records who and when) → dependent calculators and tasks go live.

**J9 – Content problem report (stub in v1)**
- On every lesson, calculator and task: "Hibát találtam" → bottom sheet with a category (wrong value / unclear text / typo / other) and an optional note → toast "Köszönjük, továbbítottuk".
- Stored in `content_reports` (reporter, target kind + id + version, category, note, status `open`, created_at).
- Teachers see a read-only list at `/teacher/reports`. No workflow or notifications yet.

### 3.5 Feedback & system states (cross-cutting)

| Situation | Treatment |
| --- | --- |
| Loading | Skeletons shaped like the content; no blank screens |
| Empty states | Every list has an empty state with a next action (e.g. empty history → "Kezdd az első leckével") |
| Errors | API error codes → `t("error.<CODE>")`; retry button; route-level ErrorBoundary with a way home |
| Success | Short non-blocking toast; important milestones (topic mastered) get a summary card, not confetti |
| Session expired | Redirect to login with `returnTo`; unsent practice answers are kept in memory and resubmitted |
| Offline | Banner "Nincs kapcsolat"; calculators keep working (pure client code); practice submit retries |
| Unverified data | Calculators or tasks that need unverified tables show "Hamarosan" for students and a "Nem ellenőrzött adat" banner for teachers |

### 3.6 Mastery model (Q6: sensible defaults)

| Level | Rule |
| --- | --- |
| `none` | no activity |
| `started` | any lesson opened or any task attempted |
| `practising` | lesson completed, or at least 1 task solved |
| `mastered` | all topic lessons completed **and** at least 3 of the last 5 tasks at difficulty ≥ 2 solved without hints/solution |

- **Struggling** (teacher flag) means fewer than 40 % of the last 10 tasks on a topic were solved unaided, with at least 5 attempts.
- Topics without practice tasks are `mastered` once all their lessons are completed.
- The rules live in `packages/shared` as a pure function with tests. The thresholds are constants that can later become admin settings.

### 3.7 UX implementation tasks

| # | Task |
| - | --- |
| U1 | App shell: bottom tab bar (phone) / header (desktop), role-aware menus, breadcrumbs on deep pages |
| U2 | Register page (open, student) with privacy notice + login `returnTo`; guest gating on practice/simulator cards |
| U3 | Syllabus page (modules, exam-part and 🛡 badges, "Hamarosan") + topic hub |
| U4 | Lesson reader v2: block renderer, glossary sheet, completion, resume, summary page |
| U5 | Dashboard (continue, recommended next, exam-readiness strip, recent history). Done: `GET /api/dashboard`, `recommendNext` / `examReadiness` in `packages/shared` |
| U6 | Practice screens (see K5) + session summary |
| U7 | History feed (with privacy notice) + session replay. Done: `/history`, `/history/practice/:id` (`GET /api/history`, `/api/practice/sessions/:id/replay`) |
| U8 | Progress page + mastery function |
| U9 | Teacher: students list, student detail (reuse U7/U8 components), insights. Done: `/teacher/students[/:userId]`, `/teacher/insights` |
| U10 | Teacher: review screen with preview + diff; content editor; approval record + review history (S8). Done: `/teacher/review[/:slug]` with queue badge, phone-width preview, line diff against the live version, approval record and review history; the editor is U14 |
| U11 | Cross-cutting: skeletons, empty states, toasts, error boundaries, offline banner. Done: slow-navigation skeleton, `useToast`, an error boundary inside the app frame, offline banner (practice answer re-submit on a dropped connection is not built yet) |
| U12 | Problem report stub: button + bottom sheet, `content_reports` table, POST endpoint, read-only teacher list. Done: on lessons, the voltage-drop calculator and practice tasks; `/teacher/reports` |
| U13 | Teacher reference-table list/editor/verify (UI for K8). Done: `/teacher/reference-tables[/new|/:key]` with a grid editor, a mandatory source, and a verify step that needs a confirmed comparison |
| U14 | **Content management** (Q21–Q23): detailed list view on `/syllabus` (Mantine `Table` per module) with lessons + calculators, new / edit / order, archive/restore (admin), calculator registry; forms under `/teacher/content/...` return to the syllabus. Done |

---

## 4. Delivery order

Each line is one or a few small PRs. The **milestone-1 path** comes first, and the
broadening follows. Status and the acceptance test of each milestone are tracked in
[`ROADMAP.md`](ROADMAP.md). The definition of done is in `CLAUDE.md`. M1a also
adds Playwright for the acceptance tests.

| Phase | Contents | Done when |
| --- | --- | --- |
| **M1a** Foundations for learning | S1, S2, K1, K2, U1, U2 | New nav works on phone; topics have modules, metadata and the PTT/KKK refs; open registration works |
| **M1b** Voltage drop end to end | S3, S4, U3, U4, K3, K4, K5/U6, K6, `lesson_reads`, U8 (basic) | A student reads the voltage-drop lesson → uses the calculator (with ρ warning) → completes a session (with tolerance shown) → sees the summary and progress; a teacher approves the lesson. Deployed. |
| **M2** Loop closed | S8, U14, U5, U7, U9, U10, U11, U12, K12 | Dashboard, history (with privacy notice), teacher monitoring, review and problem-report stub usable on phone |
| **M3** Exam-relevant breadth | K7, K13, K8 + U13, K8a, K9, S5 glossary, S6 intros, K11; lessons for modules A, B (phase 1), E | All P1 physics calculators with practice; reference-table workflow live; `cable-selection` live once tables are verified; ~15 approved lessons |
| **M4** Further calculators & content | K10, lessons for modules C, D, G (phase 1) | P2 calculators live; verification topics have lessons ready for the simulator |
| **M5+** | Simulator (phase 4), AI drafting (phase 5: task texts move to DB), pilot (phase 6), content phase 2–3 topics | per roadmap |

Every PR runs `npm run lint && npm run typecheck && npm test`. Tests are required for:
- the calculation engine;
- authorization: a teacher can read any student's history, a student only their own,
  a guest gets 401 on practice, only teacher+ can verify reference tables;
- approval transitions, including the reference-table verification state machine;
- the approval record: only teacher+ can approve, and the approver snapshot and
  review-log entry are written with every transition (S8).

---

## 5. Open questions

| # | Question | Default until answered |
| - | --- | --- |
None of these questions blocks work: each has a default that is built until it is answered.

| # | Question | Default until answered |
| - | --- | --- |
| Q2 | **Resistivity convention**: operating-temperature (current) or 20 °C values? | Operating temperature + UI warning; ρ printed in every task |
| Q20 | **GDPR basis for the approval record**: legal basis, retention period and wording in the privacy notice for keeping deleted reviewers' name and email (Q11 exception). The owner will elaborate. | Keep the snapshot; hide it from the UI; admin-only retrieval; no automatic erasure |
| Q14 | **Textbook**: which textbook does the course use? It decides material constants, worked examples for tests, and which reference tables to verify first. Still unknown. | Teachers verify the tables against the standards directly; engine tests use the standard-based values |
