import { z } from 'zod';
import type { VisionResult, PricingResult } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

const pricingResultSchema = z.object({
  recommendedPriceUsd: z.number(),
  priceRangeUsd: z.object({ min: z.number(), max: z.number() }),
  rationale: z.string(),
  comparableProducts: z.array(z.string()),
}) satisfies z.ZodType<PricingResult>;

/**
 * Rekomendasi harga ekspor dalam USD berdasarkan analisis produk.
 * Menggunakan pengetahuan LLM tentang pasar global UMKM Indonesia.
 */
export async function recommendExportPrice(
  visionResult: VisionResult,
  productDescription: string,
): Promise<PricingResult> {
  const prompt = `Kamu adalah konsultan harga ekspor UMKM Indonesia berpengalaman.
Berikan rekomendasi harga ekspor yang realistis dalam USD untuk produk berikut.

PRODUK: ${visionResult.productType}
KATEGORI: ${visionResult.estimatedCategory}
KONDISI: ${visionResult.condition}
FITUR: ${visionResult.visualFeatures.join(', ')}
DESKRIPSI: ${productDescription}

Pertimbangkan:
- Pasar ekspor utama: USA, Eropa, Jepang, China, Australia
- Kompetitor: produk artisan Asia Tenggara di Etsy, Amazon Handmade
- Positioning: produk UMKM Indonesia yang autentik dan handmade

Jawab dalam format JSON:
{
  "recommendedPriceUsd": 0.0,
  "priceRangeUsd": { "min": 0.0, "max": 0.0 },
  "rationale": "string — penjelasan singkat dasar penetapan harga",
  "comparableProducts": ["contoh produk serupa di pasar global sebagai referensi"]
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    },
    pricingResultSchema,
    'AI pricing recommendation',
  );
}
