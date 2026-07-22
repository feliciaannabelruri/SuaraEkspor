import { z } from 'zod';
import type OpenAI from 'openai';
import type { CommunicationAgentResult, WhatsappAgentResult } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

/**
 * Groq's free/dev tier enforces a tokens-per-minute limit. Under normal use
 * (translating the whole UI dictionary on a language switch) it's easy to hit
 * that limit — retry with the server-provided backoff instead of failing outright.
 */
async function createChatCompletionWithRateLimitRetry(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  maxRetries = 2,
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.code === 'rate_limit_exceeded';
      if (!isRateLimit || attempt >= maxRetries) throw err;

      const retryAfterHeader = err?.headers?.['retry-after'];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 8;
      const waitMs = (Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 8) * 1000 + 500;
      console.warn(`Groq rate limit tercapai, mencoba lagi dalam ${Math.round(waitMs / 1000)}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

const communicationResultSchema = z.object({
  replyToBuyer: z.string(),
  replyLanguage: z.string(),
  summaryForSeller: z.string(),
  summaryLanguage: z.string(),
  summaryAudioUrl: z.string().optional(),
}) satisfies z.ZodType<CommunicationAgentResult>;

const whatsappResultSchema = z.object({
  replyToBuyer: z.string(),
  replyLanguage: z.string(),
  detectedBuyerLanguage: z.string(),
  translatedText: z.string(),
  summaryForSeller: z.string(),
}) satisfies z.ZodType<WhatsappAgentResult>;

interface MessageContext {
  productTitle: string;
  productDescription: string;
  buyerMessage: string;
  buyerLanguage: string;
  sellerLanguage: string;
  conversationHistory: { role: 'buyer' | 'seller'; text: string }[];
}

/**
 * AI Communication Agent — Inti dari SuaraEkspor.
 *
 * Tugas:
 * 1. Membalas pesan buyer dalam bahasa buyer (profesional)
 * 2. Merangkum percakapan untuk penjual dalam bahasa daerahnya
 *
 * Penjual tidak perlu tahu bahasa asing sama sekali.
 */
export async function handleBuyerMessage(ctx: MessageContext): Promise<CommunicationAgentResult> {
  const sellerLangName = getLanguageName(ctx.sellerLanguage);
  const buyerLangName = getLanguageName(ctx.buyerLanguage);

  const systemPrompt = `Kamu adalah agen komunikasi ekspor profesional untuk platform SuaraEkspor.
Tugasmu:
1. Membalas pesan buyer dalam bahasa ${buyerLangName} secara profesional dan ramah
2. Merangkum percakapan untuk penjual dalam bahasa ${sellerLangName} (bahasa daerah penjual)

Penjual adalah UMKM Indonesia yang tidak bisa berbahasa asing.
Pastikan ringkasan untuk penjual jelas, ringkas, dan actionable.`;

  const historyText = ctx.conversationHistory
    .map((m) => `${m.role === 'buyer' ? 'Buyer' : 'Penjual'}: ${m.text}`)
    .join('\n');

  const userPrompt = `PRODUK: ${ctx.productTitle}
DESKRIPSI: ${ctx.productDescription}

RIWAYAT PERCAKAPAN:
${historyText}

PESAN TERBARU DARI BUYER (${buyerLangName}):
"${ctx.buyerMessage}"

Balas dalam format JSON:
{
  "replyToBuyer": "string — balasan dalam ${buyerLangName}, profesional dan ramah",
  "replyLanguage": "${ctx.buyerLanguage}",
  "summaryForSeller": "string — ringkasan dalam ${sellerLangName}: apa yang ditanya buyer, apa yang kita jawab, apa yang perlu dilakukan penjual",
  "summaryLanguage": "${ctx.sellerLanguage}"
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    },
    communicationResultSchema,
    'AI communication agent',
  );
}

interface WhatsappMessageContext {
  buyerMessage: string;
  buyerName?: string;
  sellerLanguage: string;
  sellerBusinessName?: string;
  conversationHistory?: { role: 'buyer' | 'seller'; text: string }[];
}

/**
 * AI Communication Agent khusus untuk pesan masuk WhatsApp (via Fonnte webhook).
 *
 * Bertindak sebagai penengah/interpreter dua arah antara UMKM (penjual, berbahasa
 * daerah) dan buyer internasional (berbahasa asing), termasuk saat negosiasi
 * harga/kuantitas berlangsung berkali-kali — makanya riwayat percakapan disertakan.
 *
 * Berbeda dari handleBuyerMessage: di sini belum ada konteks produk spesifik dan
 * bahasa buyer belum diketahui, jadi model diminta mendeteksi bahasa buyer sendiri.
 */
export async function handleWhatsappMessage(ctx: WhatsappMessageContext): Promise<WhatsappAgentResult> {
  const sellerLangName = getLanguageName(ctx.sellerLanguage);
  const businessName = ctx.sellerBusinessName ?? 'UMKM';

  const systemPrompt = `Kamu adalah AI penengah komunikasi ekspor untuk platform SuaraEkspor, menjembatani percakapan WhatsApp antara UMKM "${businessName}" (penjual, berbahasa ${sellerLangName}) dan buyer internasional (berbahasa asing).
Tugasmu:
1. Deteksi bahasa pesan buyer.
2. Balas pesan buyer secara profesional dan ramah dalam bahasa yang sama dengan pesan buyer — termasuk saat buyer menawar harga, minta diskon, atau menegosiasikan jumlah/kuantitas, tetap sopan dan tidak asal menyetujui tanpa konteks dari riwayat percakapan.
3. Terjemahkan pesan buyer ke dalam bahasa ${sellerLangName} (bahasa daerah penjual) supaya penjual paham persis apa yang diminta/ditawar buyer.
4. Rangkum percakapan untuk penjual dalam bahasa ${sellerLangName}, jelas, ringkas, dan actionable (termasuk angka harga/kuantitas yang disebut, kalau ada).

Penjual adalah UMKM Indonesia yang tidak bisa berbahasa asing dan mengandalkanmu sepenuhnya sebagai penerjemah dalam proses negosiasi.`;

  const historyText = (ctx.conversationHistory ?? [])
    .map((m) => `${m.role === 'buyer' ? 'Buyer' : 'Penjual (sudah diterjemahkan)'}: ${m.text}`)
    .join('\n');

  const userPrompt = `${historyText ? `RIWAYAT PERCAKAPAN SEBELUMNYA:\n${historyText}\n\n` : ''}PESAN TERBARU DARI${ctx.buyerName ? ` ${ctx.buyerName}` : ' BUYER'} VIA WHATSAPP:
"${ctx.buyerMessage}"

Balas dalam format JSON:
{
  "replyToBuyer": "string — balasan untuk buyer, dalam bahasa yang sama dengan pesan buyer, mempertimbangkan riwayat percakapan (misal negosiasi harga yang sedang berjalan)",
  "replyLanguage": "string — kode bahasa balasan, misal 'en', 'fr', 'id'",
  "detectedBuyerLanguage": "string — kode bahasa pesan buyer yang terdeteksi",
  "translatedText": "string — terjemahan pesan buyer ke ${sellerLangName}",
  "summaryForSeller": "string — ringkasan singkat untuk penjual dalam ${sellerLangName}: apa yang ditanya/ditawar buyer dan apa yang perlu dilakukan penjual"
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    },
    whatsappResultSchema,
    'AI WhatsApp agent',
  );
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    id: 'Bahasa Indonesia',
    jv: 'Bahasa Jawa',
    su: 'Bahasa Sunda',
    btk: 'Bahasa Batak',
    en: 'English',
    zh: 'Chinese',
    ar: 'Arabic',
    ja: 'Japanese',
    de: 'German',
    fr: 'French',
  };
  return names[code] ?? code;
}

/**
 * Menerjemahkan satu balasan bebas dari penjual (diketik atau hasil transkrip suara,
 * biasanya dalam bahasa daerah/Indonesia) ke bahasa buyer, supaya penjual bisa
 * bernegosiasi dengan kata-katanya sendiri tanpa perlu bisa bahasa asing.
 */
export async function translateText(text: string, targetLanguageCode: string): Promise<string> {
  const targetLangName = getLanguageName(targetLanguageCode);

  const response = await createChatCompletionWithRateLimitRetry({
    model: GROQ_MODELS.chatJson,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah AI penerjemah profesional untuk platform ekspor SuaraEkspor. Terjemahkan pesan balasan penjual UMKM ke dalam bahasa ${targetLangName}, dengan nada profesional dan ramah, cocok untuk konteks negosiasi ekspor via WhatsApp. Kembalikan HANYA teks hasil terjemahan, tanpa tanda kutip, penjelasan, atau markdown.`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content?.trim() || text;
}

export async function translateDictionary(dictionary: Record<string, string>, targetLanguage: string): Promise<Record<string, string>> {
  const prompt = `Kamu adalah AI penerjemah profesional untuk platform ekspor SuaraEkspor.
Tugasmu: Terjemahkan seluruh nilai string (values) dari objek JSON berikut ke dalam bahasa target: "${targetLanguage}".
PENTING:
1. Kembalikan HASILNYA SAJA dalam format JSON objek dengan kunci (keys) yang sama persis seperti aslinya.
2. Jangan ubah format placeholder seperti {name} atau {businessName}. Biarkan kata kunci placeholder tersebut tetap apa adanya dalam terjemahan.
3. Jangan tambahkan komentar, penjelasan, markdown, atau pembungkus kode lainnya. Cukup kembalikan objek JSON mentah.

Daftar Kata/Frasa yang Harus Diterjemahkan:
${JSON.stringify(dictionary, null, 2)}`;

  const response = await createChatCompletionWithRateLimitRetry({
    model: GROQ_MODELS.chatJson,
    messages: [
      { role: 'system', content: 'Kamu adalah mesin penerjemah JSON yang akurat.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse translation result:', content);
    return {};
  }
}
