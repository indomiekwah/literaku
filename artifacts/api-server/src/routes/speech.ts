import express, { Router, type Request, type Response } from "express";
import multer from "multer";
import { execFile } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

const speechRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const AZURE_SPEECH_KEY = process.env["AZURE_SPEECH_KEY"] || "";
const AZURE_SPEECH_REGION = process.env["AZURE_SPEECH_REGION"] || "";

const AZURE_WAV_CONTENT_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
]);

function isWavPcm(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const riff = buffer.toString("ascii", 0, 4);
  const wave = buffer.toString("ascii", 8, 12);
  return riff === "RIFF" && wave === "WAVE";
}

async function convertToWav(inputBuffer: Buffer, inputMime: string): Promise<Buffer> {
  const id = randomUUID();
  const ext = inputMime.includes("webm") ? ".webm"
    : inputMime.includes("ogg") ? ".ogg"
    : inputMime.includes("mp4") || inputMime.includes("m4a") || inputMime.includes("aac") ? ".m4a"
    : inputMime.includes("3gp") ? ".3gp"
    : inputMime.includes("amr") ? ".amr"
    : ".bin";

  const inputPath = join(tmpdir(), `stt-input-${id}${ext}`);
  const outputPath = join(tmpdir(), `stt-output-${id}.wav`);

  try {
    await writeFile(inputPath, inputBuffer);

    await new Promise<void>((resolve, reject) => {
      execFile("ffmpeg", [
        "-y",
        "-i", inputPath,
        "-ar", "16000",
        "-ac", "1",
        "-sample_fmt", "s16",
        "-f", "wav",
        outputPath,
      ], { timeout: 15000 }, (error, _stdout, stderr) => {
        if (error) {
          console.error("ffmpeg error:", stderr);
          reject(new Error(`ffmpeg conversion failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    const wavBuffer = await readFile(outputPath);
    return wavBuffer;
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

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

const rawAudioParser = express.raw({ type: ["audio/*", "application/octet-stream"], limit: "10mb" });

speechRouter.post("/speech/stt", (req: Request, res: Response, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    upload.single("audio")(req, res, next);
  } else {
    rawAudioParser(req, res, next);
  }
}, async (req: Request, res: Response) => {
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
      res.status(415).json({ error: "Unsupported content type. Send audio/* or multipart/form-data." });
      return;
    }

    if (audioBuffer.length === 0) {
      res.status(400).json({ error: "No audio data received" });
      return;
    }

    console.log(`STT: received ${audioBuffer.length} bytes, content-type: ${audioContentType}, lang: ${lang}`);

    const needsConversion = !isWavPcm(audioBuffer);

    if (needsConversion) {
      console.log(`STT: converting ${audioContentType} to WAV PCM using ffmpeg...`);
      try {
        audioBuffer = await convertToWav(audioBuffer, audioContentType);
        audioContentType = "audio/wav";
        console.log(`STT: conversion complete, ${audioBuffer.length} bytes WAV`);
      } catch (convErr: any) {
        console.error("STT: ffmpeg conversion failed:", convErr.message);
        res.status(400).json({ error: "Audio format conversion failed. Please try again." });
        return;
      }
    }

    const sttRes = await fetch(
      `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
          "Content-Type": "audio/wav",
          "Accept": "application/json",
        },
        body: audioBuffer,
      }
    );

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      console.log(`STT Azure error: ${sttRes.status} - ${errText}`);
      res.status(sttRes.status).json({ error: `STT failed: ${errText}` });
      return;
    }

    const result = await sttRes.json();
    console.log(`STT result: ${result.RecognitionStatus}`);
    res.json(result);
  } catch (err: any) {
    console.error("STT error:", err);
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
  const prosodyRate = rate != null ? `${rate}` : "1";

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
