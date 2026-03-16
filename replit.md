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

Expo React Native app — **Literaku**: a voice-first accessible reading platform for visually impaired users.

**Architecture**: Student-only reading platform with the following screens:
1. **Splash** — Literaku logo, auto-redirects to login after 2s
2. **Login (OAuth-First)** — Google/Microsoft OAuth as hero buttons (large, colored, one-tap). Email/password hidden behind collapsible disclosure toggle. Zero-friction for blind users.
3. **Home** — 5 large navigation buttons (Penjelajah, Riwayat, Koleksi, Redeem Token, Panduan) + settings gear
4. **Penjelajah (Explorer)** — Browse & search books with prices in Rupiah, tap to view details
5. **Book Detail** — Book cover, title, author, genre, price, synopsis, Preview & Buy buttons (mock purchase)
6. **Koleksi (Collection)** — Owned books with reading progress indicators, search, tap to read
7. **Riwayat (History)** — Redeem Token section at top, then horizontal scroll sections (Baru Dibaca, Bookmark, Dari Institusi)
8. **Reader** — Audio controls (rewind/play/forward), page navigation, AI summarize, text display with configurable size
9. **Panduan (Guide)** — AI voice command guide with examples, Azure AI branding
10. **Settings** — Voice, speed, language, text size, interaction mode, logout

**Design principles**:
- Voice-first, not sighted-first
- Large touch targets (48-78px buttons, 58px+ inputs)
- 18-28px bold text throughout
- High contrast colors (WCAG AAA)
- Screen reader accessible with `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on all interactive elements
- SwipeHintBar on every screen with contextual natural language examples (tap to cycle)
- SwipeVoiceWrapper on every screen for swipe-left voice overlay activation
- AccessibilityInfo.announceForAccessibility on all screens (mount, errors, actions)

**Voice System (Azure AI)**:
- **Activation**: Swipe left anywhere on screen → `SwipeVoiceOverlay` (full-screen pulsing mic, dark overlay)
- **Mic button**: Persistent 56px green (#2E7D32) circular button in SwipeHintBar, always tappable (even in voice-only freeze mode). Pulses (scale 1→1.15→1) when voice-only mode is active. Last in TalkBack focus order with `accessibilityLabel="Activate voice command"`.
- **VoiceActivationContext**: Shared context (`contexts/VoiceActivation.tsx`) bridges SwipeHintBar mic button ↔ SwipeVoiceWrapper overlay. Provider wrapped at root `_layout.tsx`.
- **Dismiss**: Swipe right or tap anywhere to dismiss overlay
- **SwipeHintBar**: Persistent bottom bar with mode toggle, hint text, optional help button, and mic button. Always outside freeze zone.
- **SwipeVoiceWrapper**: Wraps every screen, uses `react-native-gesture-handler` Gesture.Fling + VoiceActivationContext
- **Natural language**: Users speak freely in Indonesian or English; Azure AI detects language and intent
- **Voice hints**: `voiceHints` in data.ts — per-screen context with `{ example, intent }` pairs
- **TalkBack guide**: Panduan screen has dedicated "Pengguna TalkBack / VoiceOver" section with 3-step instructions for screen reader users

**Settings (student/settings.tsx)**:
- Voice selector (4 voices: Sari/Budi id-ID, Emma/James en-US)
- Speed (0.5x–2x, tap to cycle)
- Language (Indonesian/English toggle + auto-detect switch)
- Text size (16-28pt, +/- controls with preview)
- Voice-Only Mode toggle
- Logout
- All managed via `ReadingPreferencesContext`

**Voice-Only Mode (Freeze UI)**:
- Default mode is `"voice"` — navigation buttons on post-login screens are frozen (pointer-events: none, opacity 0.5)
- Users navigate via voice commands (swipe-left activation)
- Toggle in SwipeHintBar (lock/unlock, always interactive) switches modes
- Login/splash screens are exempt from freezing
- Settings has dedicated "Interaction Mode" toggle
- State: `interactionMode: "voice" | "touch"` in ReadingPreferencesContext
- Green banner "Mode suara — navigasi dengan perintah suara" when active

**Book Data & Purchase Flow**:
- Sample books (12): The Silent Patient, Penance, Confessions, The Shorts Caller, Laskar Pelangi, Bumi Manusia, Ronggeng Dukuh Paruk, Cantik Itu Luka, Negeri 5 Menara, Supernova, Ayat-Ayat Cinta, Perahu Kertas
- Prices in Rupiah (Rp68,000–Rp95,000), formatted with `formatRupiah()` helper
- Book types include: id, title, author, genre, category, price, synopsis, coverColor, owned, content[]
- Mock purchase: "Buy Book" shows Alert confirming purchase, marks as owned
- Preview: Opens reader with first chapter
- Redeem Token: Full NavButton on Home (orange #E65100) + prominent section at top of Riwayat screen (UI only, no backend)

**ReadingPreferencesContext** (`contexts/ReadingPreferences.tsx`):
- Exports: `selectedVoice`, `speed`, `textSize`, `language`, `autoDetectLanguage`, `interactionMode`, `isVoiceOnly`
- Wrapped at root in `_layout.tsx`

**Key files**:
- `constants/data.ts` — Types (Book, ReadingProgress, BookmarkEntry, NaturalVoiceHint) + sample data + voiceHints + formatRupiah
- `constants/colors.ts` — High-contrast accessible color palette
- `contexts/ReadingPreferences.tsx` — Voice, speed, textSize, language context
- `contexts/VoiceActivation.tsx` — Shared context for mic button ↔ voice overlay bridge
- `components/SwipeVoiceOverlay.tsx` — Full-screen voice listening overlay
- `components/SwipeHintBar.tsx` — Bottom hint bar with voice mode toggle + persistent mic button
- `components/SwipeVoiceWrapper.tsx` — Gesture wrapper for swipe activation (uses VoiceActivationContext)
- `app/_layout.tsx` — Stack navigation with 10 routes

**Navigation**: Stack-based, headerShown: false, slide_from_right animation
**Data**: Sample data in constants/data.ts (no backend needed)
**Theme**: Blue primary (#1976D2), Green student (#2E7D32), high contrast text

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
