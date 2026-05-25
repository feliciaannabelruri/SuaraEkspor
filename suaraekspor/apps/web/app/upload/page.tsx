'use client';
import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import Link from 'next/link';
import {
  Mic, MicOff, Camera, Upload, CheckCircle, Loader,
  ChevronDown, ChevronUp, Edit3, Globe,
  AlertTriangle, RotateCcw, Send
} from 'lucide-react';
import { useMiddleman } from "../context/middleman-context";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ListingItem {
  code: string;
  lang: string;
  flag: string;
  title: string;
  desc: string;
  accuracyScore: number; // 0–100, simulasi dari AI
}

interface AIResult {
  title: string;
  desc: string;
  price: number;
  priceRationale: string;
  listings: ListingItem[];
}

// ─── Dummy AI Result ──────────────────────────────────────────────────────────

const DUMMY_AI_RESULT: AIResult = {
  title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
  desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium. Setiap lembar dikerjakan oleh pengrajin berpengalaman.',
  price: 45,
  priceRationale: 'Berdasarkan harga batik tulis sejenis di Etsy dan Amazon Handmade ($38–65). Harga $45 kompetitif untuk pasar USA dan Eropa.',
  listings: [
    {
      code: 'EN', lang: 'English', flag: '🇺🇸', accuracyScore: 96,
      title: 'Handwoven Batik Pekalongan — Classic Parang Motif',
      desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric.'
    },
    {
      code: 'ZH', lang: '中文', flag: '🇨🇳', accuracyScore: 88,
      title: '手工蜡染布 — 经典巴朗图案',
      desc: '来自印度尼西亚梭罗的正宗手工蜡染布，采用天然染料，经典巴朗图案，高级莫里布料。'
    },
    {
      code: 'AR', lang: 'العربية', flag: '🇸🇦', accuracyScore: 72,
      title: 'باتيك مصنوع يدويًا من باكالونغان',
      desc: 'باتيك أصيل مرسوم باليد من باكالونغان مع نقوش باران الكلاسيكية والأصباغ الطبيعية.'
    },
    {
      code: 'JA', lang: '日本語', flag: '🇯🇵', accuracyScore: 91,
      title: 'パカロンガン手描きバティック — クラシックパラン柄',
      desc: 'インドネシア・パカロンガン産の本物の手描きバティック。天然染料を使用したクラシックなパラン模様。'
    },
    {
      code: 'DE', lang: 'Deutsch', flag: '🇩🇪', accuracyScore: 94,
      title: 'Handgezeichneter Batik aus Pekalongan — Klassisches Parang-Motiv',
      desc: 'Authentischer handgezeichneter Batik aus Pekalongan, Indonesien. Mit klassischem Parang-Motiv und Naturfarben.'
    },
    {
      code: 'ID', lang: 'Bahasa Indonesia', flag: '🇮🇩', accuracyScore: 99,
      title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
      desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium.'
    },
  ],
};

// ─── Processing Stages ───────────────────────────────────────────────────────

const STAGES = [
  { key: 'upload', label: 'Mengunggah foto...', pct: 10 },
  { key: 'stt', label: 'Memproses suara (Whisper AI)...', pct: 25 },
  { key: 'vision', label: 'Menganalisis foto (GPT-4o Vision)...', pct: 45 },
  { key: 'listing', label: 'Membuat deskripsi 6 bahasa...', pct: 65 },
  { key: 'pricing', label: 'Menghitung harga ekspor...', pct: 85 },
  { key: 'done', label: 'Selesai!', pct: 100 },
];

export default function UploadPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  // Step 1 — Upload
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Processing
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  // Step 3 — Preview & Edit
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedPrice, setEditedPrice] = useState(0);
  const [editedListings, setEditedListings] = useState<ListingItem[]>([]);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(urls);
  }

  async function handleSubmit() {
    if (photos.length === 0) { alert('Pilih minimal 1 foto'); return; }
    setProcessing(true);
    for (const s of STAGES) {
      setStage(s.label);
      setProgress(s.pct);
      await new Promise(r => setTimeout(r, 1200));
    }
    setAiResult(DUMMY_AI_RESULT);
    setEditedTitle(DUMMY_AI_RESULT.title);
    setEditedDesc(DUMMY_AI_RESULT.desc);
    setEditedPrice(DUMMY_AI_RESULT.price);
    setEditedListings(DUMMY_AI_RESULT.listings.map(l => ({ ...l })));
    setProcessing(false);
  }

  function handleListingChange(code: string, field: 'title' | 'desc', value: string) {
    setEditedListings(prev =>
      prev.map(l => l.code === code ? { ...l, [field]: value } : l)
    );
  }

  function handleResetListing(code: string) {
    const original = DUMMY_AI_RESULT.listings.find(l => l.code === code);
    if (!original) return;
    setEditedListings(prev =>
      prev.map(l => l.code === code ? { ...original } : l)
    );
  }

  async function handlePublish() {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 1500));
    router.push('/product/new');
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

  if (processing) {
    const activeIndex = STAGES.findIndex(s => s.label === stage);

    return (
      <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden items-center justify-center">
        <main className="w-full max-w-2xl flex flex-col items-center text-center p-4 md:p-8">
          {/* AI Visual Indicator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150"></div>
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
              <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '80px', animationDuration: '2s' }}>
                progress_activity
              </span>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="font-headline-sm text-[32px] md:text-[56px] text-primary mb-4 tracking-tight font-bold leading-tight">
            AI Sedang Bekerja
          </h1>
          <p className="font-body-md text-[16px] md:text-[18px] text-outline mb-12">
            {stage}
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
            {STAGES.map((s, idx) => {
              let statusClass = '';
              if (idx < activeIndex) {
                statusClass = 'bg-outline-variant/20 text-outline'; // done
              } else if (idx === activeIndex) {
                statusClass = 'bg-secondary-container text-on-secondary-container shadow-sm ring-2 ring-secondary-container/20'; // active
              } else {
                statusClass = 'bg-surface-variant/50 text-outline/40'; // pending
              }

              return (
                <div key={s.key} className={`px-4 py-2 rounded-full font-label-caps text-[10px] md:text-[12px] font-bold tracking-widest uppercase transition-colors ${statusClass}`}>
                  {s.key}
                </div>
              );
            })}
          </div>

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
      <div className="flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-body-md overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-56 bg-[#FDF0E8] min-h-screen flex flex-col overflow-y-auto pb-24 md:pb-0">
          {/* Top Navbar */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
            <div>
              <h1 className="text-sm font-bold text-gray-800">Upload Produk</h1>
              <p className="text-xs text-gray-500">Cek Hasil AI</p>
            </div>
             <div className="flex items-center gap-4">
              <button onClick={() => setAiResult(null)} className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Upload Ulang
              </button>
              <button onClick={() => setAiResult(null)} className="md:hidden relative p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
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

              {/* Section: INFORMASI PRODUK */}
              <section className="mb-6">
                <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-4 uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">edit_note</span> INFORMASI PRODUK
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-1.5 uppercase">Nama Produk</label>
                    <input
                      value={editedTitle}
                      onChange={e => setEditedTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-[#0F4A33] focus:border-[#0F4A33] outline-none transition-all font-semibold text-gray-800"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-gray-500 mb-1.5 uppercase">Deskripsi (Indonesia)</label>
                    <textarea
                      value={editedDesc}
                      onChange={e => setEditedDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-[#0F4A33] focus:border-[#0F4A33] outline-none transition-all text-gray-700 resize-none"
                      rows={3}
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
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 pl-7 text-sm focus:bg-white focus:ring-1 focus:ring-[#0F4A33] focus:border-[#0F4A33] outline-none transition-all font-bold text-gray-800"
                        />
                      </div>
                    </div>
                    {/* AI Tip */}
                    <div className="bg-amber-50 rounded-md p-3 flex gap-2 border border-amber-100 items-start">
                      <span className="material-symbols-outlined text-amber-500 mt-0.5 text-[16px]">lightbulb</span>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {aiResult.priceRationale}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: CEK AKURASI TERJEMAHAN */}
              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">language</span> CEK AKURASI TERJEMAHAN
                  </h3>
                  <div className="flex gap-2">
                    {editedListings.filter(l => l.accuracyScore < 90).map((_, i) => (
                      <span key={i} className="bg-orange-50 text-orange-600 font-bold tracking-widest text-[9px] px-2 py-0.5 rounded-full border border-orange-200 uppercase">
                        perlu dicek
                      </span>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  {editedListings.map(listing => (
                    <div key={listing.code} className="flex flex-col">
                      <button
                        onClick={() => setExpandedListing(expandedListing === listing.code ? null : listing.code)}
                        className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="font-bold text-gray-500 w-6 text-xs">{listing.code}</span>
                          <span className="text-sm text-gray-700 truncate pr-2 flex-1">{listing.lang} Translation</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {listing.accuracyScore >= 90 ? (
                            <>
                              <span className="text-green-600 font-semibold text-xs">{listing.accuracyScore}% akurat</span>
                              <span className="material-symbols-outlined text-green-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </>
                          ) : (
                            <>
                              <span className="text-orange-500 font-semibold text-xs">{listing.accuracyScore}% — cek ulang</span>
                              <span className="material-symbols-outlined text-orange-500 text-[16px]">error</span>
                            </>
                          )}
                          <span className="material-symbols-outlined text-gray-300 text-[16px] ml-1">
                            {expandedListing === listing.code ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>

                      {/* Expandable Form */}
                      {expandedListing === listing.code && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="space-y-3">
                            <div>
                              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Judul Terjemahan</label>
                              <input
                                value={listing.title}
                                onChange={e => handleListingChange(listing.code, 'title', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#0F4A33] transition-colors text-gray-800"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Deskripsi Terjemahan</label>
                              <textarea
                                value={listing.desc}
                                onChange={e => handleListingChange(listing.code, 'desc', e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#0F4A33] transition-colors text-gray-700 resize-none"
                              />
                            </div>
                            <button
                              onClick={() => handleResetListing(listing.code)}
                              className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#0F4A33] transition-colors font-semibold"
                            >
                              <RotateCcw size={12} /> Reset ke hasil AI awal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Publish CTA removed from here - now floating */}
              </section>
            </div>
          </div>
        </div>

          {/* Floating CTA */}
          <div className="fixed bottom-20 md:bottom-6 left-0 md:left-56 right-0 flex justify-center z-50 px-4 md:px-0 pointer-events-none">
            <button
              onClick={handlePublish}
              disabled={publishing || !editedTitle.trim()}
              className="pointer-events-auto w-full md:w-auto bg-[#0F4A33] text-white font-bold text-xs md:text-sm px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-full shadow-lg md:hover:scale-105 active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {publishing ? (
                <><span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span> Publishing...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">rocket_launch</span> Publish ke Marketplace</>
              )}
            </button>
          </div>
          <MobileNav />
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

                {!recorded ? (
                  <button
                    onPointerDown={() => setIsRecording(true)}
                    onPointerUp={() => { setIsRecording(false); setRecorded(true); }}
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
                        {isRecording ? 'Merekam... Lepas untuk berhenti' : 'Tahan untuk Merekam'}
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
                        <p className="font-bold text-xs text-gray-800">Rekaman suara siap diproses</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Sistem akan mengekstrak detail produk</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRecorded(false)}
                      className="px-3 py-1.5 bg-white text-red-600 rounded-md font-bold text-[11px] border border-red-200 hover:bg-red-50 transition-colors w-full sm:w-auto"
                    >
                      Hapus & Ulangi
                    </button>
                  </div>
                )}

                <div className="mt-3 hidden lg:block border-t border-gray-100 pt-3">
                  <label className="text-gray-500 block mb-1.5 uppercase tracking-widest text-[9px] font-bold">Atau ketik deskripsi singkat</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-xs focus:border-[#0F4A33] focus:ring-1 focus:ring-[#0F4A33] outline-none min-h-[80px] resize-none text-gray-700"
                    placeholder="Contoh: Meja makan minimalis kayu mahoni tahan rayap..."
                  ></textarea>
                </div>
              </section>

              {/* Bottom CTA */}
              <div className="mt-2 text-right">
                <button
                  onClick={handleSubmit}
                  disabled={photos.length === 0}
                  className="w-full md:w-auto px-6 py-2.5 font-bold rounded-md flex justify-center items-center gap-2 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-[#0F4A33] text-white hover:bg-[#0a3323] active:scale-95 text-xs shadow-sm ml-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  Proses dengan AI
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