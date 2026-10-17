# apps/api - backend

Node.js + **Fastify**, **better-auth** for sessions, **Drizzle** for PostgreSQL.
In production this process also serves the frontend: the API is mounted under
`/api/*` and the React Router SSR handler answers everything else.

**What to build lives in [`docs/DEVELOPMENT_PLAN.md`](../../docs/DEVELOPMENT_PLAN.md)**
(the single source of truth; see the root `CLAUDE.md`). For backend work, the
relevant sections are:
- §2.6, data model changes: practice sessions and attempts, lesson reads, topic
  progress, reference tables, problem reports.
- §2.3, the reference-data process: versioned tables with a source and an
  `unverified` → `verified` status. Only teachers verify, and students only get
  verified data.
- §2.5, practice checking: the server regenerates the task from
  `templateId + templateVersion + seed` and re-checks every step. The client's
  verdict is never trusted.
- §2.7, the task-text tables that are prepared for review.
- §3.3, access levels per page. Each must be enforced by the matching API route.

Schema changes should follow §2.6. If they need to differ, update the plan in the
same PR.

## Layout

```
src/app.ts                 buildApp(): plugins, error handler, /api routes
src/main.ts                production entry: API + static client build + SSR
src/dev.ts                 development entry: API only (Vite serves the web app)
src/env.ts                 zod-validated environment configuration
src/db/index.ts            pg pool + Drizzle instance
src/db/schema/             auth.ts (better-auth tables), content.ts, app.ts
src/lib/auth.ts            better-auth setup
src/lib/http-error.ts      coded HTTP errors + zod body parsing
src/lib/react-router.ts    mounts the SSR handler as the not-found handler
src/lib/settings.ts        admin settings with their defaults
src/plugins/auth.ts        session resolution + requireUser / requireRole
src/routes/                health, topics, calc, calculators (registry), content, admin, auth,
                           learning (dashboard, history), monitoring (teacher), reports, review (queue)
src/scripts/               migrate.ts, seed.ts
drizzle/                   generated migrations (never edited by hand; data backfills
                           and triggers go in `drizzle-kit generate --custom` files)
content/lessons/           lesson drafts as files (docs/THEORY_TOC.md); content:check, db:seed:content
```

## Rules

- **Authorization is server-side, always.** Every route calls
  `app.requireUser(request)` or `app.requireRole(request, "teacher" | "admin")`.
  The role comes from the session, never from the request body. Role ranking
  lives in `@elektro/shared` (`hasAtLeastRole`).
- **Errors are codes, not messages.** Throw `HttpError` with an `ErrorCode` from
  `@elektro/shared`; the frontend translates it. Never return prose.
- **Validate every input** with the shared zod schemas via `parseBody`.
- **Content approval goes through the shared state machine.**
  `applyContentAction(status, action, role)` decides transitions; the route only
  persists the result. Editing an approved translation creates a new version
  instead of mutating it.
- **Every review action is documented** (plan §2.6, Q19). In the same
  transaction as the status change: `snapshotReviewer` freezes the reviewer
  (teacher+ only), `approvalFields` writes `approved_by` + the name/email/role
  snapshot (with `approved_at = now()`), and `reviewEventFields` adds a row to
  `content_review_events`. Never update the snapshot, and never update or delete
  log rows (a trigger rejects it). User FKs on audit data are `ON DELETE SET
  NULL`, never `CASCADE`. Routes the UI uses return deleted reviewers through
  `redactDeletedReviewer` (no name/email); only admin routes return the full
  snapshot. New approvable entities reuse all of this.
- **Admin saves publish directly** (plan Q22) through the same `applyReview`
  helper as the review route, so they leave the same approval record.
- **Archived lessons** (`archived_at`, plan Q23) are excluded from every
  student-facing query and from progress; only admins can read them. Archiving,
  restoring or moving a lesson recomputes that topic's cached progress.
- **Student visibility is a setting**, not a constant: `allowUnapprovedDrafts()`.
- **Database access only through Drizzle**, and only from this app. Change
  `src/db/schema/*`, then `npm run db:generate` and commit the migration.
- **Config only from the environment** (`src/env.ts`). Behind the nginx proxy,
  `TRUST_PROXY=true` and an `https://` `BETTER_AUTH_URL` (which turns on secure
  cookies).
- **No outgoing e-mail in v1.** Account creation, role changes and password
  resets are admin routes.

## Commands

```
npm run dev          API in watch mode (tsx)
npm run db:generate  generate a migration from schema changes
npm run db:migrate   apply migrations (also runs on container start)
npm run db:seed      create the first admin from SEED_ADMIN_*
```
