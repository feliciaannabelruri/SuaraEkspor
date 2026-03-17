import OpenAI from 'openai';
import { createReadStream } from 'fs';
import type { STTResult } from '@suaraekspor/shared';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioFilePath: string): Promise<STTResult> {
  const startTime = Date.now();

  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(audioFilePath),
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  const durationSeconds = (Date.now() - startTime) / 1000;

  const detectedLang = transcription.language || 'id';

  return {
    transcript: transcription.text,
    detectedLanguage: mapWhisperLangToLocal(detectedLang),
    confidence: estimateConfidence(transcription.text),
    durationSeconds,
  };
}

function mapWhisperLangToLocal(whisperLang: string): string {
  const langMap: Record<string, string> = {
    id: 'id',     
    jw: 'jv',      
    su: 'su',    
  };
  return langMap[whisperLang] ?? 'id';
}

function estimateConfidence(transcript: string): number {
  if (transcript.length > 50) return 0.9;
  if (transcript.length > 20) return 0.75;
  return 0.5;
}