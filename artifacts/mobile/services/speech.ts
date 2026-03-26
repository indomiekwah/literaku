import { Platform } from "react-native";

const API_BASE = Platform.OS === "web"
  ? "/api"
  : `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export interface STTNBestEntry {
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
}

export interface STTResult {
  RecognitionStatus: string;
  DisplayText?: string;
  Offset?: number;
  Duration?: number;
  NBest?: STTNBestEntry[];
}

export async function getAzureToken(): Promise<{ token: string; region: string }> {
  const res = await fetch(`${API_BASE}/speech/token`);
  if (!res.ok) throw new Error("Failed to get speech token");
  return res.json();
}

export async function speechToText(audioBlob: Blob, lang: string = "en-US"): Promise<STTResult> {
  const contentType = audioBlob.type || "audio/wav";
  const res = await fetch(`${API_BASE}/speech/stt?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body: audioBlob,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "STT request failed" }));
    throw new Error(err.error || "STT request failed");
  }
  return res.json();
}

export async function speechToTextFromUri(uri: string, lang: string = "en-US"): Promise<STTResult> {
  const ext = uri.split(".").pop()?.toLowerCase() || "wav";
  const mimeMap: Record<string, string> = {
    wav: "audio/wav",
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    aac: "audio/aac",
    ogg: "audio/ogg",
    webm: "audio/webm",
    "3gp": "audio/3gpp",
  };
  const mimeType = mimeMap[ext] || "audio/wav";
  const fileName = `recording.${ext}`;

  console.log(`speechToTextFromUri: uri=${uri}, ext=${ext}, mime=${mimeType}`);

  const formData = new FormData();
  formData.append("audio", {
    uri,
    type: mimeType,
    name: fileName,
  } as any);

  const res = await fetch(`${API_BASE}/speech/stt?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "STT request failed" }));
    throw new Error(err.error || "STT request failed");
  }
  return res.json();
}

export async function textToSpeech(
  text: string,
  voice: string = "en-US-EmmaMultilingualNeural",
  rate: number = 1
): Promise<ArrayBuffer> {
  const res = await fetch(`${API_BASE}/speech/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice, rate }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "TTS request failed" }));
    throw new Error(err.error || "TTS request failed");
  }
  return res.arrayBuffer();
}

const AZURE_VOICE_MAP: Record<string, string> = {
  v1: "id-ID-GadisNeural",
  v2: "id-ID-ArdiNeural",
  v3: "en-US-EmmaMultilingualNeural",
  v4: "en-US-AndrewMultilingualNeural",
};

export function getAzureVoiceName(voiceId: string): string {
  return AZURE_VOICE_MAP[voiceId] || "en-US-EmmaMultilingualNeural";
}

let currentAudioWeb: HTMLAudioElement | null = null;
let currentSoundNative: any = null;
let ttsGeneration = 0;
let currentAbortController: AbortController | null = null;

export function stopTTSPlayback(): void {
  ttsGeneration++;

  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (Platform.OS === "web") {
    if (currentAudioWeb) {
      currentAudioWeb.pause();
      currentAudioWeb.currentTime = 0;
      currentAudioWeb = null;
    }
  } else {
    if (currentSoundNative) {
      currentSoundNative.stopAsync().catch(() => {});
      currentSoundNative.unloadAsync().catch(() => {});
      currentSoundNative = null;
    }
  }
}

export async function speakText(
  text: string,
  voiceId: string = "v3",
  rate: number = 1
): Promise<void> {
  stopTTSPlayback();

  const myGeneration = ttsGeneration;
  const abortController = new AbortController();
  currentAbortController = abortController;

  const azureVoice = getAzureVoiceName(voiceId);

  if (Platform.OS === "web") {
    let audioBuffer: ArrayBuffer;
    try {
      const res = await fetch(`${API_BASE}/speech/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: azureVoice, rate }),
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error("TTS request failed");
      audioBuffer = await res.arrayBuffer();
    } catch (err: any) {
      if (err.name === "AbortError" || myGeneration !== ttsGeneration) return;
      throw err;
    }

    if (myGeneration !== ttsGeneration) return;

    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      if (myGeneration !== ttsGeneration) {
        URL.revokeObjectURL(url);
        resolve();
        return;
      }

      const audio = new Audio(url);
      currentAudioWeb = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (currentAudioWeb === audio) currentAudioWeb = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        if (currentAudioWeb === audio) currentAudioWeb = null;
        reject(new Error("Audio playback failed"));
      };
      audio.play().catch((err) => {
        URL.revokeObjectURL(url);
        if (currentAudioWeb === audio) currentAudioWeb = null;
        if (myGeneration !== ttsGeneration) resolve();
        else reject(err);
      });
    });
  } else {
    const { Audio } = await import("expo-av");
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    let arrayBuffer: ArrayBuffer;
    try {
      const res = await fetch(`${API_BASE}/speech/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: azureVoice, rate }),
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error("TTS request failed");
      arrayBuffer = await res.arrayBuffer();
    } catch (err: any) {
      if (err.name === "AbortError" || myGeneration !== ttsGeneration) return;
      throw err;
    }

    if (myGeneration !== ttsGeneration) return;

    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:audio/mpeg;base64,${base64}`;

    const { sound } = await Audio.Sound.createAsync(
      { uri: dataUri },
      { shouldPlay: true }
    );

    if (myGeneration !== ttsGeneration) {
      sound.stopAsync().catch(() => {});
      sound.unloadAsync().catch(() => {});
      return;
    }

    currentSoundNative = sound;

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (currentSoundNative === sound) currentSoundNative = null;
          resolve();
        }
      });
    });
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface SummarizeResult {
  summary: string;
  language: string;
}

export async function summarizeText(
  text: string,
  language: string = "en"
): Promise<SummarizeResult> {
  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: "Summarization failed" }));
    throw new Error(errData.error || "Summarization failed");
  }
  return res.json();
}

export interface CLUResult {
  intent: string;
  confidence: number;
  entities: { category: string; text: string; confidence: number }[];
}

const CLU_TIMEOUT_MS = 4000;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    ),
  ]);
}

export async function analyzeCLU(
  text: string,
  language: string = "en"
): Promise<CLUResult> {
  const res = await fetchWithTimeout(`${API_BASE}/speech/clu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  }, CLU_TIMEOUT_MS);
  if (!res.ok) {
    throw new Error("CLU analysis failed");
  }
  return res.json();
}

export async function isCLUAvailable(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/speech/clu/status`, {}, CLU_TIMEOUT_MS);
    if (!res.ok) return false;
    const data = await res.json();
    return data.available === true;
  } catch {
    return false;
  }
}

export function isTTSPlaying(): boolean {
  if (Platform.OS === "web") {
    return currentAudioWeb !== null && !currentAudioWeb.paused;
  }
  return currentSoundNative !== null;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private nativeRecording: any = null;
  private recordedMimeType: string = "audio/webm";

  async start(): Promise<void> {
    if (Platform.OS === "web") {
      this.chunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mimeType = this.getSupportedMimeType();
      this.recordedMimeType = mimeType;
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      console.log(`AudioRecorder: web recording started, mimeType=${mimeType}`);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
    } else {
      const { Audio } = await import("expo-av");
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Microphone permission denied");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: "linearPCM" as any,
          audioQuality: 127,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      } as any);
      await recording.startAsync();
      this.nativeRecording = recording;
      console.log(`AudioRecorder: native recording started, platform=${Platform.OS}`);
    }
  }

  async stop(): Promise<Blob | string> {
    if (Platform.OS === "web") {
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject(new Error("No recording in progress"));
          return;
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: this.recordedMimeType });
          this.cleanup();
          resolve(blob);
        };

        this.mediaRecorder.stop();
      });
    } else {
      if (!this.nativeRecording) {
        throw new Error("No recording in progress");
      }
      await this.nativeRecording.stopAndUnloadAsync();
      const uri = this.nativeRecording.getURI();
      this.nativeRecording = null;

      const { Audio } = await import("expo-av");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return uri!;
    }
  }

  cancel(): void {
    if (Platform.OS === "web") {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      this.cleanup();
    } else {
      if (this.nativeRecording) {
        this.nativeRecording.stopAndUnloadAsync().catch(() => {});
        this.nativeRecording = null;
      }
    }
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  private getSupportedMimeType(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "audio/webm";
  }
}
