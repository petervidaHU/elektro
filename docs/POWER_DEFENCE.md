# Power-defence: game design

Status: **idea / design draft** (2026-11-16). Not scheduled yet; see the plan's
Decisions (Q27) and §4 (*M6*). Task IDs in this document use the prefix `PD`.

A practice mode inside the elektro app where the student defends a plot (a
warehouse against zombies) by planning and running its electrical installation.
Calculations are not asked as questions: they are the moves. A wrong cable,
breaker or missing RCD shows up as a dark zone, a stalled turret or a hazard.

## 1. Goals and non-goals

**Goals**
- Practise the four exam-relevant skills in one loop: **voltage drop**, **sizing**
  (current-carrying capacity, cross-section), **protection** (MCB, RCD,
  selectivity) and **measuring** (verification before re-energising).
- Consequences that follow real physics, so the game never contradicts the
  calculators.
- Playable on a phone, touch only.

**Non-goals (for now)**
- No multiplayer, leaderboards, in-app purchases or monetization.
- No separate game account or progress system: it uses the app's login and
  topic progress.
- No quiz/exam features (they stay in the separate app).

## 2. Core loop: day → night → dawn

| Phase | Time | What the student does | Skill practised |
| --- | --- | --- | --- |
| **Day: build** | Untimed (pause) | Places the source, distribution board, cables (type, cross-section, length on the grid), MCBs, RCDs and loads (lamps, sensors, turrets) within a budget. Before "power on", answers **one prediction** (e.g. branch current, ΔU% to a turret); a correct prediction earns a bonus | Load demand, design current, voltage drop, cable selection, Ib ≤ In ≤ Iz |
| **Night: defend** | **Real time** | Waves arrive. The circuit is simulated live: loads spike, zombies damage cables. The student reacts with taps: reset a breaker, isolate a damaged circuit, switch a zone to another feed, shed load | Protection under pressure: which device tripped and why; overload vs short circuit vs earth fault |
| **Dawn: verify** | Untimed | Damaged circuits must be measured before reuse, using the simulator's instruments (insulation resistance, PE continuity, loop impedance, RCD test). A circuit put back without a passing check carries a hidden fault into the next night | Initial verification sequence, evaluating measured values, jegyzőkönyv |

Real time applies only to the night. Every decision that needs a calculation is
made in an untimed phase, so the game rewards thinking, not reflexes.

## 3. How electrical behaviour drives the game

| Electrical fact | Game effect |
| --- | --- |
| Voltage drop to a load | Lamps light a smaller radius; turrets fire more slowly. Beyond the permitted ΔU% `[REF DATA]` the load counts as failed |
| Overload (I > In for long enough) | The MCB trips after its time-current behaviour; the zone goes dark |
| Cable undersized for its current (Iz < In) | **Always penalised** (cable damage / fire event), even if nothing tripped. Unsafe designs must never pay off |
| Short circuit from a damaged cable | Instant trip; downstream devices first if selectivity is right, otherwise a larger area goes dark |
| Insulation fault to exposed parts | With an RCD: safe trip. Without: a "hazard" event that costs heavily and ends the night on repeat |
| Supply limit (connection power) | Total demand above it trips the main breaker |

Rules:
- All numbers come from the **calculation engine in `packages/shared`** (the same
  functions the calculators use) and from **verified reference data** only.
  Levels that need unverified tables are hidden from students, like the
  calculators ("Hamarosan").
- Game-only quantities (zombie health, turret damage, budget) are clearly
  separate from electrical quantities and never shown as electrical values.
- Simplifications (e.g. a time step for the trip curve) are documented per level
  and never produce a result that would be wrong in a real installation.

## 4. Components (MVP set first)

| Component | MVP | Electrical model |
| --- | --- | --- |
| Power source / service connection | ✓ | Single-phase 230 V supply with a main breaker; later three-phase |
| Cable | ✓ | Material, cross-section, length → R (`conductor-resistance`), ΔU (`voltage-drop`), Iz `[REF DATA]` |
| MCB | ✓ | In and characteristic; overload and magnetic trip `[REF DATA]` |
| Lamp | ✓ | Fixed power; light radius scales with delivered power |
| Turret | ✓ | Power draw with an inrush spike when firing; fire rate scales with voltage |
| RCD | later | IΔn; trips on earth fault |
| Sensor | later | Small load; switches lamps/turrets on (control circuits) |
| Distribution sub-board | later | Selectivity between levels |
| Three-phase supply | later | Phase balancing (`phase-balancing`) |

## 5. Level ladder

Each level is tagged with topic IDs, so play counts towards topic progress.

| Tier | Introduces | Topics |
| --- | --- | --- |
| 1 | One circuit, lamps only, P = U·I, Ohm's law | `ohms-law`, `power-and-energy` |
| 2 | Long cable runs; choose the cross-section | `voltage-drop`, `conductor-resistance` |
| 3 | Turrets with inrush; MCB sizing | `overcurrent-protection`, `current-carrying-capacity` |
| 4 | Damaged cables, earth faults; RCD | `rcd-protection`, `shock-protection` |
| 5 | Dawn verification with instruments | `insulation-resistance`, `continuity-of-pe`, `loop-impedance`, `rcd-testing` |
| 6 | Three-phase supply, sub-boards, selectivity | `three-phase-systems`, `distribution-boards` |

## 6. Technical approach

- **Circuit simulation:** a pure-TS solver in `packages/shared` (radial networks
  first: source → board → circuits → loads), built on the existing calculation
  functions. Test-first, like the rest of the engine.
- **Rendering:** a canvas library (PixiJS or Phaser) in one React Router route,
  client-only. Menus, the prediction prompt and the results screen stay Mantine.
- **Touch:** snap grid; tap a component, tap a target to connect; large hit areas;
  night actions are single taps on highlighted devices. No drag precision needed.
- **i18n:** all texts via i18next keys, as everywhere else.
- **Persistence:** level results stored like practice attempts (topic, score,
  predictions right/wrong); the game state itself is client-side for the MVP.
- **Access:** login required, like practice and the simulator.

## 7. MVP and tasks

MVP = tiers 1–3, single-phase, five components (source, cable, MCB, lamp, turret),
one map, five nights, no dawn phase (it needs the simulator).

| ID | Task |
| --- | --- |
| PD1 | Radial circuit solver in `packages/shared` (currents, ΔU per load, trip decisions), test-first |
| PD2 | Level format (JSON: map, budget, components, waves, topic IDs) + zod schema + validator |
| PD3 | Game route with a canvas: grid, build mode, touch wiring |
| PD4 | Night loop: waves, live simulation, trip/reset actions |
| PD5 | Prediction prompt + results screen + storing results to topic progress |
| PD6 | Tiers 1–3 content (levels) |
| PD7 | Later: RCD and fault events (tier 4) |
| PD8 | Later: dawn verification using the simulator (tier 5); depends on the simulator |
| PD9 | Later: three-phase and selectivity (tier 6) |

Acceptance test (MVP, phone viewport): a student opens the game, wires a lamp and
a turret with touch only, answers the prediction, survives a night, and the result
appears in their topic progress.

## 8. Strengths and risks

**Strengths:** consequences make the formulas stick; one loop covers all four
skills; scales from Ohm's law to selectivity; reuses the engine, the reference
data and the simulator.

**Risks and mitigations**
- *Trial and error instead of calculation:* the prediction step before
  "power on" plus bonuses for correct predictions; the results screen shows the
  calculation behind each failure.
- *Teaching unsafe habits:* unsafe designs are always penalised (§3); values
  only from verified reference data.
- *Fiddly wiring on phones:* snap grid, tap-to-connect, no free drawing.
- *Scope creep / balancing effort:* MVP limited to tiers 1–3 and one map; new
  content is mainly level JSON, not code.

## 9. Open questions

| # | Question | Default until answered |
| - | --- | --- |
| Q28 | Theme: warehouse vs. zombies, or something less violent for some learners? | Warehouse vs. zombies |
| Q29 | Rendering library: PixiJS (renderer only) or Phaser (full game framework)? | Decide in PD3 with a small spike |
| Q30 | Does game play count towards mastery, or only towards "started/practising"? | Only correct predictions count as solved tasks |
