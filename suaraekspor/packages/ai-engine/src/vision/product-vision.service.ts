import { z } from 'zod';
import type { VisionResult } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

const visionResultSchema = z.object({
  productType: z.string(),
  condition: z.string(),
  visualFeatures: z.array(z.string()),
  estimatedCategory: z.string(),
  suggestedKeywords: z.array(z.string()),
  confidence: z.number(),
}) satisfies z.ZodType<VisionResult>;

/**
 * Analisis foto produk UMKM menggunakan GPT-4o Vision.
 * Menghasilkan: jenis produk, kondisi, fitur visual, kategori, keyword.
 * Menerima hingga beberapa foto (sudut berbeda) dari produk yang sama.
 */
export async function analyzeProductPhoto(photoUrls: string[]): Promise<VisionResult> {
  const systemPrompt = `Kamu adalah AI spesialis analisis produk UMKM Indonesia untuk keperluan ekspor.
Tugasmu: menganalisis foto produk dan menghasilkan data terstruktur yang berguna untuk listing ekspor.
Jawab HANYA dalam format JSON yang valid, tanpa markdown.`;

  const multiPhotoNote =
    photoUrls.length > 1
      ? `\n\nKamu diberikan ${photoUrls.length} foto yang merupakan sudut/angle berbeda dari PRODUK YANG SAMA. Gunakan seluruh foto untuk menghasilkan analisis yang lebih akurat dan lengkap.`
      : '';

  const userPrompt = `Analisis foto produk ini dan berikan JSON dengan format PERSIS berikut:${multiPhotoNote}
{
  "productType": "string — nama jenis produk spesifik, misal 'Batik Tulis Pekalongan'",
  "condition": "string — kondisi produk: 'baru', 'sangat baik', atau 'baik'",
  "visualFeatures": ["array string — fitur visual penting: warna, motif, bahan, ukuran estimasi"],
  "estimatedCategory": "string — salah satu dari: kerajinan, pertanian, tekstil, kuliner, tanaman, lainnya",
  "suggestedKeywords": ["array string — 5-8 kata kunci bahasa Inggris untuk SEO ekspor"],
  "confidence": 0.0
}`;

  const imageContent = photoUrls.map((url) => ({
    type: 'image_url' as const,
    image_url: { url },
  }));

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.vision,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }, ...imageContent],
        },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    },
    visionResultSchema,
    'AI vision analysis',
  );
}
