import OpenAI from 'openai';
import type { STTResult, VisionResult, ListingGenerationResult } from '@suaraekspor/shared';
import { TARGET_BUYER_LANGUAGES } from '@suaraekspor/shared';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('LLM returned empty response for listing generation');

  return JSON.parse(content) as ListingGenerationResult;
}