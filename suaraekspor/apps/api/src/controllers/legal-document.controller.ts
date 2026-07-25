import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';
import {
  generateInvoiceData,
  generatePackingListData,
  generateCertOriginData,
  applyVoiceCorrection,
  transcribeAudio,
} from '@suaraekspor/ai-engine';
import { renderLegalDocumentPdf } from '../services/legal-document-pdf.service';
import { uploadDocumentPdf } from '../services/imagekit.service';
import type { LegalDocType, LegalDocData, ExportContext } from '@suaraekspor/shared';
import fs from 'fs';

const VALID_TYPES: LegalDocType[] = ['commercial_invoice', 'packing_list', 'certificate_of_origin'];

function isValidType(type: string): type is LegalDocType {
  return VALID_TYPES.includes(type as LegalDocType);
}

async function loadOwnedTransaction(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      product: { include: { listings: { where: { languageCode: 'id' }, take: 1 } } },
      seller: true,
      buyer: true,
    },
  });
  if (!transaction) return { transaction: null, error: 404 as const };
  if (transaction.sellerId !== userId) return { transaction: null, error: 403 as const };
  return { transaction, error: null };
}

export async function listLegalDocuments(req: AuthRequest, res: Response) {
  const { transactionId } = req.params;
  const { transaction, error } = await loadOwnedTransaction(transactionId, req.userId!);
  if (error === 404) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
  if (error === 403) return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses transaksi ini' });

  const docs = await prisma.legalDocument.findMany({ where: { transactionId } });
  return res.json({ success: true, data: docs });
}

export async function generateLegalDocument(req: AuthRequest, res: Response) {
  const { transactionId, type } = req.params;
  if (!isValidType(type)) return res.status(400).json({ success: false, error: 'Jenis dokumen tidak valid' });

  const { transaction, error } = await loadOwnedTransaction(transactionId, req.userId!);
  if (error === 404) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
  if (error === 403) return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses transaksi ini' });

  try {
    const bodyExportContext: ExportContext | undefined = req.body?.exportContext;

    // Reuse exportContext from a sibling doc on the same transaction if this
    // request didn't send one, so the seller isn't asked the same questions
    // 3 times across invoice/packing-list/certificate.
    let exportContext = bodyExportContext;
    if (!exportContext) {
      // Prisma's null-filtering for nullable Json columns is unreliable across
      // versions (JsonNull vs DbNull vs plain null) — simplest to just fetch
      // the siblings and pick the first one with data in JS.
      const siblings = await prisma.legalDocument.findMany({ where: { transactionId } });
      const sibling = siblings.find((d) => d.exportContext);
      exportContext = (sibling?.exportContext as ExportContext | undefined) ?? undefined;
    }

    const genInput = {
      transaction: { id: transaction!.id, quantity: transaction!.quantity, totalUsd: transaction!.totalUsd, createdAt: transaction!.createdAt },
      productTitle: transaction!.product.listings[0]?.title || transaction!.product.category || 'Produk UMKM',
      sellerName: transaction!.seller.businessName || transaction!.seller.name || 'Penjual',
      sellerAddress: transaction!.seller.address || transaction!.seller.province || 'Indonesia',
      buyerName: transaction!.buyer.name || 'Buyer',
      buyerAddress: transaction!.buyer.address || '-',
      exportContext,
    };

    let data: LegalDocData;
    if (type === 'commercial_invoice') data = await generateInvoiceData(genInput);
    else if (type === 'packing_list') data = await generatePackingListData(genInput);
    else data = await generateCertOriginData(genInput);

    const doc = await prisma.legalDocument.upsert({
      where: { transactionId_type: { transactionId, type } },
      update: { data: data as any, exportContext: exportContext as any, aiNotes: 'Dibuat otomatis oleh AI', status: 'draft' },
      create: { transactionId, type, data: data as any, exportContext: exportContext as any, aiNotes: 'Dibuat otomatis oleh AI' },
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('Error generating legal document:', err);
    return res.status(502).json({ success: false, error: 'Gagal membuat dokumen dengan AI. Coba lagi.' });
  }
}

export async function updateLegalDocumentField(req: AuthRequest, res: Response) {
  const { transactionId, type } = req.params;
  if (!isValidType(type)) return res.status(400).json({ success: false, error: 'Jenis dokumen tidak valid' });

  const { error } = await loadOwnedTransaction(transactionId, req.userId!);
  if (error === 404) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
  if (error === 403) return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses transaksi ini' });

  const existing = await prisma.legalDocument.findUnique({ where: { transactionId_type: { transactionId, type } } });
  if (!existing) return res.status(404).json({ success: false, error: 'Dokumen belum dibuat, generate dulu' });

  const { data: fieldUpdates } = req.body;
  if (!fieldUpdates || typeof fieldUpdates !== 'object') {
    return res.status(400).json({ success: false, error: 'Data field diperlukan' });
  }

  const merged = { ...(existing.data as object), ...fieldUpdates };
  const updated = await prisma.legalDocument.update({
    where: { transactionId_type: { transactionId, type } },
    data: { data: merged as any },
  });

  return res.json({ success: true, data: updated });
}

export async function applyVoiceEdit(req: AuthRequest, res: Response) {
  const { transactionId, type } = req.params;
  const file = req.file;
  if (!isValidType(type)) {
    if (file) fs.unlink(file.path, () => {});
    return res.status(400).json({ success: false, error: 'Jenis dokumen tidak valid' });
  }
  if (!file) return res.status(400).json({ success: false, error: 'File audio diperlukan' });

  const { error } = await loadOwnedTransaction(transactionId, req.userId!);
  if (error) {
    fs.unlink(file.path, () => {});
    if (error === 404) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses transaksi ini' });
  }

  const existing = await prisma.legalDocument.findUnique({ where: { transactionId_type: { transactionId, type } } });
  if (!existing) {
    fs.unlink(file.path, () => {});
    return res.status(404).json({ success: false, error: 'Dokumen belum dibuat, generate dulu' });
  }

  try {
    const sttResult = await transcribeAudio(file.path);
    fs.unlink(file.path, () => {});

    const corrected = await applyVoiceCorrection(type, existing.data as any, sttResult.transcript);

    const updated = await prisma.legalDocument.update({
      where: { transactionId_type: { transactionId, type } },
      data: { data: corrected as any, aiNotes: `Diedit via suara: "${sttResult.transcript}"` },
    });

    return res.json({ success: true, data: updated, transcript: sttResult.transcript });
  } catch (err) {
    if (file) fs.unlink(file.path, () => {});
    console.error('Error applying voice edit to legal document:', err);
    return res.status(502).json({ success: false, error: 'Gagal memproses koreksi suara. Coba lagi.' });
  }
}

export async function downloadLegalDocumentPdf(req: AuthRequest, res: Response) {
  const { transactionId, type } = req.params;
  if (!isValidType(type)) return res.status(400).json({ success: false, error: 'Jenis dokumen tidak valid' });

  const { error } = await loadOwnedTransaction(transactionId, req.userId!);
  if (error === 404) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
  if (error === 403) return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses transaksi ini' });

  const doc = await prisma.legalDocument.findUnique({ where: { transactionId_type: { transactionId, type } } });
  if (!doc) return res.status(404).json({ success: false, error: 'Dokumen belum dibuat, generate dulu' });

  try {
    const pdfBuffer = await renderLegalDocumentPdf(type, doc.data as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${transactionId}.pdf"`);
    res.send(pdfBuffer);

    // Fire-and-forget: cache the rendered PDF on ImageKit so future downloads
    // don't need to wait on this upload, without blocking the response above.
    uploadDocumentPdf(pdfBuffer, `${type}-${transactionId}-${Date.now()}.pdf`)
      .then((pdfUrl) =>
        prisma.legalDocument.update({ where: { transactionId_type: { transactionId, type } }, data: { pdfUrl, status: 'finalized' } }),
      )
      .catch((err) => console.error('Gagal mengunggah PDF ke ImageKit:', err));
  } catch (err) {
    console.error('Error rendering legal document PDF:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: 'Gagal membuat PDF' });
    }
  }
}
