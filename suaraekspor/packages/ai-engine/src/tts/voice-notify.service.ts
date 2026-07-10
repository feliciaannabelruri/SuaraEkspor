import { writeFile } from 'fs/promises';
import { join } from 'path';
import { groq, GROQ_MODELS } from '../client';

const REQUEST_TIMEOUT_MS = 30000;

type TTSVoice = 'hannah' | 'troy' | 'austin';

/**
 * Mengubah ringkasan percakapan menjadi audio (WAV) untuk notifikasi penjual.
 * Penjual menerima notifikasi suara — tidak perlu membaca teks asing.
 *
 * Keterbatasan: model TTS Groq (Orpheus) saat ini hanya mendukung Inggris/Arab —
 * ringkasan berbahasa Indonesia/daerah akan tetap dibacakan tapi dengan pelafalan
 * bahasa Inggris (kurang natural). Ini trade-off yang disepakati untuk pindah dari OpenAI.
 */
export async function generateVoiceNotification(
  text: string,
  outputFileName: string,
  voice: TTSVoice = 'hannah',
): Promise<string> {
  let response;
  try {
    response = await groq.audio.speech.create(
      {
        model: GROQ_MODELS.tts,
        voice,
        input: text,
        response_format: 'wav',
      } as any,
      { timeout: REQUEST_TIMEOUT_MS },
    );
  } catch (err) {
    throw new Error(`AI voice notification (TTS via Groq) gagal: ${err instanceof Error ? err.message : String(err)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = join(process.env.AUDIO_OUTPUT_DIR || '/tmp', outputFileName.replace(/\.mp3$/, '.wav'));

  await writeFile(outputPath, buffer);
  return outputPath;
}
