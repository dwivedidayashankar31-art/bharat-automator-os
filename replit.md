# Workspace

## Overview

Bharat-Automator OS — Unified Agentic Mesh for India's public/private sectors. pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Artifacts

### `artifacts/bharat-automator` (`@workspace/bharat-automator`)

React + Vite frontend for **Bharat-Automator OS** — The Unified Agentic Mesh command center.

Pages: Command Center dashboard, AI Assistant (chat with BharatOS AI), Architecture (Mermaid.js diagram), Agriculture Agent, Finance & IT Agent, Healthcare Agent (with GPS geolocation), Governance Agent, India Stack Layer (Bhashini live translation with 7 languages), Payments (Razorpay integration with DB storage), Live Analytics (Recharts dashboards with real DB data + auto-refresh), Invoice Generator (GST-compliant tax invoices with PDF download via jspdf), Admin Panel (real-time user data, payment records, activity log with sector breakdown).

Frontend packages: framer-motion, mermaid, react-syntax-highlighter, date-fns, @workspace/integrations-openai-ai-react, @workspace/replit-auth-web.

Auth: Uses `useAuth()` from `@workspace/replit-auth-web`. Login page redirects to OIDC provider. Sidebar shows user profile + logout when authenticated.

Serves at preview path `/`.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Auth: Replit OIDC via `openid-client` v6. Routes: `GET /api/auth/user`, `GET /api/login`, `GET /api/callback`, `GET /api/logout`, `POST /api/mobile-auth/token-exchange`, `POST /api/mobile-auth/logout`. Sessions stored in `sessionsTable`. Users stored in `usersTable`. `authMiddleware` patches `req.user` and `req.isAuthenticated()` on every request.
- Payments: Razorpay integration via `razorpay` SDK. Routes: `POST /api/payments/create-order`, `POST /api/payments/verify`, `GET /api/payments/config`. Secrets required: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
- Analytics: `GET /api/analytics/overview` — real-time system metrics, revenue charts, agent performance, sector distribution, hourly traffic.
- Invoices: `POST /api/invoices/generate` — GST-compliant invoice generation with automatic CGST/SGST/IGST calculation and amount-in-words (Indian numbering system with Lakh/Crore).
- Translation: `POST /api/indiastack/translate` — Dictionary-based multi-language translation (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada) with confidence score. Input validated and length-limited.
- GSTR-2B Invoices: `GET /api/indiastack/gstr2b-invoices` — Dynamic invoice data for GST ITC reconciliation.
- Activity Tracking: `POST /api/activity/track`, `GET /api/activity/feed`, `GET /api/activity/stats`, `GET /api/activity/users` — Real-time user activity tracking with sector breakdown, action counts, IP logging. Auto-middleware tracks all POST requests.
- Payment History: `GET /api/payments/history` — All payment records with stats (total, verified, revenue). Payments stored in DB on create-order and updated on verify.
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-openai-ai-server`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
