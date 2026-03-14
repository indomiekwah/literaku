# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app (Literaku)
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

## Packages

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native app — **Literaku**: a B2B voice-first accessible reading platform for visually impaired students (similar to Bookshare).

**Architecture**: Two user types with separate flows:
1. **Institution administrators** — upload book catalogs, manage accessible format conversion pipeline, assign books to students
2. **Students** — voice-activated reading with AI narration controls, voice commands like "Read [title]", "Summarize", "Pause"

**Design principles**:
- Voice-first, not sighted-first
- Large touch targets (48-78px buttons, 58px+ inputs)
- 18-28px bold text throughout
- High contrast colors (WCAG AAA)
- Screen reader accessible with `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on all interactive elements
- VoiceCommandBar on every screen with contextual hints
- AccessibilityInfo.announceForAccessibility on key screens (role select, student home, institution dashboard, reader)

**Screens**:
- `index.tsx` — Role selection ("Who are you?" — Institution or Student)
- `institution/login.tsx` — Admin email/password login
- `institution/dashboard.tsx` — Stats (books, converted, processing, students) + quick actions
- `institution/books.tsx` — Book catalog with conversion status badges (Ready, Processing, Pending, Error)
- `institution/upload.tsx` — Upload form with conversion pipeline info
- `institution/assign.tsx` — Expandable student rows with book assignment toggles
- `student/login.tsx` — Institution code + student ID login
- `student/home.tsx` — Voice prompt "What would you like to read?" + continue reading card
- `student/library.tsx` — Assigned books with play buttons
- `student/reader/[id].tsx` — Redesigned reader with: progress bar, rewind/forward 10s buttons flanking play/pause, separate page navigation row (Previous/Next), speed and voice selector chips, AI summarize button in header
- `student/guide.tsx` — Voice commands grouped by context (home, library, reader)

**Reader voice commands**: Play, Pause, Resume, Next page, Previous page, Rewind (10s back), Forward (10s ahead), Summarize, Change voice, Go back

**Theme**:
- Institution: Blue (#0D47A1)
- Student: Green (#2E7D32)
- High contrast text (#0A0A0A on white)

**Key files**:
- `constants/data.ts` — Types (CatalogBook, Student, Institution, ConversionStatus) + sample data + voice commands per context
- `constants/colors.ts` — High-contrast accessible color palette
- `components/VoiceCommandBar.tsx` — Shared voice command bar with mic button, listening status, contextual hints, help button
- `app/_layout.tsx` — Stack navigation (headerShown: false) with all 11 routes

**Navigation**: Stack-based, headerShown: false
**Data**: Sample data in constants/data.ts (no backend needed)
**Logged-in student**: Hardcoded as student "s1" (Andi Pratama) for library filtering

**Voice-First Accessibility Audit (completed)**:
- All 11 screens audited for voice-first compliance
- Every interactive `Pressable` and `TextInput` has `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint`
- All `accessibilityHint` values use "Double tap to..." phrasing for screen reader consistency
- Key screens (role select, student home, institution dashboard, reader) use `AccessibilityInfo.announceForAccessibility` on mount
- Progress bar in reader uses `accessibilityRole="progressbar"` with `accessibilityValue` for min/max/now
- VoiceCommandBar rotates through all hints every 4 seconds (not just first hint) with `accessibilityLiveRegion="polite"`
- Font sizes: minimum 18px throughout, primary headers 22-30px
- Touch targets: minimum 48px (header buttons), 56px+ (secondary), 72px+ (primary actions)
- Voice commands match button actions: "Rewind 10 seconds" and "Forward 10 seconds" in data.ts match reader button labels
- No competitor references (DAISY) remain in any user-facing text, code types, or documentation

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
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
