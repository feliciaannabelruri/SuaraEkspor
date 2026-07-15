import { z } from 'zod';
import type { CommunicationAgentResult } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

const communicationResultSchema = z.object({
  replyToBuyer: z.string(),
  replyLanguage: z.string(),
  summaryForSeller: z.string(),
  summaryLanguage: z.string(),
  summaryAudioUrl: z.string().optional(),
}) satisfies z.ZodType<CommunicationAgentResult>;

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

export async function translateDictionary(dictionary: Record<string, string>, targetLanguage: string): Promise<Record<string, string>> {
  const prompt = `Kamu adalah AI penerjemah profesional untuk platform ekspor SuaraEkspor.
Tugasmu: Terjemahkan seluruh nilai string (values) dari objek JSON berikut ke dalam bahasa target: "${targetLanguage}".
PENTING:
1. Kembalikan HASILNYA SAJA dalam format JSON objek dengan kunci (keys) yang sama persis seperti aslinya.
2. Jangan ubah format placeholder seperti {name} atau {businessName}. Biarkan kata kunci placeholder tersebut tetap apa adanya dalam terjemahan.
3. Jangan tambahkan komentar, penjelasan, markdown, atau pembungkus kode lainnya. Cukup kembalikan objek JSON mentah.

Daftar Kata/Frasa yang Harus Diterjemahkan:
${JSON.stringify(dictionary, null, 2)}`;

  const response = await groq.chat.completions.create({
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
