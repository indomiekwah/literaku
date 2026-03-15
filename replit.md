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
2. **Students** — voice-activated reading with AI narration controls, swipe-left voice activation, natural language commands (Azure AI)

**Design principles**:
- Voice-first, not sighted-first
- Large touch targets (48-78px buttons, 58px+ inputs)
- 18-28px bold text throughout
- High contrast colors (WCAG AAA)
- Screen reader accessible with `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on all interactive elements
- SwipeHintBar on every screen with contextual natural language examples (tap to cycle, no auto-rotation)
- SwipeVoiceWrapper on every screen for swipe-left → voice overlay activation
- AccessibilityInfo.announceForAccessibility on all screens (mount, errors, form feedback, toggle results)

**Voice System (Azure AI)**:
- **Activation**: Swipe left anywhere on screen → `SwipeVoiceOverlay` (full-screen pulsing mic, dark overlay)
- **Dismiss**: Swipe right or tap anywhere to dismiss overlay
- **SwipeHintBar**: Persistent bottom bar on every screen showing "Swipe kiri untuk perintah suara" + one natural language example. Tap cycles through examples. No auto-rotating live region.
- **SwipeVoiceWrapper**: Wraps every screen, uses `react-native-gesture-handler` Gesture.Fling (direction 2=left, 1=right)
- **Natural language**: Users speak freely in Indonesian or English; Azure AI detects language and intent
- **Voice hints**: `voiceHints` in data.ts — `Record<string, NaturalVoiceHint[]>` with `{ example: string; intent: string }` per screen context

**Settings (student/settings.tsx)**:
- Voice selector (4 voices: Sari/Budi id-ID, Emma/James en-US)
- Speed (0.5x–2x, tap to cycle)
- Language (Indonesian/English toggle + auto-detect switch)
- Text size (16-28pt, +/- controls with preview)
- Logout
- All managed via `ReadingPreferencesContext`

**Voice-Only Mode (Freeze UI)**:
- Default mode is `"voice"` — all navigation buttons on post-login screens are frozen (pointer-events: none, opacity 0.5)
- Users navigate purely via voice commands (swipe-left activation)
- Toggle button in SwipeHintBar (lock/unlock icon, 48px, always interactive) switches between voice-only and touch mode
- Login screens (index.tsx, student/login.tsx, institution/login.tsx) are exempt from freezing
- Settings screen has a dedicated "Interaction Mode" section with Voice-Only Mode toggle
- State managed via `interactionMode: "voice" | "touch"` in ReadingPreferencesContext
- `isVoiceOnly` computed boolean exported from context
- When voice-only: green banner "Mode suara — navigasi dengan perintah suara" shown above hint bar
- Freeze implementation: `<View pointerEvents={isVoiceOnly ? 'none' : 'auto'} style={[styles.freezeZone, isVoiceOnly && styles.frozen]}>` wraps all interactive content except SwipeHintBar

**ReadingPreferencesContext** (`contexts/ReadingPreferences.tsx`):
- Exports: `selectedVoice`, `speed` (SpeedValue), `textSize` (number 16-28), `language` ("id"|"en"), `autoDetectLanguage`, `interactionMode` ("voice"|"touch"), `isVoiceOnly`
- Wrapped at root in `_layout.tsx`
- Used by reader (speed, textSize), settings screen, and all screens (interactionMode/isVoiceOnly for freeze)

**Screens (12 total)**:
- `index.tsx` — Role selection ("Who are you?" — Institution or Student)
- `institution/login.tsx` — Admin email/password login
- `institution/dashboard.tsx` — Stats (books, converted, processing, students) + quick actions
- `institution/books.tsx` — Book catalog with conversion status badges (Ready, Processing, Pending, Error)
- `institution/upload.tsx` — Upload form with conversion pipeline info
- `institution/assign.tsx` — Expandable student rows with book assignment toggles
- `student/login.tsx` — Institution code + student ID login
- `student/home.tsx` — Voice prompt "What would you like to read?" + continue reading card + settings gear (replaces logout)
- `student/library.tsx` — Assigned books with play buttons
- `student/reader/[id].tsx` — Reader with progress bar, rewind/forward 10s, play/pause, page nav, reads speed/textSize from context
- `student/guide.tsx` — AI-powered voice guide with swipe-left illustration, natural language examples grouped by intent, Azure AI branding, bilingual content
- `student/settings.tsx` — Consolidated settings (voice, speed, language, display, account)

**Blind UX Audit (completed)**:
- All 12 screens have `AccessibilityInfo.announceForAccessibility` on mount
- Error announcements on form submission (login, upload screens)
- Stat cards wrapped as single focusable units with `accessible` + `accessibilityRole="text"`
- Input groups use `accessible` prop for logical grouping
- Assignment toggles announce result ("assigned to" / "unassigned from")
- All `accessibilityHint` values use "Double tap to..." phrasing
- Progress bar uses `accessibilityRole="progressbar"` with `accessibilityValue`
- Font sizes: minimum 18px throughout, primary headers 22-30px
- Touch targets: minimum 48px (header buttons), 56px+ (secondary), 72px+ (primary actions)

**Theme**:
- Institution: Blue (#0D47A1)
- Student: Green (#2E7D32)
- High contrast text (#0A0A0A on white)

**Key files**:
- `constants/data.ts` — Types (CatalogBook, Student, Institution, NaturalVoiceHint, ConversionStatus) + sample data + voiceHints per screen
- `constants/colors.ts` — High-contrast accessible color palette
- `contexts/ReadingPreferences.tsx` — Voice, speed, textSize, language context + VOICE_OPTIONS + SPEED_OPTIONS
- `components/SwipeVoiceOverlay.tsx` — Full-screen voice listening overlay (pulsing mic animation)
- `components/SwipeHintBar.tsx` — Bottom hint bar with tap-to-cycle examples
- `components/SwipeVoiceWrapper.tsx` — Gesture wrapper for swipe-left/right voice activation
- `app/_layout.tsx` — Stack navigation (headerShown: false) with all 12 routes, ReadingPreferencesProvider

**Navigation**: Stack-based, headerShown: false
**Data**: Sample data in constants/data.ts (no backend needed)
**Logged-in student**: Hardcoded as student "s1" (Andi Pratama) for library filtering

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
