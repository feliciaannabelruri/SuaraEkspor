# Docker image for the SuaraEkspor API (apps/api) — deployable on Render,
# Fly.io, Railway, or any platform that runs an arbitrary Dockerfile.
#
# apps/api runs via ts-node at runtime (not `tsc` + `node dist/`) because
# packages/database's `main` points straight at its raw TypeScript source
# (`src/index.ts`) — running the entry through ts-node lets that resolve
# correctly without extra build tooling. packages/shared and packages/ai-engine
# DO need a real build step first since their `main` points at `dist/`.
FROM node:20-slim AS base
WORKDIR /app

# Install all workspace dependencies first (better layer caching)
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ai-engine/package.json packages/ai-engine/package.json
RUN npm ci

# Copy source
COPY packages/database packages/database
COPY packages/shared packages/shared
COPY packages/ai-engine packages/ai-engine
COPY apps/api apps/api

# Prisma Client generation only needs the schema to be well-formed, not a live
# DB connection — the placeholder values below are build-time only and get
# overridden by the real platform env vars/secrets at container runtime.
#
# Uses `npm run db:generate` (not a bare `npx prisma generate`) so the Prisma
# CLI version resolved is the one packages/database actually depends on —
# the root package.json pins a different (incompatible) major Prisma version.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm run db:generate

# Build the packages whose package.json points at a compiled dist/ output
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/ai-engine

# Default port if the platform doesn't inject its own PORT env var at runtime
# (Render, Railway, etc. set PORT themselves — it overrides this automatically).
ENV PORT=4000
EXPOSE 4000

CMD ["npx", "ts-node", "--transpile-only", "apps/api/src/index.ts"]
