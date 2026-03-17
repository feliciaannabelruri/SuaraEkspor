export type ProductCategory =
  | 'kerajinan'
  | 'pertanian'
  | 'tekstil'
  | 'kuliner'
  | 'tanaman'
  | 'lainnya';

export type ProductStatus = 'processing' | 'active' | 'inactive';

export interface Product {
  id: string;
  sellerId: string;
  status: ProductStatus;
  originalAudioUrl?: string;
  originalTranscript?: string;
  detectedLanguage?: string;
  photoUrls: string[];
  visionAnalysis?: VisionAnalysis;
  listings: ProductListing[];
  recommendedPriceUsd?: number;
  targetMarkets: string[];
  category?: ProductCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisionAnalysis {
  productType: string;
  condition: string;
  visualFeatures: string[];
  estimatedCategory: ProductCategory;
  confidence: number;
}

export interface ProductListing {
  language: string;
  languageCode: string;
  title: string;
  description: string;
  keywords: string[];
}