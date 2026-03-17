import OpenAI from 'openai';
import type { VisionResult, PricingResult } from '@suaraekspor/shared';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('LLM returned empty response for pricing');

  return JSON.parse(content) as PricingResult;
}