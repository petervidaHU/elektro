# Elektro

Gyakorlóalkalmazás a villanyszerelő képzéshez - theory, calculation practice and
a measurement simulator for adult learners. UI language: Hungarian; code and
commits: English.

See `CLAUDE.md` for the product and engineering rules, and `apps/web/CLAUDE.md` /
`apps/api/CLAUDE.md` for the per-app conventions.

## Getting started (development)

The app runs as a container managed by the **composer** repo (`~/composer`),
next to the shared `postgres-server` and the nginx reverse proxy, with the same
hot reload as the other local apps: the source is bind-mounted, so edits in
this folder reload instantly at **https://elektro.fromthe.test:8443**.

```bash
cp .env.example .env     # set BETTER_AUTH_SECRET (the container reads this file too)

# one-time: add `127.0.0.1 elektro.fromthe.test` to /etc/hosts (and the Windows
# hosts file), see composer/LOCAL_DNS_SETUP.md. Then, from ~/composer:
./scripts/build-local-images.sh     # pick "elektro" (builds Dockerfile.dev)
./scripts/setup-local-mkcert.sh     # certificate includes elektro.fromthe.test
./scripts/restart-local.sh          # or: docker compose ... up -d elektro nginx
```

The container runs `npm install`, `npm run db:migrate` and `npm run dev`
(shared `tsc --watch`, API `tsx watch`, Vite HMR). First admin:

```bash
docker exec -it elektro npm run db:seed
```

Logs: `docker logs -f elektro`. Run tests/lint in the container or on the host
(`npm install` on the host works too).

### Without the container

`npm run dev` on the host still works: point `DATABASE_URL` in `.env` at the
shared Postgres published on `localhost:5433` (database `elektro`, user
`elektro_user`; created by the composer init script) and open
http://localhost:5173.

## Commands

| command | what it does |
| --- | --- |
| `npm run dev` | web + API in watch mode |
| `npm run build` | build shared, API and web |
| `npm start` | run the production server (one process, `PORT`) |
| `npm run test` | all workspaces |
| `npm run test:e2e` | Playwright milestone acceptance tests on a phone viewport, against the running app (default: the dev container; override with `E2E_BASE_URL`). First time: `npx -w @elektro/e2e playwright install chromium`. The global setup signs in as the seeded admin (`E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`, else `SEED_ADMIN_*` from `.env`) to create an e2e teacher and a temporary lesson |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` | generate a Drizzle migration from schema changes |
| `npm run db:migrate` / `npm run db:seed` | apply migrations / create the first admin |
| `npm run content:check` | validate the lesson files in `apps/api/content/lessons/` (paths, front matter, lesson format) and list the claims to verify. Authoring brief and file layout: `docs/THEORY_TOC.md` |
| `npm run db:seed:content` | load the lesson files as `ai_draft` for teacher review; drafts nobody reviewed yet are updated from their files, lessons in review or approved are never touched. In the production container (working directory `apps/api`): `node dist/scripts/seed-content.js` |

## Production

One multi-stage `Dockerfile` builds a single image: Fastify serves `/api/*`, the
client build as static files, and the React Router SSR handler for everything
else - one port, one container, behind the existing nginx reverse proxy. The
PostgreSQL server is separate and is only reached through `DATABASE_URL`.
