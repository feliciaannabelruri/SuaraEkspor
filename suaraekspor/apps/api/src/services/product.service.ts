import { prisma } from '@suaraekspor/database';
import {
  transcribeAudio,
  analyzeProductPhoto,
  generateMultilingualListing,
  recommendExportPrice,
} from '@suaraekspor/ai-engine';
import { uploadProductPhoto, uploadAudioFile } from './cloudinary.service';
import fs from 'fs';

/**
 * Orkestrasi AI Pipeline lengkap:
 * Audio → STT → Vision → LLM Listing → LLM Pricing → Simpan ke DB
 * 
 * Pipeline ini dijalankan secara async setelah upload.
 * Frontend polling status via GET /products/:id/status
 */
export async function runAIPipeline(
  productId: string,
  audioFilePath: string | null,
  photoFilePaths: string[],
): Promise<void> {
  try {
    // --- STAGE 1: Upload foto ke Cloudinary ---
    await updatePipelineStage(productId, 'uploading_photos', 10);
    const photoUrls: string[] = [];
    for (const photoPath of photoFilePaths) {
      const url = await uploadProductPhoto(photoPath);
      photoUrls.push(url);
      fs.unlinkSync(photoPath); // Hapus file lokal setelah upload
    }

    await prisma.product.update({
      where: { id: productId },
      data: { photoUrls },
    });

    // --- STAGE 2: STT — Transkripsi audio ---
    let sttResult = null;
    if (audioFilePath) {
      await updatePipelineStage(productId, 'stt', 25);
      sttResult = await transcribeAudio(audioFilePath);

      const audioUrl = await uploadAudioFile(audioFilePath);
      await prisma.product.update({
        where: { id: productId },
        data: {
          originalTranscript: sttResult.transcript,
          detectedLanguage: sttResult.detectedLanguage,
          originalAudioUrl: audioUrl,
        },
      });
      fs.unlinkSync(audioFilePath);
    }

    // --- STAGE 3: Vision — Analisis foto produk ---
    await updatePipelineStage(productId, 'vision', 45);
    const visionResult = await analyzeProductPhoto(photoUrls[0]);

    await prisma.product.update({
      where: { id: productId },
      data: {
        visionAnalysis: visionResult as any,
        category: visionResult.estimatedCategory,
      },
    });

    // --- STAGE 4: LLM — Generate listing multibahasa ---
    await updatePipelineStage(productId, 'listing', 65);
    const transcript = sttResult?.transcript ?? visionResult.productType;
    const listingResult = await generateMultilingualListing(
      sttResult ?? { transcript, detectedLanguage: 'id', confidence: 0.8, durationSeconds: 0 },
      visionResult,
    );

    // Simpan setiap listing ke DB
    for (const listing of listingResult.listings) {
      await prisma.productListing.upsert({
        where: { productId_languageCode: { productId, languageCode: listing.languageCode } },
        update: listing,
        create: { productId, ...listing },
      });
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        targetMarkets: listingResult.targetMarkets,
        exportReadinessScore: listingResult.exportReadinessScore,
      },
    });

    // --- STAGE 5: LLM — Rekomendasi harga ekspor ---
    await updatePipelineStage(productId, 'pricing', 85);
    const pricingResult = await recommendExportPrice(visionResult, transcript);

    await prisma.product.update({
      where: { id: productId },
      data: {
        recommendedPriceUsd: pricingResult.recommendedPriceUsd,
        priceRangeMin: pricingResult.priceRangeUsd.min,
        priceRangeMax: pricingResult.priceRangeUsd.max,
        status: 'active',
        aiPipelineStage: 'done',
      },
    });

    console.log(`[AI Pipeline] Product ${productId} processing complete.`);
  } catch (error) {
    console.error(`[AI Pipeline] Error for product ${productId}:`, error);
    await prisma.product.update({
      where: { id: productId },
      data: { aiPipelineStage: 'error', status: 'inactive' },
    });
  }
}

async function updatePipelineStage(productId: string, stage: string, _progress: number) {
  await prisma.product.update({
    where: { id: productId },
    data: { aiPipelineStage: stage },
  });
}