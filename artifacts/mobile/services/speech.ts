import { Platform } from "react-native";

const API_BASE = Platform.OS === "web"
  ? "/api"
  : `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export interface STTResult {
  RecognitionStatus: string;
  DisplayText?: string;
  Offset?: number;
  Duration?: number;
}

export async function getAzureToken(): Promise<{ token: string; region: string }> {
  const res = await fetch(`${API_BASE}/speech/token`);
  if (!res.ok) throw new Error("Failed to get speech token");
  return res.json();
}

export async function speechToText(audioBlob: Blob, lang: string = "en-US"): Promise<STTResult> {
  const res = await fetch(`${API_BASE}/speech/stt?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    headers: {
      "Content-Type": "audio/wav",
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
  const response = await fetch(uri);
  const blob = await response.blob();
  return speechToText(blob, lang);
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

export function stopTTSPlayback(): void {
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

  const azureVoice = getAzureVoiceName(voiceId);

  if (Platform.OS === "web") {
    const audioBuffer = await textToSpeech(text, azureVoice, rate);
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      currentAudioWeb = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioWeb = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudioWeb = null;
        reject(new Error("Audio playback failed"));
      };
      audio.play().catch(reject);
    });
  } else {
    const { Audio } = await import("expo-av");
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const ttsUrl = `${API_BASE}/speech/tts`;
    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: azureVoice, rate }),
    });
    if (!res.ok) throw new Error("TTS request failed");

    const arrayBuffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:audio/mpeg;base64,${base64}`;

    const { sound } = await Audio.Sound.createAsync(
      { uri: dataUri },
      { shouldPlay: true }
    );
    currentSoundNative = sound;

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          currentSoundNative = null;
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

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType(),
      });

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
          extension: ".wav",
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
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
    }
  }

  async stop(): Promise<Blob> {
    if (Platform.OS === "web") {
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject(new Error("No recording in progress"));
          return;
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: "audio/webm" });
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

      const response = await fetch(uri!);
      const blob = await response.blob();
      return blob;
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
