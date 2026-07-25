import { z } from 'zod';
import type { ExportContext, InvoiceData, PackingListData, CertOriginData } from '@suaraekspor/shared';
import { chatJsonWithValidation } from '../util/json-llm';
import { groq, GROQ_MODELS } from '../client';

// Plain, DB-agnostic input — the controller assembles this from Prisma includes,
// same convention as STTResult/VisionResult inputs elsewhere in this package.
export interface LegalDocGenInput {
  transaction: { id: string; quantity: number; totalUsd: number; createdAt: Date | string };
  productTitle: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  exportContext?: ExportContext;
}

const invoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPriceUsd: z.number(),
  totalUsd: z.number(),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  sellerName: z.string(),
  sellerAddress: z.string(),
  buyerName: z.string(),
  buyerAddress: z.string(),
  buyerCountry: z.string(),
  items: z.array(invoiceItemSchema),
  subtotalUsd: z.number(),
  totalUsd: z.number(),
  incoterm: z.string(),
  currency: z.string(),
}) satisfies z.ZodType<InvoiceData>;

const packingListPackageSchema = z.object({
  packageNo: z.number(),
  description: z.string(),
  quantity: z.number(),
  netWeightKg: z.number(),
  grossWeightKg: z.number(),
  dimensionsCm: z.string(),
});

const packingListSchema = z.object({
  packingListNumber: z.string(),
  date: z.string(),
  sellerName: z.string(),
  buyerName: z.string(),
  buyerCountry: z.string(),
  packages: z.array(packingListPackageSchema),
  totalPackages: z.number(),
  totalNetWeightKg: z.number(),
  totalGrossWeightKg: z.number(),
}) satisfies z.ZodType<PackingListData>;

const certOriginSchema = z.object({
  certificateNumber: z.string(),
  date: z.string(),
  exporterName: z.string(),
  exporterAddress: z.string(),
  consigneeName: z.string(),
  consigneeCountry: z.string(),
  countryOfOrigin: z.string(),
  portOfLoading: z.string(),
  portOfDischarge: z.string(),
  hsCode: z.string(),
  goodsDescription: z.string(),
  quantity: z.string(),
}) satisfies z.ZodType<CertOriginData>;

function contextBlock(ctx?: ExportContext): string {
  if (!ctx) return '(Tidak ada info ekspor tambahan — isi dengan asumsi wajar untuk ekspor UMKM Indonesia, misal FOB, negara tujuan umum.)';
  const lines = Object.entries(ctx)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `- ${k}: ${v}`);
  return lines.length ? lines.join('\n') : '(Tidak ada info ekspor tambahan — isi dengan asumsi wajar.)';
}

/**
 * Draft AI generators untuk 3 jenis dokumen ekspor. Ini adalah generator
 * best-effort untuk UMKM (bukan sistem kepabeanan formal) — field yang tidak
 * diketahui diisi AI dengan asumsi wajar, bukan diblokir/dikosongkan, karena
 * penjual selalu bisa mengedit manual atau lewat suara sesudahnya.
 */
export async function generateInvoiceData(input: LegalDocGenInput): Promise<InvoiceData> {
  const userPrompt = `Buat draft Commercial Invoice untuk transaksi ekspor UMKM berikut:

Produk: ${input.productTitle}
Kuantitas: ${input.transaction.quantity}
Total harga: USD ${input.transaction.totalUsd}
Penjual: ${input.sellerName}, alamat: ${input.sellerAddress}
Pembeli: ${input.buyerName}, alamat: ${input.buyerAddress}
Tanggal transaksi: ${input.transaction.createdAt}

Info ekspor tambahan:
${contextBlock(input.exportContext)}

Balas dalam format JSON PERSIS:
{
  "invoiceNumber": "string — nomor invoice unik, format INV-<tahun>-<4 digit>",
  "invoiceDate": "string — tanggal format YYYY-MM-DD",
  "sellerName": "string", "sellerAddress": "string",
  "buyerName": "string", "buyerAddress": "string", "buyerCountry": "string",
  "items": [{ "description": "string", "quantity": 0, "unitPriceUsd": 0, "totalUsd": 0 }],
  "subtotalUsd": 0, "totalUsd": 0,
  "incoterm": "string — misal FOB, CIF",
  "currency": "USD"
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: 'Kamu adalah asisten AI yang membuat draft dokumen ekspor untuk UMKM Indonesia. Jawab HANYA dalam format JSON valid.' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    },
    invoiceSchema,
    'AI invoice generation',
  );
}

export async function generatePackingListData(input: LegalDocGenInput): Promise<PackingListData> {
  const userPrompt = `Buat draft Packing List untuk transaksi ekspor UMKM berikut:

Produk: ${input.productTitle}
Kuantitas: ${input.transaction.quantity}
Penjual: ${input.sellerName}
Pembeli: ${input.buyerName}

Info ekspor tambahan:
${contextBlock(input.exportContext)}

Balas dalam format JSON PERSIS:
{
  "packingListNumber": "string — format PL-<tahun>-<4 digit>",
  "date": "string — YYYY-MM-DD",
  "sellerName": "string", "buyerName": "string", "buyerCountry": "string",
  "packages": [{ "packageNo": 1, "description": "string", "quantity": 0, "netWeightKg": 0, "grossWeightKg": 0, "dimensionsCm": "string, format LxWxH" }],
  "totalPackages": 0, "totalNetWeightKg": 0, "totalGrossWeightKg": 0
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: 'Kamu adalah asisten AI yang membuat draft dokumen ekspor untuk UMKM Indonesia. Jawab HANYA dalam format JSON valid.' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    },
    packingListSchema,
    'AI packing list generation',
  );
}

export async function generateCertOriginData(input: LegalDocGenInput): Promise<CertOriginData> {
  const userPrompt = `Buat draft Certificate of Origin untuk transaksi ekspor UMKM berikut:

Produk: ${input.productTitle}
Penjual (eksportir): ${input.sellerName}, alamat: ${input.sellerAddress}
Pembeli (consignee): ${input.buyerName}, alamat: ${input.buyerAddress}

Info ekspor tambahan:
${contextBlock(input.exportContext)}

Balas dalam format JSON PERSIS:
{
  "certificateNumber": "string — format COO-<tahun>-<4 digit>",
  "date": "string — YYYY-MM-DD",
  "exporterName": "string", "exporterAddress": "string",
  "consigneeName": "string", "consigneeCountry": "string",
  "countryOfOrigin": "Indonesia",
  "portOfLoading": "string — pelabuhan Indonesia terdekat/relevan jika tidak diketahui",
  "portOfDischarge": "string",
  "hsCode": "string — kode HS 6 digit yang paling relevan untuk jenis produk ini",
  "goodsDescription": "string", "quantity": "string"
}`;

  return chatJsonWithValidation(
    groq,
    {
      model: GROQ_MODELS.chatJson,
      messages: [
        { role: 'system', content: 'Kamu adalah asisten AI yang membuat draft dokumen ekspor untuk UMKM Indonesia. Jawab HANYA dalam format JSON valid.' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    },
    certOriginSchema,
    'AI certificate of origin generation',
  );
}

export const legalDocSchemas = {
  commercial_invoice: invoiceSchema,
  packing_list: packingListSchema,
  certificate_of_origin: certOriginSchema,
} as const;
