import { Router, type Request, type Response } from "express";

const summarizeRouter = Router();

const AZURE_OPENAI_KEY = process.env["AZURE_OPENAI_KEY"] || "";
const AZURE_OPENAI_ENDPOINT = process.env["AZURE_OPENAI_ENDPOINT"] || "";
const AZURE_OPENAI_DEPLOYMENT = process.env["AZURE_OPENAI_DEPLOYMENT"] || "";
const API_VERSION = "2024-08-01-preview";
const MAX_TEXT_LENGTH = 10000;
const REQUEST_TIMEOUT_MS = 30000;

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a reading assistant for visually impaired students. Summarize the given text clearly and concisely in 3-5 sentences. Use simple, accessible language. Focus on key ideas, main events, and important details. Always respond in English.`,
  id: `Kamu adalah asisten baca untuk siswa tunanetra. Ringkas teks yang diberikan dengan jelas dan ringkas dalam 3-5 kalimat. Gunakan bahasa yang sederhana dan mudah dipahami. Fokus pada ide utama, peristiwa penting, dan detail kunci. Selalu jawab dalam Bahasa Indonesia.`,
};

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const mergedSignal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;

  return fetch(url, { ...options, signal: mergedSignal }).finally(() => clearTimeout(timer));
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

summarizeRouter.post("/ai/summarize", async (req: Request, res: Response) => {
  if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
    res.status(503).json({ error: "Azure OpenAI service not configured" });
    return;
  }

  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    return;
  }

  const { text, language } = req.body;

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Missing or invalid 'text' field" });
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` });
    return;
  }

  const lang = language === "id" ? "id" : "en";
  const systemPrompt = SYSTEM_PROMPTS[lang];

  const endpoint = AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "");
  const url = `${endpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      },
      REQUEST_TIMEOUT_MS
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Azure OpenAI error ${response.status}: ${errorText}`);
      res.status(502).json({ error: "AI summarization service returned an error" });
      return;
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      res.status(502).json({ error: "No summary generated" });
      return;
    }

    res.json({
      summary,
      language: lang,
      usage: data.usage || null,
    });
  } catch (err: any) {
    if (err.name === "AbortError" || err.name === "TimeoutError") {
      console.error("Azure OpenAI request timed out");
      res.status(504).json({ error: "AI summarization request timed out" });
      return;
    }
    console.error("Summarize error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

summarizeRouter.get("/ai/status", async (_req: Request, res: Response) => {
  const configured = !!(AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_DEPLOYMENT);
  res.json({
    service: "azure-openai",
    configured,
  });
});

export default summarizeRouter;
