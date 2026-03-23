import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Converts raw PCM data (16-bit, mono, 24kHz) to a playable WAV Blob URL.
 */
function pcmToWav(pcmBase64: string, sampleRate: number = 24000) {
  try {
    const binaryString = window.atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = bytes.buffer;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF identifier
    view.setUint32(0, 0x52494646, false);
    // file length
    view.setUint32(4, 36 + buffer.byteLength, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false);
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false);
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM = 1)
    view.setUint16(20, 1, true);
    // channel count (mono = 1)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample (16-bit)
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false);
    // data chunk length
    view.setUint32(40, buffer.byteLength, true);
    
    const blob = new Blob([wavHeader, buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Lỗi giải mã base64 âm thanh:", e);
    throw new Error("Dữ liệu âm thanh không hợp lệ");
  }
}

export async function generateSpeech(text: string, voiceName: string = 'Kore', speed: number = 1) {
  try {
    // Initialize AI inside the function to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this clearly, naturally, and at ${speed}x speed. Read the entire text without skipping any parts: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        maxOutputTokens: 8192, // Increase token limit for longer audio
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Convert raw PCM to WAV for standard audio element support
      return pcmToWav(base64Audio);
    }
    throw new Error("No audio data received from Gemini AI");
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
}
