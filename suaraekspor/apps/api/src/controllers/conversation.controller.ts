import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';
import { handleBuyerMessage } from '@suaraekspor/ai-engine';
import { generateVoiceNotification } from '@suaraekspor/ai-engine';
import { uploadAudioFile } from '../services/imagekit.service';
import fs from 'fs';

export async function createConversation(req: AuthRequest, res: Response) {
  const { productId, buyerLang = 'en' } = req.body;
  if (!productId) return res.status(400).json({ success: false, error: 'productId diperlukan' });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

  const existing = await prisma.conversation.findFirst({
    where: { productId, buyerId: req.userId! },
  });
  if (existing) return res.json({ success: true, data: existing });

  const conversation = await prisma.conversation.create({
    data: { productId, sellerId: product.sellerId, buyerId: req.userId!, buyerLang },
  });
  return res.status(201).json({ success: true, data: conversation });
}

export async function listConversations(req: AuthRequest, res: Response) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: req.userId! }, { sellerId: req.userId! }] },
    include: {
      product: { include: { listings: { where: { languageCode: 'en' }, take: 1 } } },
      seller: { select: { id: true, name: true, businessName: true } },
      buyer: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json({ success: true, data: conversations });
}

export async function getConversation(req: AuthRequest, res: Response) {
  const { conversationId } = req.params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: { include: { listings: { where: { languageCode: 'en' }, take: 1 } } },
      seller: { select: { id: true, name: true, businessName: true } },
      buyer: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!conversation) return res.status(404).json({ success: false, error: 'Percakapan tidak ditemukan' });
  if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengakses percakapan ini' });
  }
  return res.json({ success: true, data: conversation });
}

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
    const localAudioPath = await generateVoiceNotification(agentResult.summaryForSeller, audioFileName);
    summaryAudioUrl = await uploadAudioFile(localAudioPath);
    fs.unlinkSync(localAudioPath);
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

  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  return res.json({
    success: true,
    data: {
      replyToBuyer: agentResult.replyToBuyer,
      summaryForSeller: agentResult.summaryForSeller,
      summaryAudioUrl,
    },
  });
}