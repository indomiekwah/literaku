import { router } from "expo-router";
import { AccessibilityInfo } from "react-native";
import { speakText, analyzeCLU, isCLUAvailable } from "@/services/speech";

const CONFIRM_SPEED = 1;

export type VoiceIntent =
  | "nav_home"
  | "nav_explorer"
  | "nav_collection"
  | "nav_history"
  | "nav_guide"
  | "nav_settings"
  | "nav_join_institution"
  | "nav_back"
  | "nav_login"
  | "reader_next"
  | "reader_prev"
  | "reader_play"
  | "reader_pause"
  | "reader_stop"
  | "search_book"
  | "open_book"
  | "speed_change"
  | "unknown";

export interface MatchResult {
  intent: VoiceIntent;
  param?: string;
  confidence?: number;
  source?: "clu" | "regex";
}

const VALID_INTENTS = new Set<string>([
  "nav_home", "nav_explorer", "nav_collection", "nav_history",
  "nav_guide", "nav_settings", "nav_join_institution", "nav_back",
  "nav_login", "reader_next", "reader_prev", "reader_play",
  "reader_pause", "reader_stop", "search_book", "open_book", "speed_change",
]);

const PATTERNS: { pattern: RegExp; intent: VoiceIntent; paramGroup?: number }[] = [
  { pattern: /\b(go\s*(?:back\s*)?(?:to\s*)?home|beranda|ke\s*beranda|pulang|kembali\s*ke\s*(?:beranda|home))\b/i, intent: "nav_home" },
  { pattern: /\b(open\s*(?:the\s*)?explorer|explorer|penjelajah|buka\s*penjelajah|jelajah|explore)\b/i, intent: "nav_explorer" },
  { pattern: /\b((?:show\s*(?:my\s*)?)?(?:the\s*)?collection|koleksi|buka\s*koleksi|my\s*(?:books?|library)|perpustakaan|library)\b/i, intent: "nav_collection" },
  { pattern: /\b((?:open\s*)?(?:the\s*)?history|riwayat|buka\s*riwayat|(?:reading\s*)?history)\b/i, intent: "nav_history" },
  { pattern: /\b((?:open\s*)?(?:the\s*)?guide|panduan|buka\s*panduan|help|bantuan|voice\s*guide)\b/i, intent: "nav_guide" },
  { pattern: /\b((?:open\s*)?(?:the\s*)?settings|pengaturan|buka\s*pengaturan|setelan)\b/i, intent: "nav_settings" },
  { pattern: /\b(join\s*(?:my\s*)?institution|gabung\s*institusi|institusi|institution|sekolah\s*saya|my\s*school)\b/i, intent: "nav_join_institution" },
  { pattern: /\b(go\s*back|back|kembali|mundur|balik)\b/i, intent: "nav_back" },
  { pattern: /\b(sign\s*(?:in|out)|log\s*(?:in|out)|masuk|keluar|login|logout)\b/i, intent: "nav_login" },

  { pattern: /\b(next\s*page|halaman\s*(?:selanjutnya|berikut|lanjut)|lanjut|forward)\b/i, intent: "reader_next" },
  { pattern: /\b(prev(?:ious)?\s*page|halaman\s*(?:sebelumnya|sebelum)|sebelum(?:nya)?)\b/i, intent: "reader_prev" },
  { pattern: /\b(play|putar|mulai|start|continue|lanjutkan|resume)\b/i, intent: "reader_play" },
  { pattern: /\b(pause|jeda|berhenti|stop|hentikan)\b/i, intent: "reader_pause" },

  { pattern: /\bsearch\s+(.+)/i, intent: "search_book", paramGroup: 1 },
  { pattern: /\bcari\s+(.+)/i, intent: "search_book", paramGroup: 1 },
  { pattern: /\b(?:open|read|baca|buka)\s+(?:book\s+)?(.+)/i, intent: "open_book", paramGroup: 1 },

  { pattern: /\bspeed\s*(\d)/i, intent: "speed_change", paramGroup: 1 },
  { pattern: /\bkecepatan\s*(\d)/i, intent: "speed_change", paramGroup: 1 },
];

function matchRegex(text: string): MatchResult {
  const cleaned = text.replace(/[.,!?'"]/g, "").trim();

  for (const { pattern, intent, paramGroup } of PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      return {
        intent,
        param: paramGroup !== undefined ? match[paramGroup]?.trim() : undefined,
        confidence: 1,
        source: "regex",
      };
    }
  }

  return { intent: "unknown", confidence: 0, source: "regex" };
}

let cluAvailable: boolean | null = null;
let cluCheckTime = 0;
const CLU_CHECK_INTERVAL = 5 * 60 * 1000;
const CLU_CONFIDENCE_THRESHOLD = 0.5;

async function checkCLUAvailability(): Promise<boolean> {
  const now = Date.now();
  if (cluAvailable !== null && now - cluCheckTime < CLU_CHECK_INTERVAL) {
    return cluAvailable;
  }

  try {
    cluAvailable = await isCLUAvailable();
    cluCheckTime = now;
    console.log(`CLU availability: ${cluAvailable}`);
  } catch {
    cluAvailable = false;
    cluCheckTime = now;
  }
  return cluAvailable;
}

export async function matchVoiceIntent(
  text: string,
  language: string = "en"
): Promise<MatchResult> {
  const regexResult = matchRegex(text);

  const useCLU = await checkCLUAvailability();

  if (!useCLU) {
    return regexResult;
  }

  try {
    const cluResult = await analyzeCLU(text, language);

    if (
      cluResult.intent !== "unknown" &&
      cluResult.confidence >= CLU_CONFIDENCE_THRESHOLD &&
      VALID_INTENTS.has(cluResult.intent)
    ) {
      let param: string | undefined;

      const searchEntity = cluResult.entities.find(
        (e) => e.category === "search_query"
      );
      const bookEntity = cluResult.entities.find(
        (e) => e.category === "book_title"
      );
      const speedEntity = cluResult.entities.find(
        (e) => e.category === "speed_value"
      );

      if (cluResult.intent === "search_book" && searchEntity) {
        param = searchEntity.text;
      } else if (cluResult.intent === "open_book" && bookEntity) {
        param = bookEntity.text;
      } else if (cluResult.intent === "speed_change" && speedEntity) {
        param = speedEntity.text;
      }

      if (cluResult.intent === "search_book" && !param) {
        const words = text.replace(/^(cari|search|carikan|find)\s*/i, "").trim();
        if (words.length > 0) param = words;
      }
      if (cluResult.intent === "open_book" && !param) {
        const words = text
          .replace(/^(baca|buka|open|read)\s*(buku\s*)?/i, "")
          .trim();
        if (words.length > 0) param = words;
      }

      console.log(
        `Voice: CLU matched "${text}" → ${cluResult.intent} (${(cluResult.confidence * 100).toFixed(0)}%) param=${param || "none"}`
      );

      return {
        intent: cluResult.intent as VoiceIntent,
        param,
        confidence: cluResult.confidence,
        source: "clu",
      };
    }

    if (regexResult.intent !== "unknown") {
      console.log(
        `Voice: CLU low confidence (${(cluResult.confidence * 100).toFixed(0)}%), using regex fallback → ${regexResult.intent}`
      );
      return regexResult;
    }

    if (
      cluResult.intent !== "unknown" &&
      cluResult.confidence >= 0.3 &&
      VALID_INTENTS.has(cluResult.intent)
    ) {
      console.log(
        `Voice: CLU soft match "${text}" → ${cluResult.intent} (${(cluResult.confidence * 100).toFixed(0)}%)`
      );
      return {
        intent: cluResult.intent as VoiceIntent,
        confidence: cluResult.confidence,
        source: "clu",
      };
    }

    return regexResult;
  } catch (err) {
    console.warn("CLU failed, using regex fallback:", err);
    return regexResult;
  }
}

export function matchVoiceIntentSync(text: string): MatchResult {
  return matchRegex(text);
}

export function executeGlobalNavigation(intent: VoiceIntent, voice: string): boolean {
  const confirm = (msg: string) => {
    AccessibilityInfo.announceForAccessibility(msg);
    speakText(msg, voice, CONFIRM_SPEED).catch(() => {});
  };

  switch (intent) {
    case "nav_home":
      confirm("Going back to the home page");
      router.replace("/student/home");
      return true;
    case "nav_explorer":
      confirm("Opening the explorer page");
      router.push("/student/penjelajah");
      return true;
    case "nav_collection":
      confirm("Opening your book collection");
      router.push("/student/library");
      return true;
    case "nav_history":
      confirm("Opening the history page");
      router.push("/student/riwayat");
      return true;
    case "nav_guide":
      confirm("Opening the voice guide");
      router.push("/student/guide");
      return true;
    case "nav_settings":
      confirm("Opening the settings page");
      router.push("/student/settings");
      return true;
    case "nav_join_institution":
      confirm("Opening the institution page");
      router.push("/student/riwayat");
      return true;
    case "nav_back":
      confirm("Going back to the previous page");
      router.back();
      return true;
    default:
      return false;
  }
}
