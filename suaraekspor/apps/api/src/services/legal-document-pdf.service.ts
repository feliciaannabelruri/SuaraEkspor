import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { LegalDocType, LegalDocData, InvoiceData, PackingListData, CertOriginData } from '@suaraekspor/shared';

const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4
const MARGIN = 50;

interface DrawCtx {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

function line(ctx: DrawCtx, text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) {
  const size = opts.size ?? 10;
  ctx.page.drawText(text, {
    x: MARGIN,
    y: ctx.y,
    size,
    font: opts.bold ? ctx.bold : ctx.font,
    color: rgb(0.1, 0.1, 0.1),
  });
  ctx.y -= (opts.gap ?? size + 6);
}

function title(ctx: DrawCtx, text: string) {
  ctx.page.drawText(text, { x: MARGIN, y: ctx.y, size: 18, font: ctx.bold, color: rgb(0, 0.15, 0.12) });
  ctx.y -= 28;
}

function tableRow(ctx: DrawCtx, cols: string[], widths: number[], opts: { bold?: boolean } = {}) {
  let x = MARGIN;
  cols.forEach((c, i) => {
    ctx.page.drawText(c, { x, y: ctx.y, size: 9, font: opts.bold ? ctx.bold : ctx.font, color: rgb(0.1, 0.1, 0.1) });
    x += widths[i];
  });
  ctx.y -= 16;
}

async function newDoc() {
  const doc = await PDFDocument.create();
  const page = doc.addPage(PAGE_SIZE);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: DrawCtx = { page, font, bold, y: PAGE_SIZE[1] - MARGIN };
  return { doc, ctx };
}

async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const { doc, ctx } = await newDoc();
  title(ctx, 'COMMERCIAL INVOICE');
  line(ctx, `No: ${data.invoiceNumber}    Tanggal: ${data.invoiceDate}`);
  ctx.y -= 10;
  line(ctx, 'Penjual (Seller)', { bold: true });
  line(ctx, data.sellerName);
  line(ctx, data.sellerAddress, { gap: 20 });
  line(ctx, 'Pembeli (Buyer)', { bold: true });
  line(ctx, data.buyerName);
  line(ctx, `${data.buyerAddress}, ${data.buyerCountry}`, { gap: 20 });
  line(ctx, `Incoterm: ${data.incoterm}    Mata Uang: ${data.currency}`, { gap: 24 });

  const widths = [230, 60, 100, 100];
  tableRow(ctx, ['Deskripsi', 'Qty', 'Harga Satuan', 'Total'], widths, { bold: true });
  ctx.y -= 4;
  for (const item of data.items) {
    tableRow(ctx, [
      item.description,
      String(item.quantity),
      `$${item.unitPriceUsd.toFixed(2)}`,
      `$${item.totalUsd.toFixed(2)}`,
    ], widths);
  }
  ctx.y -= 10;
  line(ctx, `Subtotal: $${data.subtotalUsd.toFixed(2)}`, { bold: true });
  line(ctx, `TOTAL: $${data.totalUsd.toFixed(2)}`, { bold: true, size: 12 });

  return Buffer.from(await doc.save());
}

async function renderPackingListPdf(data: PackingListData): Promise<Buffer> {
  const { doc, ctx } = await newDoc();
  title(ctx, 'PACKING LIST');
  line(ctx, `No: ${data.packingListNumber}    Tanggal: ${data.date}`);
  ctx.y -= 10;
  line(ctx, `Penjual: ${data.sellerName}`);
  line(ctx, `Pembeli: ${data.buyerName} (${data.buyerCountry})`, { gap: 24 });

  const widths = [40, 190, 50, 90, 90];
  tableRow(ctx, ['No', 'Deskripsi', 'Qty', 'Berat Bersih', 'Dimensi'], widths, { bold: true });
  ctx.y -= 4;
  for (const pkg of data.packages) {
    tableRow(ctx, [
      String(pkg.packageNo),
      pkg.description,
      String(pkg.quantity),
      `${pkg.netWeightKg} kg`,
      pkg.dimensionsCm,
    ], widths);
  }
  ctx.y -= 10;
  line(ctx, `Total Paket: ${data.totalPackages}`, { bold: true });
  line(ctx, `Total Berat Bersih: ${data.totalNetWeightKg} kg`);
  line(ctx, `Total Berat Kotor: ${data.totalGrossWeightKg} kg`);

  return Buffer.from(await doc.save());
}

async function renderCertOriginPdf(data: CertOriginData): Promise<Buffer> {
  const { doc, ctx } = await newDoc();
  title(ctx, 'CERTIFICATE OF ORIGIN');
  line(ctx, `No: ${data.certificateNumber}    Tanggal: ${data.date}`);
  ctx.y -= 10;
  line(ctx, 'Eksportir (Exporter)', { bold: true });
  line(ctx, data.exporterName);
  line(ctx, data.exporterAddress, { gap: 20 });
  line(ctx, 'Penerima (Consignee)', { bold: true });
  line(ctx, `${data.consigneeName} — ${data.consigneeCountry}`, { gap: 20 });
  line(ctx, `Negara Asal: ${data.countryOfOrigin}`);
  line(ctx, `Pelabuhan Muat: ${data.portOfLoading}    Pelabuhan Bongkar: ${data.portOfDischarge}`);
  line(ctx, `Kode HS: ${data.hsCode}`, { gap: 20 });
  line(ctx, 'Deskripsi Barang', { bold: true });
  line(ctx, data.goodsDescription);
  line(ctx, `Kuantitas: ${data.quantity}`);

  return Buffer.from(await doc.save());
}

export async function renderLegalDocumentPdf(type: LegalDocType, data: LegalDocData): Promise<Buffer> {
  switch (type) {
    case 'commercial_invoice':
      return renderInvoicePdf(data as InvoiceData);
    case 'packing_list':
      return renderPackingListPdf(data as PackingListData);
    case 'certificate_of_origin':
      return renderCertOriginPdf(data as CertOriginData);
  }
}
