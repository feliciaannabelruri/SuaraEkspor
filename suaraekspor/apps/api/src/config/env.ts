import { z } from 'zod';
import path from 'path';
import os from 'os';

const DEFAULT_AUDIO_DIR = path.join(os.tmpdir(), 'suaraekspor-audio');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  GROQ_API_KEY: z.string(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.string(),
  FONNTE_API_KEY: z.string().optional(),
  AUDIO_OUTPUT_DIR: z.string().default(DEFAULT_AUDIO_DIR),
  // URL publik API ini, dipakai untuk menyusun webhook URL Fonnte (mis. https://api.suaraekspor.com)
  API_PUBLIC_URL: z.string().optional(),
  // Nomor WhatsApp platform SuaraEkspor (format internasional tanpa '+', mis. 6289501116888) —
  // satu nomor AI middleman untuk SEMUA penjual, bukan per-penjual.
  WHATSAPP_PLATFORM_NUMBER: z.string().optional(),
  // Kunci rahasia webhook WhatsApp (dipakai di query string ?secret=... saat setup webhook di Fonnte)
  WHATSAPP_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Missing or invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();