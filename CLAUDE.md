# Electro app (villanyszerelő training)

Web app that helps **adult learners** in the Hungarian electrician training (villanyszerelő képzés) learn theory, practise calculations and practise electrical measurements in a simulator. UI language for v1 is **Hungarian**; the code, comments, commit messages and identifiers are in **English**.

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
npm run lint
npm run typecheck
npm run db:generate    # drizzle-kit: generate migration from schema changes
npm run db:migrate     # apply migrations
npm run db:seed        # creates the first admin user
```
Local development runs as a container (`Dockerfile.dev`, service `elektro`) in the composer repo's local stack at `https://elektro.fromthe.test:8443`, using the shared `postgres-server` (database `elektro`). See README.md. Compose/nginx config lives in the composer repo, not here.

## Product rules (apply to all code)

- **Roles:** `student`, `teacher`, `admin`. Every API route checks the role on the server. The frontend only hides what a role can't use; it is never the security boundary.
- **Auth v1:** email + password only, via better-auth. **No outgoing emails** in v1: admins create teacher accounts, promote users, and reset passwords.
- **v1 modules:** theory lessons, calculators with step-checked practice tasks, measurement simulator. Calculation practice belongs in this app.
- **Out of scope for v1:** quizzes/exams (they live in a separate app, no integration yet), schools/courses/classes, email, payments/monetization. Don't add them unless asked.
- **Content approval:** content starts as AI-generated drafts. Each content part has a status: `ai_draft` -> `in_review` -> `approved`, or `changes_requested`. Approvals record approver + timestamp. Editing an approved part creates a new version; the old approved version stays live until the new one is approved. Approval is per **locale and version**. Whether students see unapproved drafts is an **admin setting**, not hard-coded.
- **i18n from day one:** no hard-coded user-facing text anywhere (frontend uses i18next keys; API returns error *codes*, not messages). URLs carry the locale (`/hu/...`). Content is stored as language-neutral rows + per-locale translation rows. Only `hu` exists in v1, but never assume a single language in schema or code.
- **Touch-first:** web first, but every learning interaction must work on a phone **with touch only, without a keyboard**. See apps/web/CLAUDE.md for the concrete rules.
- **Topic map:** lessons, calculators, practice tasks and simulator scenarios are all tagged with topic IDs from one shared list (`packages/shared`). Progress is tracked per topic.

## Electrical correctness

This app teaches safety-critical material. Wrong numbers can teach dangerous habits.
- Never invent formulas, limit values, standard numbers or table values. If a value isn't in the code, the repo's reference data, or given by the user, ask instead of guessing.
- All formulas and limits live in `packages/shared` (calculation engine + reference data), each with unit tests and a source comment (e.g. `// Source: MSZ HD 60364-6, table ...` or the textbook page).
- Use SI units internally; format for display with the locale (Hungarian decimal comma: `2,5 mm²`).
- Hungarian domain terms to keep consistent: feszültségesés (voltage drop), keresztmetszet (cross-section), kismegszakító (MCB), áram-védőkapcsoló / ÁVK (RCD), érintésvédelem (shock protection), szigetelési ellenállás (insulation resistance), hurokimpedancia (loop impedance), védővezető / PE (protective conductor), földelési ellenállás (earth resistance), jegyzőkönyv (measurement report).

## Working conventions

- Small, focused changes; one feature per branch/PR. Conventional commit messages (`feat:`, `fix:`, `chore:` ...).
- Shared types and zod schemas live in `packages/shared` and are used by both apps; don't duplicate them.
- Write tests for: calculation engine (always), authorization rules, content approval state transitions.
- Config only from environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`/public base URL, `PORT`). Never commit secrets; keep `.env.example` up to date.
- Before finishing a task: `npm run lint && npm run typecheck && npm test` pass.

## Deployment

- Single multi-stage `Dockerfile` at the repo root producing one image (Node LTS, slim). Runs migrations on start, then starts Fastify.
- Runs on the owner's Linux VPS behind an existing nginx reverse proxy; the app must work behind a proxy (trust proxy headers, configurable base URL, secure cookies over HTTPS).
- The server's existing PostgreSQL conventions will be documented later; until then only rely on `DATABASE_URL`.

## Roadmap (current focus)

First milestone: **one topic end to end** (proposed: voltage drop) through theory -> calculator -> practice -> teacher approval, deployed.
Phases: 1 foundation (auth, roles, i18n, Docker) -> 2 content + approval -> 3 calculators + practice -> 4 measurement simulator -> 5 AI content generation -> 6 pilot.
