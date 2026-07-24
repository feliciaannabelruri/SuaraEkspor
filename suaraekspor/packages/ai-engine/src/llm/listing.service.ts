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

const REQUIRED_LANGUAGES: Record<string, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
  zh: '中文',
  ar: 'العربية',
  ja: '日本語',
  de: 'Deutsch',
};

/**
 * Menghasilkan listing produk multibahasa dari hasil STT + Vision.
 * Output: title + description + keywords dalam 6 bahasa target buyer.
 */
export async function generateMultilingualListing(
  sttResult: STTResult,
  visionResult: VisionResult,
): Promise<ListingGenerationResult> {
  const hasRealTranscript = Boolean(sttResult.transcript && sttResult.transcript.trim().length > 10);
  const vis = visionResult as any;

  const systemPrompt = `Kamu adalah AI spesialis pembuatan listing produk ekspor untuk UMKM Indonesia.
Tugasmu: membuat listing yang SANGAT SPESIFIK dan PERSONAL.

ATURAN WAJIB:
1. Nama produk HARUS spesifik sesuai apa yang terlihat di foto dan/atau disebutkan penjual — BUKAN generic seperti "Kerajinan Indonesia" atau "Kerajinan Unik"
2. Jika ucapan penjual mendeskripsikan produk dengan jelas → gunakan sebagai dasar utama
3. Jika ucapan penjual TIDAK mendeskripsikan produk (misalnya berbicara tentang hal lain, bertanya, atau tidak relevan dengan produk) → ABAIKAN dan gunakan ANALISIS FOTO sebagai sumber utama
4. DILARANG KERAS menggunakan template generic seperti "dibuat dengan cinta", "berkualitas tinggi", "sentuhan Indonesia"
5. Gunakan detail konkret yang terlihat/terdengar: nama produk spesifik, bahan, bentuk, fungsi, daerah asal
6. Jawab HANYA dalam format JSON yang valid`;

  const transcriptPart = hasRealTranscript
    ? `UCAPAN PENJUAL:\n"${sttResult.transcript}"\n(Nilai relevansi: jika ucapan ini menjelaskan produknya → gunakan. Jika tidak relevan dengan produk di foto → abaikan dan andalkan foto.)`
    : `(Tidak ada voice note dari penjual)`;

  const userPrompt = `Buat listing produk ekspor berdasarkan kombinasi data foto dan ucapan penjual berikut:

--- DATA FOTO PRODUK (SELALU GUNAKAN INI) ---
Jenis produk terlihat di foto: ${vis.productType}
Deskripsi visual dari foto: "${vis.productDescription}"
Fitur visual: ${vis.visualFeatures?.join(', ') || ''}
Kondisi: ${vis.condition}
Kategori: ${vis.estimatedCategory}

--- UCAPAN PENJUAL (gunakan HANYA jika relevan dengan produk di foto) ---
${transcriptPart}

---

Instruksi:
- Nama produk untuk bahasa id: langsung dari jenis produk yang TERLIHAT di foto atau disebutkan penjual — SPESIFIK, max 80 karakter
- Deskripsi untuk bahasa id: 150-250 kata, fokus pada apa yang terlihat di foto (bahan, bentuk, motif, fungsi, keunikan)
- Untuk bahasa lain: terjemahkan nama & deskripsi yang sama secara natural

Format JSON (wajib 6 bahasa, urutan berikut PENTING — hasilkan bahasa non-Latin lebih dulu supaya tidak terpotong jika respons panjang: id, zh, ar, ja, en, de):
{
  "listings": [
    {
      "languageCode": "id",
      "languageName": "Bahasa Indonesia",
      "title": "nama produk SPESIFIK berdasarkan foto",
      "description": "deskripsi konkret berdasarkan foto — sebutkan bahan, bentuk, fungsi, keunikan",
      "keywords": ["8-10 keyword SEO bahasa Indonesia"]
    }
  ],
  "targetMarkets": ["negara target"],
  "exportReadinessScore": 0
}

exportReadinessScore: 0-100.`;


  const raw = await chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // Non-Latin scripts (zh/ar/ja) use noticeably more tokens per character than
      // Latin ones — 6 full title+description+keywords in one response needs more
      // headroom than 4500, or the later languages in the array get cut off/empty.
      max_tokens: 7000,
      response_format: { type: 'json_object' },
    },
    listingGenerationSchema,
    'AI listing generation',
  );

  // --- Post-process: ensure all 6 required languages are present and non-empty ---
  const idListing = raw.listings.find(l => l.languageCode === 'id');
  const filledListings = Object.entries(REQUIRED_LANGUAGES).map(([code, name]) => {
    const existing = raw.listings.find(l => l.languageCode === code);
    // Use existing if title AND description are both non-empty
    if (existing && existing.title.trim() && existing.description.trim()) {
      return existing;
    }
    // Fallback: copy from Indonesian listing (title/desc not translated but better than empty)
    return {
      languageCode: code,
      languageName: name,
      title: idListing?.title ?? existing?.title ?? '',
      description: idListing?.description ?? existing?.description ?? '',
      keywords: existing?.keywords ?? idListing?.keywords ?? [],
    };
  });

  return { ...raw, listings: filledListings };
}
