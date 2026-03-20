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
    - `voiceRouter.ts` provides `matchVoiceIntent()` (regex-based, EN+ID patterns) and `executeGlobalNavigation()` for all screens.
    - `SwipeVoiceOverlay` for visual feedback during voice listening.
    - "Voice-Only Mode" freezes UI navigation, relying solely on voice commands.
    - Azure voice map: v1=id-ID-GadisNeural, v2=id-ID-ArdiNeural, v3=en-US-EmmaMultilingualNeural, v4=en-US-AndrewMultilingualNeural.
    - STT flow: `AudioRecorder.start()` → mic → `stop()` returns Blob(web/webm) or URI(native/m4a on Android, wav on iOS) → `speechToText/speechToTextFromUri` with correct MIME types → `POST /api/speech/stt` → server ffmpeg converts to WAV PCM → Azure STT.
    - TTS flow: `speakText()` → `POST /api/speech/tts` → MP3 bytes → web: HTMLAudioElement; native: expo-av base64 data URI.
    - Voice intents: nav_home, nav_explorer, nav_collection, nav_history, nav_guide, nav_settings, nav_redeem, nav_back, reader_next, reader_prev, reader_play, reader_pause, search_book, open_book, speed_change.
    - Reader-specific voice commands: play/pause/next/prev page handled via `onTranscription` callback.
    - Explorer/Collection voice commands: search_book and open_book handled via screen-specific callbacks.
    - ANNOUNCE_SPEED = 0.85 for mount/feedback announcements.
- **Subscription Model**: Chapter 1 free preview; full reading requires subscription. B2B token redemption on History screen.
- **Localization**: Full `en`/`id` translation system (`constants/translations.ts`). Language-aware STT (id-ID vs en-US).
- **Settings Screen**: `student/settings.tsx` with voice selection, speed control, language toggle, text size, voice-only mode, subscription status, and logout.
- **State Management**: `ReadingPreferencesContext` for user settings (voice, speed, language, text size, interaction mode, subscription status) and `VoiceActivationContext` for voice interaction state.
- **Screen List**: Splash, Login, Signup, Home, Explorer (penjelajah), Collection (library), History (riwayat), Book Detail (book/[id]), Reader (reader/[id]), Guide, Settings.
- **Accessibility Audit**: All screens have mount TTS announcements, `useTTSAnnounce` hook, `SwipeHintBar` with contextual voice hints, `SwipeVoiceWrapper` for swipe-left activation, freeze zone for voice-only mode, proper a11y roles/labels/hints.
- **Colors**: primary blue `#1976D2`, student green `#2E7D32`, orange `#E65100`.

**API Server (`artifacts/api-server`)**:
- **Framework**: Express 5.
- **Purpose**: Provides backend services, including proxying Azure Speech API requests.
- **Speech Routes**:
    - `GET /api/speech/token` - Azure token proxy.
    - `POST /api/speech/stt` - STT with smart middleware (multer for multipart, express.raw for audio/*). Auto-converts non-WAV audio (webm, m4a, ogg, etc.) to 16kHz mono 16-bit PCM WAV using ffmpeg before sending to Azure.
    - `POST /api/speech/tts` - TTS proxy to Azure with SSML.
- **Data Validation**: Uses Zod schemas generated from OpenAPI spec for request and response validation.
- **Build**: Uses esbuild for production bundling.

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
- **Authentication**: Google/Microsoft OAuth
- **Build Tools**: esbuild, tsx, vite (for various packages)
- **State Management (Mobile)**: React Context API
- **HTTP Client (Mobile)**: React Query (generated by Orval)
- **Audio (Mobile)**: expo-av for native TTS playback
- **File Upload**: multer for multipart audio on API server
