'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import Link from 'next/link';
import { useMiddleman } from "../context/middleman-context";
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAIPipeline } from '@/hooks/useAIPipeline';
import { useImageQualityCheck, PhotoQualityWarning } from '@/hooks/useImageQualityCheck';
import apiClient from '@/lib/api-client';
import ErrorState from '../../components/ui/ErrorState';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import { TRANSLATIONS } from '@/lib/translations';
import { useTranslation } from '@/hooks/useTranslation';

// ─── Processing Stage Labels ─────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  pending: 'Menunggu antrian...',
  uploading_photos: 'Mengunggah foto...',
  stt: 'Memproses suara (Whisper AI)...',
  vision: 'Menganalisis foto (Llama 4 Scout)...',
  listing: 'Membuat deskripsi multibahasa...',
  pricing: 'Menghitung harga ekspor...',
  done: 'Selesai!',
};

const STAGE_ORDER = ['pending', 'uploading_photos', 'stt', 'vision', 'listing', 'pricing', 'done'];

const LANG_FLAGS: Record<string, string> = {
  en: '🇺🇸', zh: '🇨🇳', ar: '🇸🇦', ja: '🇯🇵', de: '🇩🇪', id: '🇮🇩',
};
const LANG_NAMES: Record<string, string> = {
  en: 'English', zh: '中文', ar: 'العربية', ja: '日本語', de: 'Deutsch', id: 'Bahasa Indonesia',
};

const QUALITY_WARNING_LABELS: Record<PhotoQualityWarning, string> = {
  blurry: 'Foto buram',
  too_dark: 'Terlalu gelap',
  too_bright: 'Terlalu terang',
  no_subject: 'Objek kurang jelas',
};

export default function UploadPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  // Step 1 — Upload
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useVoiceRecorder();
  const [useTextInput, setUseTextInput] = useState(false);
  const [typedDescription, setTypedDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checking: checkingQuality, results: qualityResults, checkPhotos, clearResults: clearQualityResults } = useImageQualityCheck();

  // Step 2 — Processing
  const [productId, setProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { pipelineStatus, isComplete, isError } = useAIPipeline(productId);

  // Step 3 — Preview & Edit States
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [originalTranscript, setOriginalTranscript] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedPrice, setEditedPrice] = useState(0);
  const [editedListings, setEditedListings] = useState<any[]>([]);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { t } = useTranslation(isMiddleman && activeUMKM ? 'id' : undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('se_token')) {
        router.push('/login');
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProductDetails() {
      if (isComplete && productId) {
        try {
          const res = await apiClient.get(`/products/${productId}`);
          if (cancelled) return;
          const prod = res.data?.data;
          setAiResult(prod);
          setOriginalTranscript(prod.originalTranscript || null);
          
          const idListing = prod.listings?.find((l: any) => l.languageCode === 'id');
          setEditedTitle(idListing?.title || '');
          setEditedDesc(idListing?.description || '');
          setEditedPrice(prod.recommendedPriceUsd || 0);
          
          setEditedListings(prod.listings || []);
          setExpandedListing(prod.listings?.[0]?.languageCode || null);
        } catch (err) {
          console.error('Error fetching product details:', err);
          setError('Gagal memuat hasil analisis AI.');
        }
      }
    }
    fetchProductDetails();
    return () => { cancelled = true; };
  }, [isComplete, productId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    clearQualityResults();
    checkPhotos(files).catch((err) => console.error('Cek kualitas foto gagal:', err));
  }

  async function handleSubmit() {
    if (photos.length === 0) { setError('Pilih minimal 1 foto'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append('photos', p));
      if (useTextInput && typedDescription.trim()) {
        formData.append('description', typedDescription.trim());
      } else if (audioBlob && audioBlob.size > 0) {
        formData.append('audio', audioBlob, 'voice.webm');
      }

      const { data } = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProductId(data.data.productId);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Gagal mengunggah. Coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  function handleListingChange(code: string, field: 'title' | 'description', value: string) {
    setEditedListings(prev =>
      prev.map(l => l.languageCode === code ? { ...l, [field]: value } : l)
    );
    if (code === 'id') {
      if (field === 'title') setEditedTitle(value);
      if (field === 'description') setEditedDesc(value);
    }
  }

  function handleResetListing(code: string) {
    if (!aiResult) return;
    const original = aiResult.listings.find((l: any) => l.languageCode === code);
    if (!original) return;
    setEditedListings(prev =>
      prev.map(l => l.languageCode === code ? { ...original } : l)
    );
    if (code === 'id') {
      setEditedTitle(original.title);
      setEditedDesc(original.description);
    }
  }

  const updateMainTitle = (val: string) => {
    setEditedTitle(val);
    setEditedListings(prev =>
      prev.map(l => l.languageCode === 'id' ? { ...l, title: val } : l)
    );
  };

  const updateMainDesc = (val: string) => {
    setEditedDesc(val);
    setEditedListings(prev =>
      prev.map(l => l.languageCode === 'id' ? { ...l, description: val } : l)
    );
  };

  async function handlePublish() {
    if (!productId) return;
    setPublishing(true);
    setError('');
    try {
      await apiClient.patch(`/products/${productId}`, {
        status: 'active',
        recommendedPriceUsd: editedPrice,
        listings: editedListings.map(l => ({
          languageCode: l.languageCode,
          title: l.title,
          description: l.description
        }))
      });
      setShowPublishSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Gagal mempublikasikan produk. Coba lagi.');
      setPublishing(false);
    }
  }

  // ── Loading Screen ───────────────────────────────────────────────────────────

  if (productId && !isComplete) {
    const stage = pipelineStatus?.stage ?? 'pending';
    const progress = pipelineStatus?.progress ?? 5;
    const activeIndex = STAGE_ORDER.indexOf(stage);
    const label = STAGE_LABELS[stage] ?? 'Memproses...';

    if (isError) {
      // Use the new ErrorState component for AI Pipeline failures
      const errMessage = (pipelineStatus as any)?.pipelineError || 'Proses AI terhenti karena terjadi kesalahan pada server. Silakan ulangi upload Anda.';
      return (
        <div className="flex min-h-screen bg-background text-on-background items-center justify-center">
          <ErrorState 
            fullHeight
            title="Gagal Memproses Produk"
            message={errMessage}
            onRetry={() => { setProductId(null); setError(''); }}
          />
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden items-center justify-center">
        <main className="w-full max-w-2xl flex flex-col items-center text-center p-4 md:p-8">
          {/* AI Visual Indicator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150"></div>
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
              <span
                className="material-symbols-outlined text-primary animate-spin"
                style={{ fontSize: '80px', animationDuration: '2s' }}
              >
                progress_activity
              </span>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="font-headline-sm text-[32px] md:text-[56px] text-primary mb-4 tracking-tight font-bold leading-tight">
            AI Sedang Bekerja
          </h1>
          <p className="font-body-md text-[16px] md:text-[18px] text-outline mb-12">
            {label}
          </p>

          {/* Progress Section */}
          <div className="w-full bg-surface-variant/30 rounded-full h-4 mb-3 relative overflow-hidden shadow-[0_0_15px_rgba(1,38,31,0.1)]">
            <div
              className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="font-label-caps text-[12px] text-primary tracking-widest mb-16 font-bold uppercase">
            {progress}% SELESAI
          </div>

          {/* Process Stepper/Pills */}
          <div className="flex flex-wrap justify-center gap-3 max-w-xl">
            {STAGE_ORDER.map((key, idx) => {
              let statusClass = '';
              let style: React.CSSProperties = {};

              if (idx < activeIndex) {
                // Completed — subtle green
                statusClass = 'bg-primary-fixed text-primary font-bold';
              } else if (idx === activeIndex) {
                // Active — animated gradient cycling through orange → green → orange
                statusClass = 'text-white font-bold shadow-lg ring-2 ring-secondary-container/40 animate-pulse';
                style = {
                  background: 'linear-gradient(90deg, #fe802f, #01261f, #fe802f)',
                  backgroundSize: '200% 100%',
                  animation: 'colorShift 2s linear infinite',
                };
              } else {
                // Upcoming — dimmed
                statusClass = 'bg-surface-variant/50 text-outline/40';
              }

              return (
                <div
                  key={key}
                  className={`px-4 py-2 rounded-full font-label-caps text-[10px] md:text-[12px] tracking-widest uppercase transition-all duration-500 ${statusClass}`}
                  style={style}
                >
                  {key}
                </div>
              );
            })}
          </div>

          {/* Inject keyframe animation */}
          <style>{`
            @keyframes colorShift {
              0%   { background-position: 0% 50%; }
              50%  { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>

          {/* Contextual AI Trust Badge (Floating at bottom) */}
          <div className="fixed bottom-12 flex items-center gap-3 bg-white/80 backdrop-blur-md border border-outline-variant px-6 py-3 rounded-full shadow-sm z-50">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <span className="font-body-md text-sm text-primary font-semibold">
              AI Securing Product Integrity
            </span>
          </div>
        </main>
      </div>
    );
  }

  // ── Preview & Edit Screen ────────────────────────────────────────────────────

  if (aiResult) {
    return (
      <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-56 bg-background min-h-screen flex flex-col overflow-y-auto pb-24 md:pb-0">

          {/* ── MODAL: Publish Success ── */}
          {showPublishSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center animate-[fadeInScale_0.25s_ease-out]">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-primary text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Produk Berhasil Dipublish! 🎉</h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Produk <span className="font-semibold text-gray-700">{editedTitle}</span> sudah aktif di marketplace dan bisa dilihat oleh buyer internasional.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-primary text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Lihat di Dashboard
                </button>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="w-full mt-2 bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  Lihat di Marketplace
                </button>
              </div>
            </div>
          )}

          {/* ── MODAL: Konfirmasi Upload Ulang ── */}
          {showDiscardConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-amber-500 text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <h2 className="text-base font-bold text-gray-800 mb-1.5">Upload Ulang Produk?</h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Semua hasil AI dan editan yang sudah Anda buat akan <span className="font-semibold text-red-500">hilang</span>. Produk yang belum dipublish tidak akan disimpan.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => { setShowDiscardConfirm(false); setAiResult(null); setProductId(null); setPhotos([]); setPhotoPreviews([]); clearQualityResults(); }}
                    className="w-full bg-error text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                  >
                    Ya, Upload Ulang
                  </button>
                  <button
                    onClick={() => setShowDiscardConfirm(false)}
                    className="w-full bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top Navbar */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
            <div>
              <h1 className="text-sm font-bold text-gray-800">Upload Produk</h1>
              <p className="text-xs text-gray-500">Cek Hasil AI</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowDiscardConfirm(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Upload Ulang
              </button>
              <button onClick={() => setShowDiscardConfirm(true)} className="md:hidden relative p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
              </button>
              <MobileProfileMenu />
            </div>
          </header>

          <div className="px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12 max-w-[1440px] mx-auto w-full flex-1 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-[10px] text-gray-500 font-medium mb-1">Upload : Review</div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Cek & Edit Hasil AI</h1>
                <p className="text-xs md:text-sm text-gray-500">Pastikan semua informasi sudah benar sebelum dipublish.</p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">

                {/* Section: FOTO YANG DIUPLOAD */}
                <section className="mb-6">
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-3 uppercase">FOTO YANG DIUPLOAD</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {photoPreviews.map((url, i) => (
                      <div key={i} className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section: VOICE NOTE & TRANSKRIPSI */}
                <section className="mb-6">
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-3 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">mic</span> VOICE NOTE & TRANSKRIPSI
                  </h3>
                  {originalTranscript ? (
                    <div className="bg-primary-fixed-dim/10 border border-primary-fixed rounded-xl p-4 space-y-3">
                      {/* Audio Player */}
                      {aiResult?.originalAudioUrl && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-primary-fixed shadow-sm">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow">
                            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Voice Note Anda</p>
                            <p className="text-[11px] text-gray-500">Rekaman asli yang digunakan AI</p>
                          </div>
                          <audio
                            controls
                            src={aiResult.originalAudioUrl}
                            className="h-8 max-w-[160px] md:max-w-[220px]"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                        </div>
                      )}
                      {/* Transcript */}
                      <div className="flex gap-3">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Hasil Transkripsi Whisper AI</p>
                          <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{originalTranscript}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start">
                      <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">mic_off</span>
                      <div>
                        <p className="text-xs font-bold text-amber-700 mb-0.5">Tidak ada voice note</p>
                        <p className="text-[11px] text-amber-600 leading-relaxed">AI menghasilkan deskripsi hanya dari analisis foto. Untuk hasil yang lebih personal dan akurat, rekam voice note di upload berikutnya.</p>
                      </div>
                    </div>
                  )}
                </section>


                {/* Section: INFORMASI PRODUK */}
                <section className="mb-6">
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-4 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">edit_note</span> INFORMASI PRODUK
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-1.5 uppercase">Nama Produk (Indonesia)</label>
                      <input
                        value={editedTitle}
                        onChange={e => updateMainTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-semibold text-gray-800"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-1.5 uppercase">Deskripsi (Indonesia)</label>
                      <textarea
                        value={editedDesc}
                        onChange={e => updateMainDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700 resize-none font-body-md"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-1.5 uppercase">Harga Ekspor</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">$</span>
                          <input
                            value={editedPrice}
                            onChange={e => setEditedPrice(Number(e.target.value))}
                            type="number"
                            className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 pl-7 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-bold text-gray-800"
                          />
                        </div>
                      </div>
                      
                      {/* AI Price Rationale Tip */}
                      <div className="bg-amber-50 rounded-md p-3 flex gap-2 border border-amber-100 items-start">
                        <span className="material-symbols-outlined text-amber-500 mt-0.5 text-[16px]">lightbulb</span>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          AI menyarankan rentang harga ekspor yang paling optimal berdasarkan analisis visual produk dan data pasar sejenis.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section: CEK AKURASI TERJEMAHAN */}
                <section>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">language</span> EDIT LISTING MULTIBAHASA AI
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                    {editedListings.map(listing => {
                      const flag = LANG_FLAGS[listing.languageCode.toLowerCase()] || '🌐';
                      const langName = listing.languageName || LANG_NAMES[listing.languageCode.toLowerCase()] || listing.languageCode.toUpperCase();
                      const isExpanded = expandedListing === listing.languageCode;

                      return (
                        <div key={listing.languageCode} className="flex flex-col">
                          <button
                            onClick={() => setExpandedListing(isExpanded ? null : listing.languageCode)}
                            className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-base">{flag}</span>
                              <span className="text-sm font-bold text-gray-700 truncate pr-2 flex-1">{langName} Translation</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="bg-primary/10 text-primary font-bold text-[9px] px-2 py-0.5 rounded">
                                {listing.languageCode.toUpperCase()}
                              </span>
                              <span className="material-symbols-outlined text-gray-300 text-[18px] ml-1">
                                {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                              </span>
                            </div>
                          </button>

                          {/* Expandable Form */}
                          {isExpanded && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-3">
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Judul Terjemahan ({listing.languageCode.toUpperCase()})</label>
                                <input
                                  value={listing.title}
                                  onChange={e => handleListingChange(listing.languageCode, 'title', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors text-gray-800 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Deskripsi Terjemahan ({listing.languageCode.toUpperCase()})</label>
                                <textarea
                                  value={listing.description}
                                  onChange={e => handleListingChange(listing.languageCode, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors text-gray-700 resize-none font-body-md"
                                />
                              </div>
                              <button
                                onClick={() => handleResetListing(listing.languageCode)}
                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-primary transition-colors font-semibold"
                              >
                                <span className="material-symbols-outlined text-[14px]">restart_alt</span> Reset ke hasil AI awal
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto w-full px-4 md:px-8 mb-4">
              <div className="bg-error-container/20 text-error px-4 py-3 rounded-lg text-sm border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            </div>
          )}

          {/* Floating CTA */}
          <div className="fixed bottom-20 md:bottom-6 left-0 md:left-56 right-0 flex justify-center z-50 px-4 md:px-0 pointer-events-none">
            <button
              onClick={handlePublish}
              disabled={publishing || !editedTitle.trim()}
              className="pointer-events-auto w-full md:w-auto bg-primary text-white font-bold text-xs md:text-sm px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-full shadow-lg md:hover:scale-105 active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {publishing ? (
                <><span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span> Publishing...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">rocket_launch</span> Publish ke Marketplace</>
              )}
            </button>
          </div>
          
          <MobileBottomNav unreadMessagesCount={3} />
        </main>
      </div>
    );
  }

  // ── Upload Screen (default) ──────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-56 flex flex-col bg-background min-h-screen overflow-y-auto pb-24 md:pb-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">{t('sbUpload')}</h1>
            <p className="text-xs text-gray-500">Lengkapi foto & suara untuk hasil terbaik</p>
          </div>
          <div className="flex items-center gap-4">
            <MobileProfileMenu />
          </div>
        </header>

        {/* Page Title & Main Content */}
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12 max-w-[1440px] mx-auto flex-1">
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Produk : Upload</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t('ulTitle')}</h2>
          </div>

          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {/* Left Column: Photo Upload */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-gray-800 text-sm font-bold">{t('tblName')}</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">photo_camera</span>
                  </div>
                  <span className="text-gray-700 mb-1 font-semibold text-xs">{t('ulDragDrop')}</span>
                  <span className="text-gray-400 text-[10px]">JPG, PNG · Maks 10MB</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handlePhotoChange}
                />

                {photoPreviews.length > 0 ? (
                  <div className="mt-2">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {photoPreviews.map((url, i) => {
                        const quality = qualityResults[i];
                        const hasWarnings = !!quality?.warnings.length;
                        return (
                          <div key={i} className="relative w-16 h-16 md:w-20 md:h-20 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                            {checkingQuality && !quality && (
                              <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                                <span className="material-symbols-outlined text-gray-400 text-[16px] animate-spin">progress_activity</span>
                              </span>
                            )}
                            {quality && (
                              <span
                                className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white ${hasWarnings ? 'bg-amber-500' : 'bg-primary'}`}
                                title={hasWarnings ? quality.warnings.map(w => QUALITY_WARNING_LABELS[w]).join(', ') : 'Kualitas foto baik'}
                              >
                                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {hasWarnings ? 'priority_high' : 'check'}
                                </span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                      <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 md:w-20 md:h-20 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center border-dashed flex-shrink-0 hover:border-gray-400 transition-colors">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">add</span>
                      </button>
                    </div>

                    {/* On-device photo quality feedback (runs locally in the browser, no upload needed) */}
                    {checkingQuality && (
                      <p className="text-[10px] text-gray-400 mt-1.5">Memeriksa kualitas foto di perangkat Anda...</p>
                    )}
                    {!checkingQuality && Object.values(qualityResults).some(q => q.warnings.length > 0) && (
                      <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 items-start">
                        <span className="material-symbols-outlined text-amber-500 text-[16px] shrink-0 mt-0.5">warning</span>
                        <div className="text-[11px] text-amber-700 leading-relaxed">
                          <p className="font-bold mb-0.5">Beberapa foto perlu diperbaiki:</p>
                          <ul className="space-y-0.5">
                            {photoPreviews.map((_, i) => {
                              const warnings = qualityResults[i]?.warnings ?? [];
                              if (!warnings.length) return null;
                              return (
                                <li key={i}>Foto {i + 1}: {warnings.map(w => QUALITY_WARNING_LABELS[w]).join(', ')}</li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center border-dashed">
                        <span className="material-symbols-outlined text-gray-300 text-[20px]">add</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Voice/Story and CTA */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-gray-800 text-sm font-bold">{t('ulVoiceTitle')}</h2>
                    <p className="text-gray-500 text-[11px] mt-0.5">{t('ulSubtitle')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseTextInput((v) => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {useTextInput ? 'mic' : 'keyboard'}
                    </span>
                    {useTextInput ? 'Rekam suara' : 'Ketik saja'}
                  </button>
                </div>

                {useTextInput ? (
                  <textarea
                    value={typedDescription}
                    onChange={(e) => setTypedDescription(e.target.value)}
                    placeholder='Contoh: "Ini ukiran kayu jati asli dari Jepara, motifnya tradisional..."'
                    rows={5}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700 resize-none min-h-[140px]"
                  />
                ) : !audioBlob ? (
                  <button
                    onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startRecording(); }}
                    onPointerUp={stopRecording}
                    onPointerCancel={stopRecording}
                    className={`w-full border rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative overflow-hidden group select-none touch-manipulation min-h-[140px] ${isRecording
                        ? 'bg-error-container/20 border-error-container'
                        : 'bg-primary-fixed-dim/10 border-primary-fixed hover:bg-primary-fixed-dim/20'
                      }`}
                  >
                    {!isRecording && <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform ${isRecording ? 'bg-error scale-110 shadow-error/20 text-white' : 'bg-white border border-primary-fixed-dim text-primary group-active:scale-95'
                      }`}>
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isRecording ? 'mic_none' : 'mic'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className={`text-xs mb-1 font-bold ${isRecording ? 'text-error' : 'text-primary'}`}>
                        {isRecording ? `${t('ulRecording')} (${duration}s)` : 'Tahan untuk Merekam'}
                      </span>
                      {!isRecording && (
                        <p className="text-[10px] text-gray-500 font-medium px-4 mt-0.5 max-w-[250px]">
                          "Ini ukiran kayu jati asli dari Jepara, motifnya tradisional..."
                        </p>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full bg-primary-fixed-dim/10 border border-primary-fixed rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 h-full min-h-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-primary-fixed flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-800">Rekaman siap diproses</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{duration} detik — sistem akan mengekstrak detail produk</p>
                      </div>
                    </div>
                    <button
                      onClick={resetRecording}
                      className="px-3 py-1.5 bg-white text-error rounded-md font-bold text-[11px] border border-error/20 hover:bg-error-container/30 transition-colors w-full sm:w-auto"
                    >
                      Hapus & Ulangi
                    </button>
                  </div>
                )}
              </section>

              {error && (
                <div className="bg-error-container/20 text-error px-4 py-3 rounded-lg text-sm border border-error/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-2 text-right">
                <button
                  onClick={handleSubmit}
                  disabled={photos.length === 0 || uploading}
                  className="w-full md:w-auto px-6 py-2.5 font-bold rounded-md flex justify-center items-center gap-2 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-primary text-white hover:opacity-90 active:scale-95 text-xs shadow-sm ml-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  {uploading ? 'Mengunggah...' : 'Proses dengan AI'}
                </button>
                <p className="mt-2 text-[10px] text-gray-500">
                  AI akan menerjemahkan ke 6 Bahasa & optimasi otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <MobileBottomNav unreadMessagesCount={3} />
      </main>
    </div>
  );
}
