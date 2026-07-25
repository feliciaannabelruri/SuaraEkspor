import type { z } from 'zod';
import type { LegalDocType, LegalDocData } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';
import { legalDocSchemas } from './generate-document.service';

const DOC_TYPE_LABELS: Record<LegalDocType, string> = {
  commercial_invoice: 'Commercial Invoice',
  packing_list: 'Packing List',
  certificate_of_origin: 'Certificate of Origin',
};

/**
 * Terapkan koreksi yang diucapkan penjual lewat voice note ke data dokumen
 * legal yang sudah ada — mirip pola /reply-voice di WhatsApp, tapi di sini
 * hasilnya adalah objek data JSON yang divalidasi ulang dengan skema yang
 * sama seperti saat generate, supaya PDF renderer selalu dapat bentuk data
 * yang konsisten.
 */
export async function applyVoiceCorrection(
  docType: LegalDocType,
  currentData: LegalDocData,
  correctionTranscript: string,
): Promise<LegalDocData> {
  const schema = legalDocSchemas[docType];
  const label = DOC_TYPE_LABELS[docType];

  const userPrompt = `Berikut adalah data ${label} saat ini dalam format JSON:
${JSON.stringify(currentData, null, 2)}

Penjual mengucapkan koreksi berikut lewat voice note:
"${correctionTranscript}"

Terapkan HANYA koreksi yang diminta, biarkan field lain tetap sama persis seperti sebelumnya.
Balas dengan JSON LENGKAP hasil koreksi, dalam skema yang PERSIS SAMA seperti data asli di atas (jangan ubah nama field atau strukturnya).`;

  return chatJsonWithValidation<LegalDocData>(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten AI yang mengedit dokumen ekspor ${label} berdasarkan instruksi suara penjual UMKM. Jawab HANYA dalam format JSON valid, dengan skema yang sama persis seperti data yang diberikan.`,
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    },
    schema as z.ZodType<LegalDocData>,
    `AI voice correction (${label})`,
  );
}
