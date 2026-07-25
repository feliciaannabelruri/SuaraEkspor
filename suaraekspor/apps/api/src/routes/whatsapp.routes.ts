import { Router, Request, Response } from 'express';
import { prisma } from '@suaraekspor/database';
import { handleWhatsappMessage, transcribeAudio, translateText } from '@suaraekspor/ai-engine';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { fonnteSendMessage } from '../services/fonnte.service';
import { uploadAudio } from '../middleware/upload.middleware';
import { env } from '../config/env';
import fs from 'fs';

const router = Router();

// Kode referensi produk yang disisipkan di pesan template tombol "Chat via WhatsApp"
// di halaman produk, contoh: "Halo, saya tertarik... [ref:cm123abc]"
const REF_TAG_REGEX = /\[ref:([a-zA-Z0-9]+)\]/;

function extractProductRef(text: string): { productId: string | null; cleanText: string } {
  const match = text.match(REF_TAG_REGEX);
  if (!match) return { productId: null, cleanText: text.trim() };
  return { productId: match[1], cleanText: text.replace(REF_TAG_REGEX, '').trim() };
}

// Fonnte's incoming-message webhook can fire for messages the platform's own
// device sends (including our own auto-replies) — Fonnte's docs explicitly warn
// that webhook handlers must filter these out themselves, otherwise a reply
// sent from this route gets delivered back here as a "new" message and the bot
// ends up replying to itself in an infinite loop (this happened in prod: one
// real buyer message produced 900+ outgoing messages).
function isFromPlatformNumber(sender: string): boolean {
  if (!env.WHATSAPP_PLATFORM_NUMBER) return false;
  const normalize = (n: string) => n.replace(/\D/g, '').replace(/^0/, '62');
  return normalize(sender) === normalize(env.WHATSAPP_PLATFORM_NUMBER);
}

// Second, independent guard against the same runaway-loop failure mode: even if
// isFromPlatformNumber() somehow misses an echoed event, this caps the unsolicited
// fallback reply to once per buyer per cooldown window instead of once per webhook hit.
const fallbackSentAt = new Map<string, number>();
const FALLBACK_COOLDOWN_MS = 5 * 60 * 1000;
function shouldSendFallback(sender: string): boolean {
  const last = fallbackSentAt.get(sender);
  const now = Date.now();
  if (last && now - last < FALLBACK_COOLDOWN_MS) return false;
  fallbackSentAt.set(sender, now);
  return true;
}

// ─── Webhook publik (dipanggil oleh Fonnte saat ada pesan WhatsApp masuk ke nomor platform) ──
// Satu nomor untuk SEMUA penjual — otentikasi lewat secret di query string, bukan per-seller.
router.post('/webhook', async (req: Request, res: Response) => {
  const secret = req.query.secret as string | undefined;
  if (!env.WHATSAPP_WEBHOOK_SECRET || !secret || secret !== env.WHATSAPP_WEBHOOK_SECRET) {
    return res.status(403).json({ success: false, error: 'Webhook tidak dikenali' });
  }

  try {
    const sender = req.body.sender || req.body.from;
    const rawMessage = req.body.message || req.body.text;
    const buyerName = req.body.name || req.body.pushname;

    if (!sender || !rawMessage) {
      return res.status(400).json({ success: false, error: 'Payload webhook tidak lengkap' });
    }

    // Echo of our own outgoing message — ignore, or every reply we send loops forever.
    if (isFromPlatformNumber(sender)) {
      return res.json({ success: true, data: null });
    }

    const { productId: refProductId, cleanText: message } = extractProductRef(rawMessage);

    let sellerId: string | null = null;
    let productId: string | null = null;

    if (refProductId) {
      const product = await prisma.product.findUnique({ where: { id: refProductId } });
      if (product) {
        sellerId = product.sellerId;
        productId = product.id;
        await prisma.whatsappThread.upsert({
          where: { buyerPhone: sender },
          update: { sellerId, productId, buyerName },
          create: { buyerPhone: sender, sellerId, productId, buyerName },
        });
      }
    }

    if (!sellerId) {
      const thread = await prisma.whatsappThread.findUnique({ where: { buyerPhone: sender } });
      if (thread) {
        sellerId = thread.sellerId;
        productId = thread.productId;
        await prisma.whatsappThread.update({ where: { buyerPhone: sender }, data: { updatedAt: new Date() } });
      }
    }

    if (!sellerId) {
      // Buyer belum pernah terhubung ke penjual manapun — kita tidak tahu ini soal produk siapa.
      if (env.FONNTE_API_KEY && shouldSendFallback(sender)) {
        await fonnteSendMessage(
          env.FONNTE_API_KEY,
          sender,
          'Hi! To chat about a specific product, please use the "Chat via WhatsApp" button on that product\'s page at SuaraEkspor. / Halo! Untuk chat soal produk tertentu, silakan klik tombol "Chat via WhatsApp" di halaman produk tersebut di SuaraEkspor.',
        ).catch((err) => console.error('Gagal kirim auto-reply fallback:', err));
      }
      return res.json({ success: true, data: null });
    }

    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    const product = productId ? await prisma.product.findUnique({
      where: { id: productId },
      include: { listings: { where: { languageCode: 'id' }, take: 1 } },
    }) : null;

    // Riwayat percakapan dengan buyer ini, supaya AI bisa mengikuti alur negosiasi
    // (harga/kuantitas yang sudah dibahas), bukan cuma menjawab pesan terakhir.
    const priorMessages = await prisma.whatsappMessage.findMany({
      where: { sellerId, buyerPhone: sender },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    const conversationHistory = priorMessages
      .slice()
      .reverse()
      .flatMap((m) => {
        const entries: { role: 'buyer' | 'seller'; text: string }[] = [
          { role: 'buyer' as const, text: m.originalText },
        ];
        if (m.status === 'approved' && m.aiReply) entries.push({ role: 'seller' as const, text: m.aiReply });
        return entries;
      });

    const agentResult = await handleWhatsappMessage({
      buyerMessage: message,
      buyerName,
      sellerLanguage: seller?.localLanguage ?? 'id',
      sellerBusinessName: seller?.businessName ?? undefined,
      conversationHistory,
    });

    const waMessage = await prisma.whatsappMessage.create({
      data: {
        sellerId,
        productId,
        buyerPhone: sender,
        buyerName,
        originalText: message,
        originalLang: agentResult.detectedBuyerLanguage,
        translatedText: agentResult.translatedText,
        aiReply: agentResult.replyToBuyer,
        status: 'pending',
      },
    });

    const productTitle = product?.listings[0]?.title;
    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'whatsapp_message',
        title: `Pesan WhatsApp baru dari ${buyerName || sender}`,
        message: productTitle ? `Soal produk "${productTitle}": ${agentResult.summaryForSeller}` : agentResult.summaryForSeller,
      },
    }).catch((err: Error) => console.error('Gagal membuat notifikasi WhatsApp:', err));

    return res.json({ success: true, data: waMessage });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return res.status(500).json({ success: false, error: 'Gagal memproses pesan WhatsApp' });
  }
});

router.use(authMiddleware);

// Status AI WhatsApp platform (global, bukan per-penjual — penjual tidak perlu setup apa pun)
router.get('/status', async (_req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: {
      configured: Boolean(env.FONNTE_API_KEY && env.WHATSAPP_PLATFORM_NUMBER),
      platformNumber: env.WHATSAPP_PLATFORM_NUMBER,
    },
  });
});

// Daftar pesan WhatsApp masuk (inbox) milik penjual
router.get('/messages', async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.whatsappMessage.findMany({
      where: { sellerId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { product: { include: { listings: { where: { languageCode: 'id' }, take: 1 } } } },
    });
    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error listing WhatsApp messages:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengambil pesan WhatsApp' });
  }
});

// Setujui & kirim balasan AI (atau versi yang sudah diedit) ke buyer
router.post('/messages/:id/approve', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!env.FONNTE_API_KEY) {
    return res.status(400).json({ success: false, error: 'WhatsApp platform belum dikonfigurasi' });
  }

  try {
    const message = await prisma.whatsappMessage.findFirst({ where: { id, sellerId: req.userId! } });
    if (!message) return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });

    const finalText = (typeof text === 'string' && text.trim()) || message.aiReply || '';
    if (!finalText) return res.status(400).json({ success: false, error: 'Balasan tidak boleh kosong' });

    await fonnteSendMessage(env.FONNTE_API_KEY, message.buyerPhone, finalText);

    const updated = await prisma.whatsappMessage.update({
      where: { id },
      data: { status: 'approved', aiReply: finalText },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error approving WhatsApp message:', error);
    return res.status(502).json({ success: false, error: 'Gagal mengirim balasan ke WhatsApp' });
  }
});

// Balas dengan kata-kata sendiri (bahasa daerah/Indonesia) — AI menerjemahkan
// ke bahasa buyer sebelum dikirim. Ini yang memungkinkan penjual bernegosiasi
// langsung tanpa perlu bisa bahasa asing, AI hanya jadi penengah/penerjemah.
router.post('/messages/:id/reply', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Teks balasan diperlukan' });
  }
  if (!env.FONNTE_API_KEY) {
    return res.status(400).json({ success: false, error: 'WhatsApp platform belum dikonfigurasi' });
  }

  try {
    const message = await prisma.whatsappMessage.findFirst({ where: { id, sellerId: req.userId! } });
    if (!message) return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });

    const seller = await prisma.user.findUnique({ where: { id: req.userId! } });
    const sellerLang = seller?.localLanguage ?? 'id';
    const buyerLang = message.originalLang ?? 'en';

    const translated = await translateText(text.trim(), buyerLang);
    await fonnteSendMessage(env.FONNTE_API_KEY, message.buyerPhone, translated);

    const updated = await prisma.whatsappMessage.update({
      where: { id },
      data: {
        status: 'approved',
        aiReply: translated,
        sellerReplyText: text.trim(),
        sellerReplyLang: sellerLang,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error sending own-words WhatsApp reply:', error);
    return res.status(502).json({ success: false, error: 'Gagal menerjemahkan/mengirim balasan ke WhatsApp' });
  }
});

// Sama seperti /reply, tapi dari voice note (STT dulu baru diterjemahkan & dikirim)
router.post('/messages/:id/reply-voice', uploadAudio.single('audio'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, error: 'File audio diperlukan' });
  if (!env.FONNTE_API_KEY) {
    fs.unlink(file.path, () => {});
    return res.status(400).json({ success: false, error: 'WhatsApp platform belum dikonfigurasi' });
  }

  try {
    const message = await prisma.whatsappMessage.findFirst({ where: { id, sellerId: req.userId! } });
    if (!message) {
      fs.unlink(file.path, () => {});
      return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });
    }

    const sttResult = await transcribeAudio(file.path);
    fs.unlink(file.path, () => {});

    const buyerLang = message.originalLang ?? 'en';
    const translated = await translateText(sttResult.transcript, buyerLang);
    await fonnteSendMessage(env.FONNTE_API_KEY, message.buyerPhone, translated);

    const updated = await prisma.whatsappMessage.update({
      where: { id },
      data: {
        status: 'approved',
        aiReply: translated,
        sellerReplyText: sttResult.transcript,
        sellerReplyLang: sttResult.detectedLanguage,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    if (file) fs.unlink(file.path, () => {});
    console.error('Error sending voice WhatsApp reply:', error);
    return res.status(502).json({ success: false, error: 'Gagal memproses/mengirim balasan suara ke WhatsApp' });
  }
});

// Tolak balasan AI (tidak dikirim ke buyer)
router.post('/messages/:id/reject', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.whatsappMessage.updateMany({
      where: { id, sellerId: req.userId! },
      data: { status: 'rejected' },
    });
    if (updated.count === 0) return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting WhatsApp message:', error);
    return res.status(500).json({ success: false, error: 'Gagal menolak pesan' });
  }
});

// Penjual konfirmasi deal (harga & ongkir sudah disepakati di chat) — di sinilah
// Transaction sungguhan pertama kali dibuat, bukan dari tombol beli instan di
// marketplace. Buyer WhatsApp belum tentu punya akun platform (cuma nomor HP),
// jadi cari/registrasi User buyer dulu — pola yang sama seperti upsert phone
// di /auth/otp/send.
router.post('/messages/:id/confirm-deal', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, agreedPriceUsd, buyerAddress, shippingCourier, shippingCost, disbursementMethod } = req.body;

  if (!quantity || !agreedPriceUsd) {
    return res.status(400).json({ success: false, error: 'Kuantitas dan harga disepakati diperlukan' });
  }

  try {
    const message = await prisma.whatsappMessage.findFirst({ where: { id, sellerId: req.userId! } });
    if (!message) return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });
    if (!message.productId) return res.status(400).json({ success: false, error: 'Pesan ini tidak terkait produk tertentu' });

    let buyer = await prisma.user.findUnique({ where: { phone: message.buyerPhone } });
    if (!buyer) {
      buyer = await prisma.user.create({
        data: { phone: message.buyerPhone, role: 'buyer', name: message.buyerName ?? undefined },
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        productId: message.productId,
        sellerId: message.sellerId,
        buyerId: buyer.id,
        quantity,
        totalUsd: agreedPriceUsd * quantity,
        status: 'order_placed',
        isSimulated: false,
        buyerAddress,
        shippingCourier,
        shippingCost,
        disbursementMethod,
      },
    });

    await prisma.notification.create({
      data: {
        userId: message.sellerId,
        type: 'new_order',
        title: 'Pesanan baru dibuat dari WhatsApp',
        message: `Deal dengan ${message.buyerName || message.buyerPhone} senilai $${transaction.totalUsd.toFixed(2)} berhasil dibuat.`,
      },
    }).catch((err: Error) => console.error('Gagal membuat notifikasi deal:', err));

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error confirming WhatsApp deal:', error);
    return res.status(500).json({ success: false, error: 'Gagal membuat pesanan' });
  }
});

export default router;
