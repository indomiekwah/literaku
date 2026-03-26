import { Router, type Request, type Response } from "express";

const cluRouter = Router();

const AZURE_LANGUAGE_KEY = process.env["AZURE_LANGUAGE_KEY"] || "";
const AZURE_LANGUAGE_ENDPOINT = process.env["AZURE_LANGUAGE_ENDPOINT"] || "";
const CLU_PROJECT_NAME = "literaku-voice";
const CLU_DEPLOYMENT_NAME = "production";
const CLU_API_VERSION = "2022-10-01-preview";

cluRouter.post("/speech/clu", async (req: Request, res: Response) => {
  if (!AZURE_LANGUAGE_KEY || !AZURE_LANGUAGE_ENDPOINT) {
    res.status(500).json({ error: "Azure Language credentials not configured" });
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

  const lang = language || "en";

  try {
    const url = `${AZURE_LANGUAGE_ENDPOINT}/language/:analyze-conversations?api-version=${CLU_API_VERSION}`;

    const cluRes = await fetch(url, {
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
            text: text.trim(),
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
    });

    if (!cluRes.ok) {
      const errText = await cluRes.text();
      console.error(`CLU Azure error: ${cluRes.status} - ${errText}`);
      res.status(cluRes.status).json({ error: `CLU failed: ${errText}` });
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
      `CLU: "${text}" → ${mappedIntent} (${(confidence * 100).toFixed(0)}%) [entities: ${entities.map((e: any) => `${e.category}="${e.text}"`).join(", ") || "none"}]`
    );

    res.json({
      intent: mappedIntent,
      confidence,
      entities,
      topIntent: topIntent,
    });
  } catch (err: any) {
    console.error("CLU error:", err);
    res.status(500).json({ error: err.message || "CLU analysis failed" });
  }
});

cluRouter.get("/speech/clu/status", async (_req: Request, res: Response) => {
  if (!AZURE_LANGUAGE_KEY || !AZURE_LANGUAGE_ENDPOINT) {
    res.json({ available: false, reason: "credentials_missing" });
    return;
  }

  try {
    const url = `${AZURE_LANGUAGE_ENDPOINT}/language/authoring/analyze-conversations/projects/${CLU_PROJECT_NAME}/deployments/${CLU_DEPLOYMENT_NAME}?api-version=2023-04-01`;

    const checkRes = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": AZURE_LANGUAGE_KEY },
    });

    if (checkRes.ok) {
      res.json({ available: true, project: CLU_PROJECT_NAME, deployment: CLU_DEPLOYMENT_NAME });
    } else {
      const errText = await checkRes.text();
      res.json({ available: false, reason: "deployment_not_found", details: errText });
    }
  } catch (err: any) {
    res.json({ available: false, reason: "connection_error", details: err.message });
  }
});

export default cluRouter;
