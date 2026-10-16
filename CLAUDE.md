# Electro app (villanyszerelő training)

Web app that helps **adult learners** in the Hungarian electrician training (villanyszerelő képzés) learn theory, practise calculations and practise electrical measurements in a simulator. UI language for v1 is **Hungarian**; the code, comments, commit messages and identifiers are in **English**.

## Development plan: read this before starting work

**[`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) is the single source of truth for *what* we build, *in which order*, and *which business decisions were made*.** It contains:
- the syllabus mapped to the official curriculum (§1);
- the calculator catalogue, the reference-data process and the practice engine (§2);
- pages and user journeys (§3);
- the milestones (§4);
- open questions (§5).

How the two documents divide the work:
- **The CLAUDE.md files** hold the durable rules and conventions: *how* we build.
- **The plan** holds scope, design and decisions. Don't restate them in CLAUDE.md; link to the plan section instead.

Working with the plan:
- **Before a feature:** find its task ID in the plan (e.g. `K6`, `U3`, `S1`) and its milestone, and follow the design there. Put the task ID in the branch name or PR description.
- **When a decision changes:** if the user decides something new or different, or answers an open question, update the plan's *Decisions* table (and §5) in the same PR. If the change affects a rule here, update this file too. Never leave the two contradicting each other.
- **If something isn't in the plan:** ask, don't invent scope. Out-of-scope items (below) stay out unless the plan or the user says otherwise.
- **Curriculum sources:** the official documents behind the syllabus are listed in the plan ("Source documents"). The PDFs are kept locally in `docs/` and are deliberately **not in git** (`docs/*.pdf` is ignored).

## Monorepo layout

```
apps/web         React Router v7 (framework mode, SSR) + Mantine UI   -> see apps/web/CLAUDE.md
apps/api         Node.js + Fastify API, better-auth, Drizzle          -> see apps/api/CLAUDE.md
packages/shared  Types, zod schemas, topic IDs, calculation engine (pure TS, no I/O)
```

- Package manager: **npm workspaces**. Language: **TypeScript (strict)** everywhere.
- **One Node process in production:** Fastify serves the API under `/api/*` and mounts the React Router SSR request handler for every other route. One port, one Docker container.
- Database: **PostgreSQL**, accessed only through **Drizzle** (in `apps/api`). The database is **not** part of the app container; it is an existing, separate PostgreSQL container, reached via `DATABASE_URL`.

## Commands

<!-- Keep these in sync with package.json scripts once they exist. -->
```
npm install
npm run dev            # web + api in watch mode (needs DATABASE_URL)
npm run build
npm run test           # all workspaces
npm run test:e2e       # Playwright milestone acceptance tests (needs the running app; E2E_BASE_URL)
npm run lint
npm run typecheck
npm run db:generate    # drizzle-kit: generate migration from schema changes
npm run db:migrate     # apply migrations
npm run db:seed        # creates the first admin user
npm run db:seed:content # loads bundled lesson drafts (apps/api/content) as ai_draft; never overwrites
```
Local development runs as a container (`Dockerfile.dev`, service `elektro`) in the composer repo's local stack at `https://elektro.fromthe.test:8443`, using the shared `postgres-server` (database `elektro`). See README.md. Compose/nginx config lives in the composer repo, not here.

## Product rules (apply to all code)

- **Roles:** `student`, `teacher`, `admin`. Every API route checks the role on the server. The frontend only hides what a role can't use; it is never the security boundary.
- **Auth v1:** email + password only, via better-auth. Anyone can self-register; every new account is a `student`. **No outgoing emails** in v1: admins create teacher accounts, promote users, and reset passwords.
- **Guest access:** approved lessons and calculators are public. Practice, the simulator, history and progress require a login. Teachers can see every student's progress and history.
- **v1 modules:** theory lessons, calculators with step-checked practice tasks, measurement simulator. Calculation practice belongs in this app.
- **Out of scope for v1:** quizzes/exams (they live in a separate app, no integration yet), schools/courses/classes, email, payments/monetization. Don't add them unless asked.
- **Content approval:** content starts as AI-generated drafts. Each content part has a status: `ai_draft` -> `in_review` -> `approved`, or `changes_requested`. Approvals record approver + timestamp. Editing an approved part creates a new version; the old approved version stays live until the new one is approved. Approval is per **locale and version**. Whether students see unapproved drafts is an **admin setting**, not hard-coded.
- **i18n from day one:** no hard-coded user-facing text anywhere (frontend uses i18next keys; API returns error *codes*, not messages). URLs carry the locale (`/hu/...`). Content is stored as language-neutral rows + per-locale translation rows. Only `hu` exists in v1, but never assume a single language in schema or code.
- **Touch-first:** web first, but every learning interaction must work on a phone **with touch only, without a keyboard**. See apps/web/CLAUDE.md for the concrete rules.
- **Topic map:** lessons, calculators, practice tasks and simulator scenarios are all tagged with topic IDs from one shared list (`packages/shared`). Progress is tracked per topic. The list of topics, their modules and their curriculum references come from the plan's syllabus (§1.2). Add or change topics there first.

## Electrical correctness

This app teaches safety-critical material. Wrong numbers can teach dangerous habits.
- Never invent formulas, limit values, standard numbers or table values. If a value isn't in the code, the repo's reference data, or given by the user, ask instead of guessing.
- All formulas and limits live in `packages/shared` (calculation engine + reference data), each with unit tests and a source comment (e.g. `// Source: MSZ HD 60364-6, table ...` or the textbook page).
- Values from standard tables (current-carrying capacities, limits, trip values) follow the **reference-data process** in the plan (§2.3):
  - they are stored with their source and a `verified` status;
  - the engine receives them as explicit inputs;
  - students only see verified values.

  Values Claude pre-fills are always stored as `unverified` until a teacher verifies them.
- Use SI units internally; format for display with the locale (Hungarian decimal comma: `2,5 mm²`).
- Hungarian domain terms to keep consistent: feszültségesés (voltage drop), keresztmetszet (cross-section), kismegszakító (MCB), áram-védőkapcsoló / ÁVK (RCD), érintésvédelem (shock protection), szigetelési ellenállás (insulation resistance), hurokimpedancia (loop impedance), védővezető / PE (protective conductor), földelési ellenállás (earth resistance), jegyzőkönyv (measurement report).

## Working conventions

- Small, focused changes; one feature per branch/PR. Conventional commit messages (`feat:`, `fix:`, `chore:` ...).
- Shared types and zod schemas live in `packages/shared` and are used by both apps; don't duplicate them.
- Write tests for: calculation engine (always), authorization rules, content approval state transitions.
- **Test-driven where it pays off:**
  - **Test-first:** pure logic in `packages/shared` (engine, practice checker, tolerance, misconception detectors, mastery, state machines). Use textbook worked examples as the first tests.
  - **Test-first:** API authorization and state transitions (Fastify `inject`, one test per role).
  - **UI:** no component TDD. Each milestone instead gets one **Playwright acceptance test**, written first from the milestone's line in `docs/ROADMAP.md` and run on a phone viewport.

## Definition of done

- **Task** (one PR, task ID from the plan):
  1. Tests were written first for the logic it adds.
  2. `npm run lint && npm run typecheck && npm test` pass.
  3. New user-facing text has i18n keys.
  4. Learning interactions work with touch only.
  5. The plan is updated if scope or a decision changed.
- **Milestone:** its acceptance test in `docs/ROADMAP.md` passes (`npm run test:e2e`, in `e2e/tests/`), and the milestone is ticked there.
- Config only from environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`/public base URL, `PORT`). Never commit secrets; keep `.env.example` up to date.
- Before finishing a task: `npm run lint && npm run typecheck && npm test` pass.

## Deployment

- Single multi-stage `Dockerfile` at the repo root producing one image (Node LTS, slim). Runs migrations on start, then starts Fastify.
- Runs on the owner's Linux VPS behind an existing nginx reverse proxy; the app must work behind a proxy (trust proxy headers, configurable base URL, secure cookies over HTTPS).
- The server's existing PostgreSQL conventions will be documented later; until then only rely on `DATABASE_URL`.

## Roadmap

The order of work, status checklist and acceptance tests are in [`docs/ROADMAP.md`](docs/ROADMAP.md). The detail behind each task is in the plan (§4, *Delivery order*).
- **First milestone:** voltage drop end to end: theory -> calculator -> practice -> teacher approval, deployed.
- **Later phases:** measurement simulator -> AI content generation -> pilot.
