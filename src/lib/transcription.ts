import { supabase } from './supabase'
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Add these type declarations at the top
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

interface WitResponse {
  text: string;
  error?: string;
}

interface WitErrorResponse {
  error: string;
}

export async function transcribeAudio(file: File): Promise<string> {
  try {
    // Check file size (25MB limit)
    const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 25MB limit.')
    }

    // Convert file to blob if needed
    const audioBlob = file.type === 'audio/wav' ? file : await convertToWav(file);

    const response = await fetch('https://api.wit.ai/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WIT_AI_TOKEN}`,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json'
      },
      body: audioBlob
    });

    if (!response.ok) {
      const errorData = await response.json() as WitErrorResponse;
      throw new Error(errorData.error || 'Transcription failed');
    }

    const data = await response.json() as WitResponse;
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
    throw new Error('Failed to transcribe audio');
  }
}

// Helper function to convert audio to WAV format if needed
async function convertToWav(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const audioData = await audioContext.decodeAudioData(e.target?.result as ArrayBuffer);
        const wavData = audioBufferToWav(audioData);
        const wavBlob = new Blob([wavData], { type: 'audio/wav' });
        resolve(wavBlob);
      } catch (error) {
        reject(new Error('Failed to convert audio format'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Write audio data
  const offset = 44;
  const channelData = new Float32Array(buffer.length);
  
  for (let channel = 0; channel < numChannels; channel++) {
    buffer.copyFromChannel(channelData, channel, 0);
    let pos = offset;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += bytesPerSample;
    }
  }
  
  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function translateContent(content: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        targetLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    return data.translation
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to translate content: ${error.message}`)
    }
    throw new Error('Failed to translate content')
  }
} 