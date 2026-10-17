# Roadmap

The order of work plus a status checklist. Task IDs and the full design are in
[`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md). A milestone is done when its
**acceptance test** (Playwright, phone viewport) passes. See *Definition of done*
in `CLAUDE.md`.

| | Milestone | Tasks | Acceptance test (write it first) |
| - | --- | --- | --- |
| ☑ | **M1a** Foundations | S1 S2 K1 K2 U1 U2 + Playwright setup | Guest registers, lands on the dashboard, navigates with the bottom bar |
| ☑ | **M1b** Voltage drop end to end 🚩 deploy | S3 S4 U3 U4 K3 K4 K5/U6 K6 U8 | Lesson → calculator → 5-task session → summary → progress; teacher approves the lesson |
| ☑ | **M2** Loop closed | S8 ✓ U14 ✓ U5 ✓ U7 ✓ U9 ✓ U10 ✓ U11 ✓ U12 ✓ K12 ✓ | Teacher opens a student's history and replays a session; student reports a problem |
| ☐ | **M3** Exam breadth | K7 ✓ K8 ✓ U13 ✓ K13 ✓ S5 ✓ S6 ✓ K11 ✓ lessons A, B, E ✓ (drafts, in review) · K8a K9 open (cable tables postponed, Q26) | Teacher verifies a table → `cable-selection` becomes visible to students |
| ☑ | **M4** More calculators | K10 ✓ (physics set; the table-dependent calculators wait for verified tables) · lessons C, D, G ✓ (drafts, in review) | P2 calculators reachable from their topic hubs |
| ☐ | **M5+** | Simulator → AI drafting → pilot | Defined when M4 is done |

Tick a milestone only when its acceptance test is green on `main`.
