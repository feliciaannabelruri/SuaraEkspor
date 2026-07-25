import { z } from 'zod';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

const promoCaptionSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  imageBadgeText: z.string(),
});

export interface PromoCaptionResult {
  caption: string;
  hashtags: string[];
  imageBadgeText: string;
}

export interface PromoCaptionInput {
  productTitle: string;
  productDescription: string;
  category: string;
  sellerLanguage: string;
  businessName?: string;
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
  };
  return names[code] ?? code;
}

/**
 * Draft caption + hashtags + gambar promosi untuk penjual UMKM yang kurang
 * familiar dengan teknologi/marketing — mereka cukup salin/unduh/bagikan
 * hasilnya ke akun media sosial mereka sendiri, tanpa perlu setup apapun.
 */
export async function generatePromoCaption(input: PromoCaptionInput): Promise<PromoCaptionResult> {
  const langName = getLanguageName(input.sellerLanguage);
  const business = input.businessName ?? 'UMKM ini';

  const systemPrompt = `Kamu adalah asisten AI marketing untuk UMKM Indonesia yang ingin mempromosikan produknya sendiri di media sosial (Instagram/WhatsApp/Facebook/TikTok), tapi kurang paham cara menulis caption yang menarik.
Tugasmu: buatkan caption promosi yang catchy, hangat, dan personal — bukan template generic — dalam bahasa ${langName}, siap tinggal disalin dan diposting penjual.
Jawab HANYA dalam format JSON valid.`;

  const userPrompt = `Buat promo kit untuk produk berikut:

Nama Produk: ${input.productTitle}
Deskripsi: ${input.productDescription}
Kategori: ${input.category}
Nama Usaha: ${business}

Balas dalam format JSON PERSIS:
{
  "caption": "string — caption promosi lengkap dalam ${langName}, 3-5 kalimat, hangat dan personal, ajak orang beli/DM, sertakan emoji secukupnya",
  "hashtags": ["array string — 5-8 hashtag, campuran ${langName} dan Inggris untuk jangkauan lebih luas, tanpa tanda #"],
  "imageBadgeText": "string — tagline SANGAT singkat max 40 karakter untuk overlay di foto produk, catchy, misal 'Handmade dari Jepara'"
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    },
    promoCaptionSchema,
    'AI promo caption generation',
  );
}

/**
 * Terapkan koreksi yang diucapkan penjual lewat voice note ke promo kit yang
 * sudah ada — pola yang sama seperti koreksi suara di dokumen legal: transkrip
 * + data saat ini masuk, data yang sudah dikoreksi (skema sama) keluar.
 */
export async function applyPromoVoiceCorrection(
  current: PromoCaptionResult,
  correctionTranscript: string,
  sellerLanguage: string,
): Promise<PromoCaptionResult> {
  const langName = getLanguageName(sellerLanguage);

  const userPrompt = `Berikut adalah promo kit saat ini dalam format JSON:
${JSON.stringify(current, null, 2)}

Penjual mengucapkan koreksi berikut lewat voice note:
"${correctionTranscript}"

Terapkan HANYA koreksi yang diminta, biarkan bagian lain tetap sama persis seperti sebelumnya.
Balas dengan JSON LENGKAP hasil koreksi, dalam skema yang PERSIS SAMA seperti data asli di atas (caption dalam bahasa ${langName}).`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten AI yang mengedit promo kit media sosial berdasarkan instruksi suara penjual UMKM. Jawab HANYA dalam format JSON valid, dengan skema yang sama persis seperti data yang diberikan.`,
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    },
    promoCaptionSchema,
    'AI promo voice correction',
  );
}
