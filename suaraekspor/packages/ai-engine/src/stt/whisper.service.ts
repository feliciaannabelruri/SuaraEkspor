import { createReadStream } from 'fs';
import type { STTResult } from '@suaraekspor/shared';
import { groq, GROQ_MODELS } from '../client';

const REQUEST_TIMEOUT_MS = 30000;

export async function transcribeAudio(audioFilePath: string): Promise<STTResult> {
  const startTime = Date.now();

  let transcription;
  try {
    transcription = await groq.audio.transcriptions.create(
      {
        file: createReadStream(audioFilePath),
        model: GROQ_MODELS.whisper,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      },
      { timeout: REQUEST_TIMEOUT_MS },
    );
  } catch (err) {
    throw new Error(`AI transcription (Whisper via Groq) gagal: ${err instanceof Error ? err.message : String(err)}`);
  }

  const durationSeconds = (Date.now() - startTime) / 1000;

  const detectedLang = transcription.language || 'id';

  return {
    transcript: transcription.text,
    detectedLanguage: mapWhisperLangToLocal(detectedLang),
    confidence: estimateConfidence(transcription),
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

// Approximation only: Whisper's avg_logprob is not a calibrated probability/confidence
// score, we just map it into a rough 0-1 range as a best-effort signal.
function estimateConfidence(transcription: { text: string; segments?: { avg_logprob?: number }[] }): number {
  const segments = transcription.segments;
  if (segments && segments.length > 0) {
    const logprobs = segments
      .map((s) => s.avg_logprob)
      .filter((v): v is number => typeof v === 'number');
    if (logprobs.length > 0) {
      const avgLogprob = logprobs.reduce((a, b) => a + b, 0) / logprobs.length;
      return Math.max(0, Math.min(1, 1 + avgLogprob));
    }
  }
  return estimateConfidenceFromLength(transcription.text);
}

function estimateConfidenceFromLength(transcript: string): number {
  if (transcript.length > 50) return 0.9;
  if (transcript.length > 20) return 0.75;
  return 0.5;
}
