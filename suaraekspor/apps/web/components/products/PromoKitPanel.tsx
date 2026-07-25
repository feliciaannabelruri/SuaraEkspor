'use client';
import { useState } from 'react';
import apiClient from '@/lib/api-client';

interface PromoKit {
  caption: string;
  hashtags: string[];
  imageUrl: string;
}

export default function PromoKitPanel({ productId }: { productId: string }) {
  const [promoKit, setPromoKit] = useState<PromoKit | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  function handleCopy(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const { data } = await apiClient.post(`/products/${productId}/promo-kit`);
      setPromoKit(data.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Gagal membuat promo kit. Coba lagi.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!promoKit) return;
    try {
      const res = await fetch(promoKit.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promo-${productId}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh gambar promo:', err);
    }
  }

  async function handleShare() {
    if (!promoKit) return;
    const text = `${promoKit.caption}\n\n${promoKit.hashtags.map((h) => `#${h}`).join(' ')}`;
    try {
      const res = await fetch(promoKit.imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `promo-${productId}.jpg`, { type: blob.type || 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch {
      // lanjut ke fallback di bawah jika share dengan file gagal/tidak didukung
    }
    if (navigator.share) {
      await navigator.share({ text, url: promoKit.imageUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (!promoKit) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-on-surface-variant mb-4 max-w-sm mx-auto">
          AI akan buatkan caption, hashtag, dan gambar promosi siap pakai untuk Anda bagikan sendiri di Instagram/WhatsApp/Facebook.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-primary text-on-primary font-bold text-xs px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {generating ? 'Membuat dengan AI...' : '+ Buat Promo Kit'}
        </button>
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <img
        src={promoKit.imageUrl}
        alt="Gambar promosi"
        className="w-full rounded-xl border border-outline-variant/30 shadow-sm object-cover aspect-square"
      />
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] font-bold text-on-surface-variant text-label-caps">CAPTION</label>
            <button onClick={() => handleCopy(promoKit.caption, 'promo-caption')} className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">{copiedCode === 'promo-caption' ? 'check' : 'content_copy'}</span>
              {copiedCode === 'promo-caption' ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <textarea
            value={promoKit.caption}
            onChange={(e) => setPromoKit({ ...promoKit, caption: e.target.value })}
            rows={5}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-xs text-on-surface leading-relaxed resize-none focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-on-surface-variant text-label-caps mb-1 block">HASHTAG</label>
          <div className="flex flex-wrap gap-2">
            {promoKit.hashtags.map((h) => (
              <span
                key={h}
                onClick={() => handleCopy(`#${h}`, `promo-tag-${h}`)}
                className="bg-surface-container-high text-on-surface text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-outline-variant transition-colors"
              >
                #{h}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={handleDownload} className="flex items-center gap-1.5 bg-surface-container-high text-on-surface font-bold text-xs px-3 py-2 rounded-lg hover:bg-outline-variant transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span> Unduh Gambar
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 bg-primary text-on-primary font-bold text-xs px-3 py-2 rounded-lg hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[16px]">{shared ? 'check' : 'share'}</span> {shared ? 'Tersalin' : 'Bagikan'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-bold text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span> {generating ? 'Memproses...' : 'Buat Ulang'}
          </button>
        </div>
      </div>
    </div>
  );
}
