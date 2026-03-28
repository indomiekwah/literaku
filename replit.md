# Overview

This project is a pnpm workspace monorepo using TypeScript, focused on building accessible, voice-first applications. Its primary goal is to create inclusive digital experiences, particularly for visually impaired users, by leveraging voice technology and intuitive UI/UX design. The project aims to deliver a scalable platform with a strong emphasis on user experience and robust technical foundations, serving both B2C subscribers and B2B educational institutions.

# User Preferences

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

# System Architecture

The project is structured as a pnpm monorepo with TypeScript, enabling efficient type-checking and project referencing across distinct application and library packages.

**Mobile Application (Literaku - Expo React Native)**:
- **Purpose**: A voice-first accessible reading platform for visually impaired students, navigating from Splash → Login (OAuth-first) → Home → various screens + Settings + Reader.
- **UI/UX Principles**: Voice-first design with primary interaction via voice commands. Features large touch targets (48-78px buttons, 58px+ inputs), 18-28px bold text, and WCAG AAA compliant high-contrast colors. Full screen reader accessibility is implemented using `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint`. A `SwipeHintBar` with a persistent green mic button (48px, right-positioned, last in TalkBack focus order) serves as the primary voice activation, complemented by `SwipeVoiceWrapper` for swipe-left gestures.
- **Voice System**: Integrates Azure Cognitive Services for Speech-to-Text (STT) and Text-to-Speech (TTS), with `api-server` acting as a secure proxy. `VoiceActivationContext` manages voice activation, recording, STT, intent matching, and TTS feedback. `voiceRouter.ts` handles intent matching via Azure CLU (Conversational Language Understanding) with regex fallback, and `executeGlobalNavigation()` for global navigation intents. Voice-only mode freezes UI navigation, relying solely on voice commands. Context-aware voice commands provide feedback when used out of context. The Reader features section-based content with word-by-word highlighting and auto-scroll during TTS narration, and utilizes pre-computed summaries for instant access.
- **Business Model**: B2C subscription ($7/month) with free chapter previews. B2B model where institutions pay per page for digitization, allowing students free access via institution codes or invites. Revenue sharing with publishers is planned.
- **Localization**: Supports `en`/`id` translations, with language-aware STT.
- **Accessibility**: All screens include mount TTS announcements via `useTTSAnnounce`, contextual `SwipeHintBar` and `SwipeVoiceWrapper` for voice activation, and proper accessibility roles.
- **State Management**: `ReadingPreferencesContext` for user settings (voice, speed, language, text size, interaction mode, subscription plan) and `VoiceActivationContext` for voice interaction.

**Dashboard Web App (React + Vite)**:
- **Purpose**: Admin and institution operator web dashboard for managing the Literaku platform.
- **Location**: `artifacts/admin/`
- **User Roles**: Admin (super admin) and Operator (institution-level). Role-based routing and sidebar navigation.
- **Admin Features**: Dashboard overview with stats, institution management (CRUD), operator account management, book catalog, global reading analytics with charts.
- **Operator Features**: Institution dashboard, student directory with registration, book assignment, per-student reading progress reports, digitization request submission.
- **Auth**: JWT-based login with email/password. Auth state stored in localStorage with AuthProvider context. Protected routes redirect unauthenticated users.
- **Tech Stack**: React 19, Vite 7, Tailwind CSS 4, shadcn/ui components, wouter routing, TanStack Query, Recharts for charts, date-fns.
- **Mock API**: Currently uses `src/lib/mock-api.ts` with simulated data since backend endpoints for auth/institutions/students/etc. don't exist yet. Will be replaced with real API client hooks when backend is ready.
- **Demo Accounts**: admin@literaku.com/admin123 (admin role), operator@literaku.com/operator123 (operator role).

**API Server (Express 5)**:
- **Purpose**: Backend services, primarily proxying Azure Speech API requests and handling book-related operations.
- **Speech Routes**: Provides endpoints for Azure token proxy (`/api/speech/token`), STT (`/api/speech/stt`, with ffmpeg conversion for various audio formats to WAV), TTS (`/api/speech/tts`), and CLU intent analysis (`/api/speech/clu`).
- **AI Summarize Routes**: Includes endpoints for Azure OpenAI text summarization (`/api/ai/summarize`).
- **Books Routes**: Manages book uploads (PDFs and metadata to Azure Blob Storage), listing, retrieving, extracting text from pages, and deleting books.
- **Data Validation**: Uses Zod schemas generated from OpenAPI spec.
- **Deployment**: Designed for Replit (dev) and Azure App Service (prod), requiring ffmpeg.

**Infrastructure (Azure)**:
- Core services include Azure App Service for API and Admin Web, Azure Speech Service for STT/TTS (with critical audio caching for cost reduction), Azure PostgreSQL for user/book data, Azure Blob Storage for books and metadata, Azure CDN for content delivery, and Azure OpenAI Service for summarization. Planned integration with Azure Key Vault and Communication Services.

**Database Layer (`lib/db`)**:
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL.
- **Schema**: Tables: `institutions`, `users` (role enum: super_admin/operator/student), `book_catalog`, `book_assignments`, `reading_progress`, `digitization_requests`.
- **Migrations**: Handled via Drizzle Kit (`pnpm --filter @workspace/db run push`).
- **Seed**: `pnpm --filter @workspace/scripts run seed-admin` creates default super_admin (admin@literaku.id).

**Dashboard API Routes (`artifacts/api-server`)**:
- **Auth**: `POST /api/auth/login` (JWT), `GET /api/auth/me`.
- **Admin** (super_admin only): CRUD institutions, create/list operators, dashboard stats.
  - `GET /api/admin/stats`, `GET/POST /api/admin/institutions`, `GET/PUT/DELETE /api/admin/institutions/:id`, `GET/POST /api/admin/operators`.
- **Operator** (operator only): Register students, assign books, view progress.
  - `GET/POST /api/operator/students`, `POST /api/operator/students/bulk` (CSV), `POST /api/operator/assignments`, `POST /api/operator/assignments/bulk`, `DELETE /api/operator/assignments/:id`, `GET /api/operator/progress`.
- **Student**: `GET /api/student/books` (assigned books from institution).
- **Books**: `GET/POST /api/books`, `GET/PUT/DELETE /api/books/:id`.
- **Digitization**: `GET/POST /api/digitization-requests`, `PUT /api/digitization-requests/:id`.
- **Auth**: JWT-based with role-based middleware (bcrypt for password hashing).

**API Specification & Codegen (`lib/api-spec`)**:
- OpenAPI 3.1 specification (`openapi.yaml`) drives code generation via Orval, producing React Query hooks, fetch clients, and Zod schemas for API validation.

**Web Dashboard (`artifacts/admin`)**:
- **Name**: Literaku Dashboard (React + Vite web app)
- **Preview Path**: `/admin/`
- **Port**: 23744
- **Purpose**: 3-tier management dashboard for Admin → Operator → Student management.
- **Auth**: JWT-based login (email + password). Token stored in localStorage, sent as Bearer header. Mock API with demo accounts: admin@literaku.com/admin123 (admin), operator@literaku.com/operator123 (operator).
- **Admin Pages**: Dashboard Overview (stats), Institutions CRUD with detail view, Operators management, Book Catalog CRUD, Global Analytics (Recharts).
- **Operator Pages**: Institution Dashboard, Student Directory with registration, Book Assignment, Per-student Reading Progress Reports, Digitization Request Submission.
- **Navigation**: Sidebar with role-based menu items. Admin sees admin routes, Operator sees operator routes.
- **Key Files**: `src/App.tsx` (routing), `src/lib/mock-api.ts` (mock data layer), `src/hooks/use-auth.tsx` (AuthProvider + useAuth), `src/hooks/use-api.ts` (TanStack Query hooks), `src/components/layout/dashboard-layout.tsx`.
- **Dependencies**: framer-motion, recharts, react-hook-form, @hookform/resolvers, date-fns, zod.

**Monorepo Structure**:
- `artifacts/`: Deployable applications (e.g., `api-server`, `mobile`, `admin`).
- `lib/`: Shared libraries (e.g., `api-spec`, `api-client-react`, `api-zod`, `db`).
- `scripts/`: Utility scripts.

## Key Mobile Files

- `contexts/ReadingPreferences.tsx` - User settings context (voice, speed, language, text size, subscription).
- `contexts/VoiceActivation.tsx` - Voice activation state, mic recording, STT, intent matching.
- `services/voiceRouter.ts` - Intent matching patterns (EN+ID) and global navigation execution.
- `services/speech.ts` - AudioRecorder, speechToText, speechToTextFromUri, speakText (queued), speakTextWithProgress, stopTTSPlayback. TTS uses a sequential queue to prevent audio overlap; stopTTSPlayback clears queue and rejects pending promises.
- `hooks/useTTSAnnounce.ts` - Auto-announce on mount via TTS (300ms delay, cleanup stops TTS on unfocus).
- `hooks/useTranslation.ts` - Translation hook wrapping getTranslations().
- `constants/translations.ts` - Full EN/ID translation strings.
- `contexts/BooksContext.tsx` - Books data context (merges API books + local sampleBooks, 5-min auto-refresh, content cache for API PDFs).
- `services/books.ts` - API client for fetching books list and page content from api-server.
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
- **Validation**: Zod, drizzle-zod
- **API Codegen**: Orval
- **Mobile Framework**: Expo, React Native
- **Speech Services**: Azure Cognitive Services (Speech-to-Text, Text-to-Speech)
- **Language Understanding**: Azure CLU (Conversational Language Understanding)
- **AI Summarization**: Azure OpenAI Service (GPT-4.1-mini)
- **Authentication**: Google/Microsoft OAuth
- **Build Tools**: esbuild, tsx, vite
- **State Management (Mobile)**: React Context API
- **HTTP Client (Mobile)**: React Query
- **Audio (Mobile)**: expo-av
- **File Upload**: multer
- **PDF Processing**: pdfjs-dist