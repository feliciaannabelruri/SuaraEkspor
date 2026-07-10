import { z } from 'zod';
import type { STTResult, VisionResult, ListingGenerationResult } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

const listingGenerationSchema = z.object({
  listings: z.array(
    z.object({
      languageCode: z.string(),
      languageName: z.string(),
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
  ),
  targetMarkets: z.array(z.string()),
  exportReadinessScore: z.number(),
}) satisfies z.ZodType<ListingGenerationResult>;

/**
 * Menghasilkan listing produk multibahasa dari hasil STT + Vision.
 * Output: title + description + keywords dalam 6 bahasa target buyer.
 */
export async function generateMultilingualListing(
  sttResult: STTResult,
  visionResult: VisionResult,
): Promise<ListingGenerationResult> {
  const systemPrompt = `Kamu adalah AI spesialis pembuatan listing produk ekspor untuk platform marketplace internasional.
Kamu membantu UMKM Indonesia menjual produk mereka ke buyer global.
Jawab HANYA dalam format JSON yang valid.`;

  const userPrompt = `Buat listing produk ekspor profesional berdasarkan data berikut:

DESKRIPSI PENJUAL (bahasa: ${sttResult.detectedLanguage}):
"${sttResult.transcript}"

ANALISIS FOTO PRODUK:
- Jenis: ${visionResult.productType}
- Kondisi: ${visionResult.condition}
- Fitur: ${visionResult.visualFeatures.join(', ')}
- Kategori: ${visionResult.estimatedCategory}

Buat listing dalam bahasa-bahasa berikut: en, zh, ar, ja, de, id

Format JSON yang diinginkan:
{
  "listings": [
    {
      "languageCode": "en",
      "languageName": "English",
      "title": "string — judul produk menarik max 80 karakter",
      "description": "string — deskripsi profesional 150-300 kata, highlight keunikan produk lokal Indonesia",
      "keywords": ["array 8-10 keyword SEO relevan"]
    }
    // ... ulangi untuk setiap bahasa
  ],
  "targetMarkets": ["array negara target: USA, UK, Japan, China, dll"],
  "exportReadinessScore": 0
}

exportReadinessScore: 0-100, nilai kesiapan produk ini untuk ekspor.`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    },
    listingGenerationSchema,
    'AI listing generation',
  );
}
