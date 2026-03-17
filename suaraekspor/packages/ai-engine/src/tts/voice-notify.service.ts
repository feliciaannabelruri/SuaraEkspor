import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/**
 * Mengubah ringkasan percakapan menjadi audio (MP3) dalam bahasa daerah penjual.
 * Penjual menerima notifikasi suara — tidak perlu membaca teks asing.
 * 
 * OpenAI TTS mendukung Bahasa Indonesia dengan baik.
 * Untuk bahasa Jawa/Sunda, text dikirim dalam BI namun dengan intonasi natural.
 */
export async function generateVoiceNotification(
  text: string,
  outputFileName: string,
  voice: TTSVoice = 'nova',
): Promise<string> {
  const mp3Response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
    speed: 0.9, // Sedikit lebih lambat untuk kejelasan
  });

  const buffer = Buffer.from(await mp3Response.arrayBuffer());
  const outputPath = join(process.env.AUDIO_OUTPUT_DIR || '/tmp', outputFileName);

  await writeFile(outputPath, buffer);
  return outputPath;
}