# Single image for the whole app: Fastify serves /api/* and the React Router
# SSR handler for every other route. The database is NOT part of this image.
FROM node:22-slim AS base
WORKDIR /app

# ---- dependencies (cached on lockfile changes only) -------------------------
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# The e2e workspace is in the lockfile, so its manifest must be present for
# `npm ci`; its dev-only dependencies never reach the runtime image.
COPY e2e/package.json e2e/
RUN npm ci

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm run build

# ---- production dependencies only ------------------------------------------
FROM deps AS prod-deps
RUN npm ci --omit=dev

# ---- runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Build output: shared library, API server, and the web client + server bundles.
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
# Bundled lesson drafts, loaded with `node dist/scripts/seed-content.js` (working directory apps/api).
COPY --from=build /app/apps/api/content ./apps/api/content
COPY --from=build /app/apps/web/build ./apps/web/build

USER node
EXPOSE 3000

WORKDIR /app/apps/api
# Migrations run on start, then the server boots.
CMD ["sh", "-c", "node dist/scripts/migrate.js && node dist/main.js"]
