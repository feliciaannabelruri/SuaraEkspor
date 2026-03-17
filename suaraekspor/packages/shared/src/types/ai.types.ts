export interface STTResult {
  transcript: string;
  detectedLanguage: string;
  confidence: number;
  durationSeconds: number;
}

export interface VisionResult {
  productType: string;
  condition: string;
  visualFeatures: string[];
  estimatedCategory: string;
  suggestedKeywords: string[];
  confidence: number;
}

export interface ListingGenerationResult {
  listings: {
    languageCode: string;
    languageName: string;
    title: string;
    description: string;
    keywords: string[];
  }[];
  targetMarkets: string[];
  exportReadinessScore: number;
}

export interface PricingResult {
  recommendedPriceUsd: number;
  priceRangeUsd: { min: number; max: number };
  rationale: string;
  comparableProducts: string[];
}

export interface CommunicationAgentResult {
  replyToBuyer: string;
  replyLanguage: string;
  summaryForSeller: string;
  summaryLanguage: string;
  summaryAudioUrl?: string;
}

export interface AIPipelineStatus {
  productId: string;
  stage: 'stt' | 'vision' | 'listing' | 'pricing' | 'done' | 'error';
  progress: number;
  message: string;
  error?: string;
}