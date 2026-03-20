import { Router, type Request, type Response } from "express";
import multer from "multer";

const speechRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const AZURE_SPEECH_KEY = process.env["AZURE_SPEECH_KEY"] || "";
const AZURE_SPEECH_REGION = process.env["AZURE_SPEECH_REGION"] || "";

speechRouter.get("/speech/token", async (_req: Request, res: Response) => {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    res.status(500).json({ error: "Azure Speech credentials not configured" });
    return;
  }

  try {
    const tokenRes = await fetch(
      `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      res.status(tokenRes.status).json({ error: `Token fetch failed: ${errText}` });
      return;
    }

    const token = await tokenRes.text();
    res.json({ token, region: AZURE_SPEECH_REGION });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Token fetch failed" });
  }
});

speechRouter.post("/speech/stt", upload.single("audio"), async (req: Request, res: Response) => {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    res.status(500).json({ error: "Azure Speech credentials not configured" });
    return;
  }

  const lang = (req.query["lang"] as string) || "en-US";

  try {
    let audioBuffer: Buffer;
    let audioContentType = "audio/wav";

    if (req.file && req.file.buffer.length > 0) {
      audioBuffer = req.file.buffer;
      audioContentType = req.file.mimetype || "audio/wav";
    } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      audioBuffer = req.body;
      audioContentType = req.headers["content-type"] || "audio/wav";
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }
      audioBuffer = Buffer.concat(chunks);
      audioContentType = req.headers["content-type"] || "audio/wav";
    }

    if (audioBuffer.length === 0) {
      res.status(400).json({ error: "No audio data received" });
      return;
    }

    console.log(`STT: received ${audioBuffer.length} bytes, content-type: ${audioContentType}`);

    const sttRes = await fetch(
      `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
          "Content-Type": audioContentType,
          "Accept": "application/json",
        },
        body: audioBuffer,
      }
    );

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      res.status(sttRes.status).json({ error: `STT failed: ${errText}` });
      return;
    }

    const result = await sttRes.json();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "STT failed" });
  }
});

speechRouter.post("/speech/tts", async (req: Request, res: Response) => {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    res.status(500).json({ error: "Azure Speech credentials not configured" });
    return;
  }

  const { text, voice, rate } = req.body as {
    text?: string;
    voice?: string;
    rate?: number;
  };

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const voiceName = voice || "en-US-EmmaMultilingualNeural";
  const prosodyRate = rate ? `${Math.round(rate * 100)}%` : "100%";

  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
    <voice name='${voiceName}'>
      <prosody rate='${prosodyRate}'>${escapeXml(text)}</prosody>
    </voice>
  </speak>`;

  try {
    const ttsRes = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        },
        body: ssml,
      }
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      res.status(ttsRes.status).json({ error: `TTS failed: ${errText}` });
      return;
    }

    const audioArrayBuffer = await ttsRes.arrayBuffer();
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audioArrayBuffer.byteLength),
    });
    res.send(Buffer.from(audioArrayBuffer));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "TTS failed" });
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default speechRouter;
