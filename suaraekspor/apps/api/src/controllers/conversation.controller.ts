import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';
import { handleBuyerMessage } from '@suaraekspor/ai-engine';
import { generateVoiceNotification } from '@suaraekspor/ai-engine';

export async function sendBuyerMessage(req: AuthRequest, res: Response) {
  const { conversationId } = req.params;
  const { message, buyerLanguage = 'en' } = req.body;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: { include: { listings: { where: { languageCode: 'en' }, take: 1 } } },
      seller: { select: { localLanguage: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!conversation) {
    return res.status(404).json({ success: false, error: 'Percakapan tidak ditemukan' });
  }

  const productTitle = conversation.product.listings[0]?.title ?? 'Produk';
  const productDesc = conversation.product.listings[0]?.description ?? '';
  const sellerLang = conversation.seller.localLanguage ?? 'id';

  // Simpan pesan buyer
  await prisma.message.create({
    data: {
      conversationId,
      senderRole: 'buyer',
      originalText: message,
      originalLang: buyerLanguage,
      aiGenerated: false,
    },
  });

  // Jalankan AI Communication Agent
const history = conversation.messages.slice().reverse().map((m: { senderRole: string; originalText: string }) => ({
    role: m.senderRole as 'buyer' | 'seller',
    text: m.originalText,
  }));

  const agentResult = await handleBuyerMessage({
    productTitle,
    productDescription: productDesc,
    buyerMessage: message,
    buyerLanguage,
    sellerLanguage: sellerLang,
    conversationHistory: history,
  });

  // Generate voice notification untuk penjual
  const audioFileName = `notify-${conversationId}-${Date.now()}.mp3`;
  let summaryAudioUrl: string | undefined;
  try {
    await generateVoiceNotification(agentResult.summaryForSeller, audioFileName);
    // Di production: upload audio ke Cloudinary, simpan URL
    summaryAudioUrl = `/tmp/suaraekspor-audio/${audioFileName}`;
  } catch (e) {
    console.warn('TTS generation failed, continuing without audio:', e);
  }

  // Simpan balasan AI
  await prisma.message.create({
    data: {
      conversationId,
      senderRole: 'seller',
      originalText: agentResult.replyToBuyer,
      originalLang: agentResult.replyLanguage,
      aiGenerated: true,
      summaryForSeller: agentResult.summaryForSeller,
      summaryAudioUrl,
    },
  });

  return res.json({
    success: true,
    data: {
      replyToBuyer: agentResult.replyToBuyer,
      summaryForSeller: agentResult.summaryForSeller,
      summaryAudioUrl,
    },
  });
}