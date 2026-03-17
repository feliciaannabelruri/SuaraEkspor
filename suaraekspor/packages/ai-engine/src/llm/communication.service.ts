import OpenAI from 'openai';
import type { CommunicationAgentResult } from '@suaraekspor/shared';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('LLM returned empty response for communication agent');

  return JSON.parse(content) as CommunicationAgentResult;
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