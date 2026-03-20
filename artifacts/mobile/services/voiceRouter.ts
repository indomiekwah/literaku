import { router } from "expo-router";
import { AccessibilityInfo } from "react-native";

export type VoiceIntent =
  | "nav_home"
  | "nav_explorer"
  | "nav_collection"
  | "nav_history"
  | "nav_guide"
  | "nav_settings"
  | "nav_redeem"
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

interface MatchResult {
  intent: VoiceIntent;
  param?: string;
}

const PATTERNS: { pattern: RegExp; intent: VoiceIntent; paramGroup?: number }[] = [
  { pattern: /\b(go\s*(?:back\s*)?(?:to\s*)?home|beranda|ke\s*beranda|pulang|kembali\s*ke\s*(?:beranda|home))\b/i, intent: "nav_home" },
  { pattern: /\b(open\s*explorer|explorer|penjelajah|buka\s*penjelajah|jelajah|explore)\b/i, intent: "nav_explorer" },
  { pattern: /\b((?:show\s*(?:my\s*)?)?collection|koleksi|buka\s*koleksi|my\s*(?:books?|library)|perpustakaan|library)\b/i, intent: "nav_collection" },
  { pattern: /\b((?:open\s*)?history|riwayat|buka\s*riwayat|reading\s*history)\b/i, intent: "nav_history" },
  { pattern: /\b((?:open\s*)?guide|panduan|buka\s*panduan|help|bantuan|voice\s*guide)\b/i, intent: "nav_guide" },
  { pattern: /\b((?:open\s*)?settings|pengaturan|buka\s*pengaturan|setelan)\b/i, intent: "nav_settings" },
  { pattern: /\b(redeem|token|redeem\s*token|tukar\s*token|kode\s*token)\b/i, intent: "nav_redeem" },
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

export function matchVoiceIntent(text: string): MatchResult {
  const cleaned = text.replace(/[.,!?'"]/g, "").trim();

  for (const { pattern, intent, paramGroup } of PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      return {
        intent,
        param: paramGroup !== undefined ? match[paramGroup]?.trim() : undefined,
      };
    }
  }

  return { intent: "unknown" };
}

export function executeGlobalNavigation(intent: VoiceIntent): boolean {
  const announce = (msg: string) => {
    AccessibilityInfo.announceForAccessibility(msg);
  };

  switch (intent) {
    case "nav_home":
      announce("Going to home");
      router.replace("/student/home");
      return true;
    case "nav_explorer":
      announce("Opening explorer");
      router.push("/student/penjelajah");
      return true;
    case "nav_collection":
      announce("Opening collection");
      router.push("/student/library");
      return true;
    case "nav_history":
      announce("Opening history");
      router.push("/student/riwayat");
      return true;
    case "nav_guide":
      announce("Opening guide");
      router.push("/student/guide");
      return true;
    case "nav_settings":
      announce("Opening settings");
      router.push("/student/settings");
      return true;
    case "nav_redeem":
      announce("Opening redeem token");
      router.push("/student/riwayat");
      return true;
    case "nav_back":
      announce("Going back");
      router.back();
      return true;
    default:
      return false;
  }
}
