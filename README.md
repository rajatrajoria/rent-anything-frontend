# Rent Anything — Frontend

Web frontend for [Rent Anything](https://github.com/rajatrajoria/rent-anything), a peer-to-peer rental marketplace. Built as a monorepo so a future mobile app (`apps/mobile`) can share types and an API client with the web app.

## Structure

```
apps/
  web/            Next.js App Router app
packages/
  types/          Shared TS types mirroring the backend's DTOs
  api-client/     Typed fetch client for the Spring Boot API
  ui/             Tailwind + shadcn/ui primitives, design tokens
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- The backend running locally: clone [rent-anything](https://github.com/rajatrajoria/rent-anything), run `docker-compose up -d` (Postgres + MinIO), then `./gradlew bootRun` (port 8080). The backend needs a CORS config allowing `http://localhost:3000` — see that repo's `CorsConfig`.

## Getting started

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

The web app runs at http://localhost:3000.

## Scripts

- `pnpm dev` — run all apps in dev mode
- `pnpm build` — build all apps/packages
- `pnpm lint` — lint all apps/packages
- `pnpm typecheck` — typecheck all apps/packages
