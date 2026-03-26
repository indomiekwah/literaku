# Workspace

## Overview

This project is a pnpm workspace monorepo utilizing TypeScript, designed for building accessible and voice-first applications. The core vision is to create inclusive digital experiences, particularly for visually impaired users, through innovative use of voice technology and thoughtful UI/UX design. The project aims to deliver a high-quality, scalable platform with a focus on user experience and robust technical foundations.

## User Preferences

- I prefer simple language.
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the `artifacts/mobile` directory unless explicitly requested.
- Do not make changes to the `lib/api-spec` directory unless explicitly requested.
- I like functional programming paradigms where applicable.
- Ensure all interactive elements in the mobile application are screen reader accessible.
- Prioritize high-contrast colors and large touch targets for mobile UI/UX.
- All communications should be clear and concise, avoiding unnecessary jargon.

## System Architecture

The project is structured as a pnpm monorepo, organizing applications and shared libraries into distinct packages. TypeScript is used across the entire monorepo, with `composite: true` enabled for efficient type-checking and project referencing.

**Mobile Application (`artifacts/mobile`)**:
- **Name**: Literaku (Expo React Native app)
- **Purpose**: Voice-first accessible reading platform for visually impaired students.
- **Student Flow**: Splash → Login (OAuth-first) → Home → screens + Settings + Reader.
- **UI/UX Principles**:
    - Voice-first design: Navigation and interaction primarily via voice commands.
    - Large touch targets (48-78px buttons, 58px+ inputs) and 18-28px bold text.
    - High contrast colors (WCAG AAA compliant).
    - Full screen reader accessibility (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`).
    - Contextual `SwipeHintBar` and `SwipeVoiceWrapper` for voice activation via swipe-left gesture.
    - Web insets: `isWeb ? 67 : insets.top`, `isWeb ? 34 : insets.bottom`.
- **Voice System**:
    - Integrates Azure Cognitive Services for Speech-to-Text (STT) and Text-to-Speech (TTS).
    - `api-server` acts as a secure proxy for Azure Speech API tokens and requests.
    - `VoiceActivationContext` manages swipe-left voice activation, mic recording, STT, intent matching, and TTS feedback.
    - `voiceRouter.ts` provides `matchVoiceIntent()` (async, CLU-first with regex fallback) and `executeGlobalNavigation()` for all screens.
    - Azure CLU (Conversational Language Understanding) integration: `POST /api/speech/clu` analyzes text → returns intent + entities + confidence. Requires Language Service in supported region (East US, West US 2, etc.). Falls back to regex when CLU unavailable.
    - `SwipeVoiceOverlay` for visual feedback during voice listening.
    - "Voice-Only Mode" freezes UI navigation, relying solely on voice commands.
    - Azure voice map: v1=id-ID-GadisNeural, v2=id-ID-ArdiNeural, v3=en-US-EmmaMultilingualNeural, v4=en-US-AndrewMultilingualNeural.
    - STT flow: `AudioRecorder.start()` → mic → `stop()` returns Blob(web/webm) or URI(native/m4a on Android, wav on iOS) → `speechToText/speechToTextFromUri` with correct MIME types → `POST /api/speech/stt` → server ffmpeg converts to WAV PCM → Azure STT.
    - TTS flow: `speakText()` → `POST /api/speech/tts` → MP3 bytes → web: HTMLAudioElement; native: expo-av base64 data URI.
    - Voice intents: nav_home, nav_explorer, nav_collection, nav_history, nav_guide, nav_settings, nav_join_institution, nav_back, nav_login, nav_subscription, nav_logout, reader_next, reader_prev, reader_play, reader_pause, reader_summarize, reader_read_aloud, search_book, open_book, open_preview, read_full, speed_change, speed_increase, speed_decrease.
    - Context-aware voice commands: READER_ONLY_INTENTS (reader_next/prev/play/pause/stop/summarize/read_aloud) and BOOK_DETAIL_ONLY_INTENTS (open_preview/read_full) give feedback when used on wrong page.
    - Callback contract: page-level `onTranscription` callbacks return `true` if handled (prevents fallthrough to global nav), `false` otherwise.
    - Global voice handling: `executeGlobalNavigation()` handles nav_*, open_book (fuzzy book search → book detail), nav_login (→ home).
    - Per-page voice callbacks: login (nav_login + google/microsoft detection), home (open_book), explorer (search_book, open_book), collection (open_book, search_book), book detail (open_preview, read_full, reader_play), reader (all reader_* intents + speed + read_aloud), settings (voice list, language list, nav_subscription, nav_logout), subscription (nav_subscription + premium/free toggle).
    - Speed control: speed_change (specific level 1-5), speed_increase (step up), speed_decrease (step down). Levels: 0.5x, 0.75x, 1x, 1.25x, 1.5x.
    - CLU vs regex priority: when both match different intents and CLU confidence < 80%, regex wins for specificity.
    - Fuzzy book search: `findBookByTitle()` strips punctuation for matching. Search boxes also strip punctuation.
- **Business Model**:
    - B2C: $7/month subscription, access to full library. Ch.1 free preview. Payment via Midtrans (ID) / Stripe (intl).
    - B2B: Institution pays per page for digitization ($0.06 Starter, $0.05 Medium, $0.04 Enterprise). Admin assigns books to students for FREE via web dashboard (no subscription needed for B2B students). Students join institution via code (e.g., "SMAN5-JKT") or operator invite.
    - Revenue share with publishers from B2C subscriptions.
- **Localization**: Full `en`/`id` translation system (`constants/translations.ts`). Language-aware STT (id-ID vs en-US).
- **Settings Screen**: `student/settings.tsx` with voice selection, speed control (default 1x), language toggle, voice-only mode toggle, subscription status card, and logout. Voice callbacks: "voice" lists voice options via TTS, "language" lists language options via TTS, "subscribe" navigates to subscription, "log out" signs out.
- **Subscription Screen**: `student/subscription.tsx` with Free/Premium plan cards. Voice command "subscribe premium" toggles plan (debug mode). Shows current plan banner. Navigates from Settings or Home voice commands.
- **Login Screen**: `student/login.tsx` with Google and Microsoft OAuth buttons only (no email/password form, no signup link). Voice command detects "google"/"microsoft" to route.
- **State Management**: `ReadingPreferencesContext` for user settings (voice, speed, language, text size, interaction mode, subscriptionPlan: "free"|"premium") and `VoiceActivationContext` for voice interaction state.
- **Screen List**: Splash, Login, Home, Explorer (penjelajah), Collection (library), History (riwayat), Book Detail (book/[id]), Reader (reader/[id]), Guide, Settings, Subscription.
- **Guide Screen**: `student/guide.tsx` with sections: About Literaku, How Voice Commands Work, Voice Mode vs Touch Mode, Context-Aware Commands, Navigation Commands, Reading Commands, Subscription & Institution, TalkBack/VoiceOver Users, Voice Language, Azure AI badge.
- **Accessibility Audit**: All screens have mount TTS announcements, `useTTSAnnounce` hook, `SwipeHintBar` with contextual voice hints, `SwipeVoiceWrapper` for swipe-left activation, freeze zone for voice-only mode, proper a11y roles/labels/hints.
- **Colors**: primary blue `#1976D2`, student green `#2E7D32`, orange `#E65100`.

**API Server (`artifacts/api-server`)**:
- **Framework**: Express 5.
- **Purpose**: Provides backend services, including proxying Azure Speech API requests.
- **Speech Routes**:
    - `GET /api/speech/token` - Azure token proxy.
    - `POST /api/speech/stt` - STT with smart middleware (multer for multipart, express.raw for audio/*). Auto-converts non-WAV audio (webm, m4a, ogg, etc.) to 16kHz mono 16-bit PCM WAV using ffmpeg before sending to Azure.
    - `POST /api/speech/tts` - TTS proxy to Azure with SSML.
    - `POST /api/speech/clu` - Azure CLU intent analysis (text → intent + entities + confidence).
    - `GET /api/speech/clu/status` - Check if CLU deployment is available.
- **CLU Setup Script**: `scripts/setup-clu.ts` - Creates CLU project, imports 150+ bilingual utterances (16 intents, 3 entities), trains & deploys model. Run with `npx tsx scripts/setup-clu.ts`.
- **AI Summarize Routes**:
    - `POST /api/ai/summarize` - Azure OpenAI text summarization (bilingual EN/ID system prompts, GPT-4.1-mini, 30s timeout, 10K char limit).
    - `GET /api/ai/status` - Check Azure OpenAI configuration status.
- **Data Validation**: Uses Zod schemas generated from OpenAPI spec for request and response validation.
- **Build**: Uses esbuild for production bundling.
- **Deployment**: Replit (dev) → Azure App Service B1/B2 (prod). ffmpeg required for audio conversion.

**Infrastructure (Azure)**:
- Azure App Service B1/B2: API + Admin Web (~$13-26/mo)
- Azure Speech Service: STT + TTS with audio caching (~$80-150/mo with cache)
- Azure PostgreSQL Burstable B1ms: User data, books, assignments (~$15/mo)
- Azure Blob Storage: Books, covers, audio cache (~$5/mo)
- Azure CDN: Jakarta node for Indonesia (~$2/mo)
- Azure OpenAI Service: GPT-4.1-mini for text summarization (~$5-15/mo depending on usage)
- Azure Key Vault: Secrets management, planned (~$1/mo)
- Azure Communication Services: Email notifications (~$3/mo)
- Total estimated: $119-202/mo at 100 B2C users + 1-2 B2B institutions
- Audio caching is CRITICAL: reduces TTS cost by 80%+, without it TTS alone costs $500-700/mo

**Database Layer (`lib/db`)**:
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL.
- **Schema**: Defines database schemas and exports a Drizzle client instance.
- **Migrations**: Handled via Drizzle Kit.

**API Specification & Codegen (`lib/api-spec`)**:
- **Specification**: OpenAPI 3.1 (`openapi.yaml`).
- **Codegen Tool**: Orval.
- **Outputs**:
    - `lib/api-client-react`: Generated React Query hooks and fetch client.
    - `lib/api-zod`: Generated Zod schemas for API validation.

**Monorepo Structure**:
- `artifacts/`: Deployable applications (e.g., `api-server`, `mobile`).
- `lib/`: Shared libraries (e.g., `api-spec`, `api-client-react`, `api-zod`, `db`).
- `scripts/`: Utility scripts.

## Key Mobile Files

- `contexts/ReadingPreferences.tsx` - User settings context (voice, speed, language, text size, subscription).
- `contexts/VoiceActivation.tsx` - Voice activation state, mic recording, STT, intent matching.
- `services/voiceRouter.ts` - Intent matching patterns (EN+ID) and global navigation execution.
- `services/speech.ts` - AudioRecorder, speechToText, speechToTextFromUri, speakText, stopTTSPlayback.
- `hooks/useTTSAnnounce.ts` - Auto-announce on mount via TTS.
- `hooks/useTranslation.ts` - Translation hook wrapping getTranslations().
- `constants/translations.ts` - Full EN/ID translation strings.
- `constants/data.ts` - Sample books, reading progress, voice hints per screen.
- `components/SwipeHintBar.tsx` - Bottom bar showing voice command hints.
- `components/SwipeVoiceWrapper.tsx` - Wrapper enabling swipe-left voice activation.
- `components/SwipeVoiceOverlay.tsx` - Full-screen overlay during voice listening.

## External Dependencies

- **Node.js**: Version 24
- **Package Manager**: pnpm
- **TypeScript**: Version 5.9
- **API Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API Codegen**: Orval
- **Mobile Framework**: Expo, React Native
- **Speech Services**: Azure Cognitive Services (Speech-to-Text, Text-to-Speech)
- **Language Understanding**: Azure CLU (Conversational Language Understanding) for voice intent recognition
- **Authentication**: Google/Microsoft OAuth
- **Build Tools**: esbuild, tsx, vite (for various packages)
- **State Management (Mobile)**: React Context API
- **HTTP Client (Mobile)**: React Query (generated by Orval)
- **Audio (Mobile)**: expo-av for native TTS playback
- **File Upload**: multer for multipart audio on API server
