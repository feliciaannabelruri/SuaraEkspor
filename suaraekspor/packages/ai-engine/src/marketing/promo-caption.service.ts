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
