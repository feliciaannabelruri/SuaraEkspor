'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import Link from 'next/link';
import { useMiddleman } from "../context/middleman-context";
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAIPipeline } from '@/hooks/useAIPipeline';
import apiClient from '@/lib/api-client';

// ─── Processing Stage Labels ─────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  pending: 'Menunggu antrian...',
  uploading_photos: 'Mengunggah foto...',
  stt: 'Memproses suara (Whisper AI)...',
  vision: 'Menganalisis foto (GPT-4o Vision)...',
  listing: 'Membuat deskripsi multibahasa...',
  pricing: 'Menghitung harga ekspor...',
  done: 'Selesai!',
};

const STAGE_ORDER = ['pending', 'uploading_photos', 'stt', 'vision', 'listing', 'pricing', 'done'];

export default function UploadPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  // Step 1 — Upload
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useVoiceRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Processing
  const [productId, setProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { pipelineStatus, isComplete, isError } = useAIPipeline(productId);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('se_token')) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isComplete && productId) {
      router.push('/dashboard');
    }
  }, [isComplete, productId, router]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(urls);
  }

  async function handleSubmit() {
    if (photos.length === 0) { setError('Pilih minimal 1 foto'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append('photos', p));
      if (audioBlob) formData.append('audio', audioBlob, 'voice.webm');

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

  // ── Common Layout Components ────────────────────────────────────────────────

  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#01261f] border-t border-[#83a69c]/10 flex z-50 pb-safe shadow-lg">
      {[
        { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
        { label: 'Upload', href: '/upload', icon: 'upload_file' },
        { label: 'Pesan', href: '/conversations', icon: 'forum' },
        { label: 'WhatsApp', href: '/whatsapp', icon: 'chat' },
        { label: 'Panduan', href: '/panduan', icon: 'menu_book' }
      ].map((item) => {
        const isActive = item.href === '/dashboard'
          ? (pathname === '/dashboard' || (pathname && pathname.startsWith('/product')))
          : (pathname === item.href || (pathname && pathname.startsWith(item.href)));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2.5 transition-colors relative ${
              isActive ? 'text-[#fe802f]' : 'text-[#83a69c] opacity-80 hover:opacity-100'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            {item.label === 'Pesan' && (
              <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-[#01261f]"></span>
            )}
            <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  // ── Loading Screen ───────────────────────────────────────────────────────────

  if (productId && !isComplete) {
    const stage = pipelineStatus?.stage ?? 'pending';
    const progress = pipelineStatus?.progress ?? 5;
    const activeIndex = STAGE_ORDER.indexOf(stage);
    const label = isError ? 'Terjadi kesalahan saat memproses produk.' : (STAGE_LABELS[stage] ?? 'Memproses...');

    return (
      <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden items-center justify-center">
        <main className="w-full max-w-2xl flex flex-col items-center text-center p-4 md:p-8">
          {/* AI Visual Indicator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150"></div>
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
              <span
                className={`material-symbols-outlined text-primary ${isError ? '' : 'animate-spin'}`}
                style={{ fontSize: '80px', animationDuration: '2s' }}
              >
                {isError ? 'error' : 'progress_activity'}
              </span>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="font-headline-sm text-[32px] md:text-[56px] text-primary mb-4 tracking-tight font-bold leading-tight">
            {isError ? 'Terjadi Kesalahan' : 'AI Sedang Bekerja'}
          </h1>
          <p className="font-body-md text-[16px] md:text-[18px] text-outline mb-12">
            {label}
          </p>

          {!isError && (
            <>
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
                  if (idx < activeIndex) {
                    statusClass = 'bg-outline-variant/20 text-outline'; // done
                  } else if (idx === activeIndex) {
                    statusClass = 'bg-secondary-container text-on-secondary-container shadow-sm ring-2 ring-secondary-container/20'; // active
                  } else {
                    statusClass = 'bg-surface-variant/50 text-outline/40'; // pending
                  }

                  return (
                    <div key={key} className={`px-4 py-2 rounded-full font-label-caps text-[10px] md:text-[12px] font-bold tracking-widest uppercase transition-colors ${statusClass}`}>
                      {key}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {isError && (
            <button
              onClick={() => { setProductId(null); setError(''); }}
              className="bg-secondary-container text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-colors shadow-sm"
            >
              Coba Lagi
            </button>
          )}

          {/* Contextual AI Trust Badge (Floating at bottom) */}
          {!isError && (
            <div className="fixed bottom-12 flex items-center gap-3 bg-white/80 backdrop-blur-md border border-outline-variant px-6 py-3 rounded-full shadow-sm z-50">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <span className="font-body-md text-sm text-primary font-semibold">
                AI Securing Product Integrity
              </span>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── Upload Screen (default) ──────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-56 flex flex-col bg-[#FDF0E8] min-h-screen overflow-y-auto pb-24 md:pb-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Upload Produk</h1>
            <p className="text-xs text-gray-500">Lengkapi foto & suara untuk hasil terbaik</p>
          </div>
          <div className="flex items-center gap-4">
            <MobileProfileMenu />
          </div>
        </header>

        {/* Page Title & Main Content */}
          <div className="w-full px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12">
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Produk : Upload</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Daftarkan Produk Baru</h2>
          </div>

          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {/* Left Column: Photo Upload */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-gray-800 text-sm font-bold">Foto Produk</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F4A33]/40 transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">photo_camera</span>
                  </div>
                  <span className="text-gray-700 mb-1 font-semibold text-xs">Ambil atau Pilih Foto</span>
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
                  <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                    {photoPreviews.map((url, i) => (
                      <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 md:w-20 md:h-20 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center border-dashed flex-shrink-0 hover:border-gray-400 transition-colors">
                      <span className="material-symbols-outlined text-gray-400 text-[20px]">add</span>
                    </button>
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
                    <h2 className="text-gray-800 text-sm font-bold">Ceritakan Produk (Opsional)</h2>
                    <p className="text-gray-500 text-[11px] mt-0.5">Bicara dalam bahasa apapun — Jawa, Sunda, atau Indonesia</p>
                  </div>
                </div>

                {!audioBlob ? (
                  <button
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    className={`w-full border rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative overflow-hidden group select-none touch-manipulation min-h-[140px] ${isRecording
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50/50 border-green-100 hover:bg-green-50'
                      }`}
                  >
                    {!isRecording && <div className="absolute inset-0 bg-[#0F4A33]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform ${isRecording ? 'bg-red-500 scale-110 shadow-red-500/20 text-white' : 'bg-white border border-green-200 text-[#0F4A33] group-active:scale-95'
                      }`}>
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isRecording ? 'mic_none' : 'mic'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className={`text-xs mb-1 font-bold ${isRecording ? 'text-red-700' : 'text-[#0F4A33]'}`}>
                        {isRecording ? `Merekam... ${duration}s (lepas untuk berhenti)` : 'Tahan untuk Merekam'}
                      </span>
                      {!isRecording && (
                        <p className="text-[10px] text-gray-500 font-medium px-4 mt-0.5 max-w-[250px]">
                          "Ini ukiran kayu jati asli dari Jepara, motifnya tradisional..."
                        </p>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 h-full min-h-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center text-[#0F4A33] shrink-0">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-800">Rekaman siap diproses</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{duration} detik — sistem akan mengekstrak detail produk</p>
                      </div>
                    </div>
                    <button
                      onClick={resetRecording}
                      className="px-3 py-1.5 bg-white text-red-600 rounded-md font-bold text-[11px] border border-red-200 hover:bg-red-50 transition-colors w-full sm:w-auto"
                    >
                      Hapus & Ulangi
                    </button>
                  </div>
                )}
              </section>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              {/* Bottom CTA */}
              <div className="mt-2 text-right">
                <button
                  onClick={handleSubmit}
                  disabled={photos.length === 0 || uploading}
                  className="w-full md:w-auto px-6 py-2.5 font-bold rounded-md flex justify-center items-center gap-2 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-[#0F4A33] text-white hover:bg-[#0a3323] active:scale-95 text-xs shadow-sm ml-auto"
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


          <MobileNav />
        </main>
      </div>
  );
}
