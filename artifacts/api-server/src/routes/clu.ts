import { Router, type Request, type Response } from "express";

const cluRouter = Router();

const AZURE_LANGUAGE_KEY = process.env["AZURE_LANGUAGE_KEY"] || "";
const AZURE_LANGUAGE_ENDPOINT = process.env["AZURE_LANGUAGE_ENDPOINT"] || "";
const CLU_PROJECT_NAME = "literaku-voice";
const CLU_DEPLOYMENT_NAME = "production";
const CLU_API_VERSION = "2023-04-01";
const CLU_TIMEOUT_MS = 5000;
const STATUS_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_TEXT_LENGTH = 500;

let statusCache: { available: boolean; checkedAt: number } | null = null;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<globalThis.Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}

cluRouter.post("/speech/clu", async (req: Request, res: Response) => {
  if (!AZURE_LANGUAGE_KEY || !AZURE_LANGUAGE_ENDPOINT) {
    res.status(503).json({ error: "CLU service not configured" });
    return;
  }

  const { text, language } = req.body as {
    text?: string;
    language?: string;
  };

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const sanitizedText = text.trim().slice(0, MAX_TEXT_LENGTH);
  const lang = language || "en";

  try {
    const url = `${AZURE_LANGUAGE_ENDPOINT}/language/:analyze-conversations?api-version=${CLU_API_VERSION}`;

    const cluRes = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_LANGUAGE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "Conversation",
        analysisInput: {
          conversationItem: {
            id: "1",
            text: sanitizedText,
            participantId: "user",
            language: lang,
          },
        },
        parameters: {
          projectName: CLU_PROJECT_NAME,
          deploymentName: CLU_DEPLOYMENT_NAME,
          stringIndexType: "TextElement_V8",
        },
      }),
    }, CLU_TIMEOUT_MS);

    if (!cluRes.ok) {
      console.error(`CLU Azure error: ${cluRes.status}`);
      res.status(502).json({ error: "CLU upstream service error" });
      return;
    }

    const result = await cluRes.json() as any;
    const prediction = result.result?.prediction;

    if (!prediction) {
      res.json({
        intent: "unknown",
        confidence: 0,
        entities: [],
      });
      return;
    }

    const topIntent = prediction.topIntent || "None";
    const confidence =
      prediction.intents?.find((i: any) => i.category === topIntent)
        ?.confidenceScore ?? 0;

    const entities = (prediction.entities || []).map((e: any) => ({
      category: e.category,
      text: e.text,
      confidence: e.confidenceScore ?? 0,
    }));

    const mappedIntent = topIntent === "None" ? "unknown" : topIntent;

    console.log(
      `CLU: intent=${mappedIntent} conf=${(confidence * 100).toFixed(0)}%`
    );

    res.json({
      intent: mappedIntent,
      confidence,
      entities,
      topIntent: topIntent,
    });
  } catch (err: any) {
    const msg = err.message === "Request timeout" ? "CLU request timed out" : "CLU analysis failed";
    console.error("CLU error:", err.message);
    res.status(504).json({ error: msg });
  }
});

cluRouter.get("/speech/clu/status", async (_req: Request, res: Response) => {
  if (!AZURE_LANGUAGE_KEY || !AZURE_LANGUAGE_ENDPOINT) {
    res.json({ available: false });
    return;
  }

  if (statusCache && Date.now() - statusCache.checkedAt < STATUS_CACHE_TTL_MS) {
    res.json({ available: statusCache.available });
    return;
  }

  try {
    const url = `${AZURE_LANGUAGE_ENDPOINT}/language/authoring/analyze-conversations/projects/${CLU_PROJECT_NAME}/deployments/${CLU_DEPLOYMENT_NAME}?api-version=2023-04-01`;

    const checkRes = await fetchWithTimeout(url, {
      headers: { "Ocp-Apim-Subscription-Key": AZURE_LANGUAGE_KEY },
    }, CLU_TIMEOUT_MS);

    const available = checkRes.ok;
    statusCache = { available, checkedAt: Date.now() };
    res.json({ available });
  } catch (err: any) {
    console.error("CLU status check error:", err.message);
    statusCache = { available: false, checkedAt: Date.now() };
    res.json({ available: false });
  }
});

export default cluRouter;
