import { router } from "expo-router";
import { AccessibilityInfo } from "react-native";
import { speakText, analyzeCLU, isCLUAvailable } from "@/services/speech";
import { sampleBooks } from "@/constants/data";

const CONFIRM_SPEED = 1;

export type VoiceIntent =
  | "nav_home"
  | "nav_explorer"
  | "nav_collection"
  | "nav_history"
  | "nav_guide"
  | "nav_settings"
  | "nav_join_institution"
  | "join_institution_code"
  | "browse_category"
  | "nav_back"
  | "nav_login"
  | "nav_subscription"
  | "nav_logout"
  | "reader_next"
  | "reader_prev"
  | "reader_play"
  | "reader_pause"
  | "reader_stop"
  | "reader_summarize"
  | "reader_read_aloud"
  | "search_book"
  | "open_book"
  | "open_preview"
  | "read_full"
  | "speed_change"
  | "speed_increase"
  | "speed_decrease"
  | "repeat_commands"
  | "unknown";

export interface MatchResult {
  intent: VoiceIntent;
  param?: string;
  confidence?: number;
  source?: "clu" | "regex";
}

const VALID_INTENTS = new Set<string>([
  "nav_home", "nav_explorer", "nav_collection", "nav_history",
  "nav_guide", "nav_settings", "nav_join_institution", "join_institution_code",
  "browse_category", "nav_back", "nav_login", "nav_subscription", "nav_logout",
  "reader_next", "reader_prev", "reader_play",
  "reader_pause", "reader_stop", "reader_summarize", "reader_read_aloud",
  "search_book", "open_book", "open_preview", "read_full",
  "speed_change", "speed_increase", "speed_decrease",
  "repeat_commands",
]);

export const READER_ONLY_INTENTS = new Set<VoiceIntent>([
  "reader_next", "reader_prev", "reader_play", "reader_pause",
  "reader_stop", "reader_summarize", "reader_read_aloud",
]);

export const BOOK_DETAIL_ONLY_INTENTS = new Set<VoiceIntent>([
  "open_preview", "read_full",
]);

const PATTERNS: { pattern: RegExp; intent: VoiceIntent; paramGroup?: number }[] = [
  { pattern: /\b(go\s*(?:back\s*)?(?:to\s*)?home|ke\s*beranda|pulang|kembali\s*ke\s*(?:beranda|home))\b/i, intent: "nav_home" },
  { pattern: /\b((?:open|go\s*to|buka|show)\s*(?:the\s*)?(?:explorer|penjelajah|jelajah)|buka\s*penjelajah)\b/i, intent: "nav_explorer" },
  { pattern: /\b((?:open|go\s*to|buka|show)\s*(?:the\s*)?(?:my\s*)?(?:collection|koleksi|library|perpustakaan)|show\s*my\s*(?:books?|library)|buka\s*koleksi)\b/i, intent: "nav_collection" },
  { pattern: /\b((?:open|go\s*to|buka|show)\s*(?:the\s*)?(?:reading\s*)?(?:history|riwayat)|buka\s*riwayat)\b/i, intent: "nav_history" },
  { pattern: /\b((?:open|go\s*to|buka)\s*(?:the\s*)?(?:guide|panduan|voice\s*guide)|buka\s*panduan)\b/i, intent: "nav_guide" },
  { pattern: /\b((?:open|go\s*to|buka)\s*(?:the\s*)?(?:settings|pengaturan|setelan)|buka\s*pengaturan)\b/i, intent: "nav_settings" },
  { pattern: /\b(join\s*(?:my\s*)?institution|gabung\s*institusi|(?:open|buka)\s*(?:the\s*)?(?:institution|institusi)|sekolah\s*saya|my\s*school)\b/i, intent: "nav_join_institution" },
  { pattern: /\b(go\s*back|kembali|mundur|balik)\b/i, intent: "nav_back" },
  { pattern: /\b(sign\s*in|log\s*in|masuk|login)\b/i, intent: "nav_login" },
  { pattern: /\b((?:open|go\s*to|buka)\s*(?:the\s*)?subscri(?:ption|be)|berlangganan|langganan)\b/i, intent: "nav_subscription" },
  { pattern: /\b(log\s*out|sign\s*out|keluar|logout)\b/i, intent: "nav_logout" },

  { pattern: /\b(next\s*page|halaman\s*(?:selanjutnya|berikut|lanjut)|lanjut|forward)\b/i, intent: "reader_next" },
  { pattern: /\b(prev(?:ious)?\s*page|halaman\s*(?:sebelumnya|sebelum)|sebelum(?:nya)?)\b/i, intent: "reader_prev" },
  { pattern: /\b(play|putar|mulai|start|continue|lanjutkan|resume)\b/i, intent: "reader_play" },
  { pattern: /\b(pause|jeda|berhenti|stop|hentikan)\b/i, intent: "reader_pause" },
  { pattern: /\b(summarize|summary|ringkas(?:an|kan)?|rangkum(?:an|kan)?|inti(?:sari)?|kesimpulan)\b/i, intent: "reader_summarize" },
  { pattern: /\b(read\s*(?:it\s*)?aloud|read\s*(?:the\s*)?summary\s*(?:aloud)?|bacakan|baca\s*(?:keras|nyaring)|baca(?:kan)?\s*ringkasan)\b/i, intent: "reader_read_aloud" },

  { pattern: /\b(?:open|show|lihat|buka)\s*(?:the\s*)?preview\b/i, intent: "open_preview" },
  { pattern: /\b(?:preview\s*(?:the\s*)?book|preview\s*buku)\b/i, intent: "open_preview" },
  { pattern: /\b(?:read\s*(?:this\s*)?(?:full|now|the\s*book)|baca\s*(?:buku\s*)?(?:ini|sekarang|penuh|lengkap))\b/i, intent: "read_full" },

  { pattern: /\b(?:increase\s*(?:the\s*)?speed|speed\s*up|faster|lebih\s*cepat|percepat|naikkan?\s*kecepatan)\b/i, intent: "speed_increase" },
  { pattern: /\b(?:decrease\s*(?:the\s*)?speed|slow(?:er)?\s*(?:down)?|lebih\s*lambat|perlambat|(?:kurangi|turunkan)\s*kecepatan)\b/i, intent: "speed_decrease" },

  { pattern: /\b(?:repeat\s*(?:the\s*)?(?:navigation\s*)?commands?|what\s*can\s*i\s*say|available\s*commands?|help\s*(?:me\s*)?commands?|show\s*commands?)\b/i, intent: "repeat_commands" },
  { pattern: /\b(?:ulangi?\s*(?:perintah|navigasi|komando)|perintah\s*(?:apa\s*saja|yang\s*tersedia|navigasi)|apa\s*(?:saja\s*)?(?:yang\s*bisa\s*(?:di)?ucap(?:kan)?|perintah(?:nya)?))\b/i, intent: "repeat_commands" },

  { pattern: /\b(?:join|request|gabung|daftar)\s+(.+)/i, intent: "join_institution_code", paramGroup: 1 },

  { pattern: /\bsearch\s+(.+)/i, intent: "search_book", paramGroup: 1 },
  { pattern: /\bcari\s+(.+)/i, intent: "search_book", paramGroup: 1 },
  { pattern: /\b(?:open|read|baca|buka)\s+(?:book\s+)?(.+)/i, intent: "open_book", paramGroup: 1 },

  { pattern: /\b(.+?)\s+books\b/i, intent: "browse_category", paramGroup: 1 },
  { pattern: /\b(?:buku)\s+(.+)/i, intent: "browse_category", paramGroup: 1 },
  { pattern: /\b(?:kategori|category)\s+(.+)/i, intent: "browse_category", paramGroup: 1 },

  { pattern: /\bspeed\s*(\d)/i, intent: "speed_change", paramGroup: 1 },
  { pattern: /\bkecepatan\s*(\d)/i, intent: "speed_change", paramGroup: 1 },
];

function cleanForSearch(text: string): string {
  return text.replace(/[.,!?'";\-:()]/g, "").trim().toLowerCase();
}

export function findBookByTitle(query: string) {
  const cleaned = cleanForSearch(query);
  if (!cleaned) return undefined;

  const exact = sampleBooks.find(b => cleanForSearch(b.title) === cleaned);
  if (exact) return exact;

  return sampleBooks.find(
    b => cleanForSearch(b.title).includes(cleaned) || cleaned.includes(cleanForSearch(b.title))
  );
}

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

      if (regexResult.intent !== "unknown" && regexResult.confidence === 1) {
        if (
          regexResult.intent !== cluResult.intent &&
          cluResult.confidence < 0.8
        ) {
          console.log(
            `Voice: CLU (${cluResult.intent} ${(cluResult.confidence * 100).toFixed(0)}%) vs regex (${regexResult.intent}), using regex for specificity`
          );
          return regexResult;
        }
      }

      const isNavIntent = (cluResult.intent as string).startsWith("nav_");
      if (isNavIntent && regexResult.intent === "unknown" && cluResult.confidence < 0.85) {
        console.log(
          `Voice: CLU nav intent "${cluResult.intent}" (${(cluResult.confidence * 100).toFixed(0)}%) rejected — no regex match and low confidence. Returning unknown for page-level handling.`
        );
        return { intent: "unknown", confidence: 0, source: "clu" };
      }

      console.log(
        `Voice: CLU matched "${text}" → ${cluResult.intent} (${(cluResult.confidence * 100).toFixed(0)}%) param=${param || "none"}`
      );

      return {
        intent: cluResult.intent as VoiceIntent,
        param: param || regexResult.param,
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
      const isNavSoft = (cluResult.intent as string).startsWith("nav_");
      if (isNavSoft) {
        console.log(
          `Voice: CLU soft nav match "${cluResult.intent}" (${(cluResult.confidence * 100).toFixed(0)}%) rejected — navigation requires explicit command`
        );
        return { intent: "unknown", confidence: 0, source: "clu" };
      }
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

export function executeGlobalNavigation(intent: VoiceIntent, voice: string, param?: string, lang?: string): boolean {
  const confirm = (msg: string) => {
    AccessibilityInfo.announceForAccessibility(msg);
    speakText(msg, voice, CONFIRM_SPEED).catch(() => {});
  };

  switch (intent) {
    case "nav_home":
      confirm(lang === "id" ? "Membuka halaman utama" : "Going back to the home page");
      router.replace("/student/home");
      return true;
    case "nav_explorer":
      confirm(lang === "id" ? "Membuka penjelajah" : "Opening the explorer page");
      router.push("/student/penjelajah");
      return true;
    case "nav_collection":
      confirm(lang === "id" ? "Membuka koleksi buku" : "Opening your book collection");
      router.push("/student/library");
      return true;
    case "nav_history":
      confirm(lang === "id" ? "Membuka riwayat" : "Opening the history page");
      router.push("/student/riwayat");
      return true;
    case "nav_guide":
      confirm(lang === "id" ? "Membuka panduan suara" : "Opening the voice guide");
      router.push("/student/guide");
      return true;
    case "nav_settings":
      confirm(lang === "id" ? "Membuka pengaturan" : "Opening the settings page");
      router.push("/student/settings");
      return true;
    case "nav_join_institution":
      confirm(lang === "id" ? "Membuka halaman institusi" : "Opening the institution page");
      router.push("/student/institusi");
      return true;
    case "nav_back":
      confirm(lang === "id" ? "Kembali ke halaman sebelumnya" : "Going back to the previous page");
      router.back();
      return true;
    case "nav_login":
      confirm(lang === "id" ? "Sedang masuk..." : "Signing in...");
      router.replace("/student/home");
      return true;
    case "nav_subscription":
      confirm(lang === "id" ? "Membuka halaman langganan" : "Opening subscription page");
      router.push("/student/subscription");
      return true;
    case "nav_logout":
      confirm(lang === "id" ? "Sedang keluar..." : "Signing out...");
      router.replace("/student/login");
      return true;
    case "open_book":
      if (param) {
        const book = findBookByTitle(param);
        if (book) {
          confirm(lang === "id" ? `Membuka ${book.title}` : `Opening ${book.title}`);
          router.push({ pathname: "/student/book/[id]", params: { id: book.id } });
          return true;
        } else {
          confirm(
            lang === "id"
              ? `Buku "${param}" tidak ditemukan. Coba gunakan pencarian.`
              : `Book "${param}" not found. Try searching for it.`
          );
          router.push("/student/penjelajah");
          return true;
        }
      }
      return false;
    default:
      return false;
  }
}
