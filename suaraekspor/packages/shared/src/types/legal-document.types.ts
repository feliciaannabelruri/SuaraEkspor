export type LegalDocType = 'commercial_invoice' | 'packing_list' | 'certificate_of_origin';
export type LegalDocStatus = 'draft' | 'finalized';

// Free-text export info shared across all 3 doc types on a transaction —
// all optional since this is a best-effort UMKM-friendly generator, not a
// rigid customs system. AI fills sane defaults for anything left blank.
export interface ExportContext {
  buyerCountry?: string;
  buyerAddress?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  incoterm?: string;
  hsCode?: string;
  netWeightKg?: number;
  grossWeightKg?: number;
  dimensionsCm?: string;
  packageCount?: number;
  currency?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  buyerCountry: string;
  items: InvoiceItem[];
  subtotalUsd: number;
  totalUsd: number;
  incoterm: string;
  currency: string;
}

export interface PackingListPackage {
  packageNo: number;
  description: string;
  quantity: number;
  netWeightKg: number;
  grossWeightKg: number;
  dimensionsCm: string;
}

export interface PackingListData {
  packingListNumber: string;
  date: string;
  sellerName: string;
  buyerName: string;
  buyerCountry: string;
  packages: PackingListPackage[];
  totalPackages: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
}

export interface CertOriginData {
  certificateNumber: string;
  date: string;
  exporterName: string;
  exporterAddress: string;
  consigneeName: string;
  consigneeCountry: string;
  countryOfOrigin: string;
  portOfLoading: string;
  portOfDischarge: string;
  hsCode: string;
  goodsDescription: string;
  quantity: string;
}

export type LegalDocData = InvoiceData | PackingListData | CertOriginData;
