import OpenAI from 'openai';
import type { VisionResult } from '@suaraekspor/shared';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analisis foto produk UMKM menggunakan GPT-4o Vision.
 * Menghasilkan: jenis produk, kondisi, fitur visual, kategori, keyword.
 */
export async function analyzeProductPhoto(imageUrl: string): Promise<VisionResult> {
  const systemPrompt = `Kamu adalah AI spesialis analisis produk UMKM Indonesia untuk keperluan ekspor.
Tugasmu: menganalisis foto produk dan menghasilkan data terstruktur yang berguna untuk listing ekspor.
Jawab HANYA dalam format JSON yang valid, tanpa markdown.`;

  const userPrompt = `Analisis foto produk ini dan berikan JSON dengan format PERSIS berikut:
{
  "productType": "string — nama jenis produk spesifik, misal 'Batik Tulis Pekalongan'",
  "condition": "string — kondisi produk: 'baru', 'sangat baik', atau 'baik'",
  "visualFeatures": ["array string — fitur visual penting: warna, motif, bahan, ukuran estimasi"],
  "estimatedCategory": "string — salah satu dari: kerajinan, pertanian, tekstil, kuliner, tanaman, lainnya",
  "suggestedKeywords": ["array string — 5-8 kata kunci bahasa Inggris untuk SEO ekspor"],
  "confidence": 0.0
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Vision API returned empty response');

  const parsed = JSON.parse(content) as VisionResult;
  return parsed;
}