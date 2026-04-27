'use client';
// PATH: suaraekspor/apps/web/app/upload/page.tsx
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, Camera, Upload, CheckCircle, Loader,
  ChevronDown, ChevronUp, Edit3, Globe, DollarSign,
  AlertTriangle, RotateCcw, Send
} from 'lucide-react';

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
    { code: 'EN', lang: 'English', flag: '🇺🇸', accuracyScore: 96,
      title: 'Handwoven Batik Pekalongan — Classic Parang Motif',
      desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric.' },
    { code: 'ZH', lang: '中文', flag: '🇨🇳', accuracyScore: 88,
      title: '手工蜡染布 — 经典巴朗图案',
      desc: '来自印度尼西亚梭罗的正宗手工蜡染布，采用天然染料，经典巴朗图案，高级莫里布料。' },
    { code: 'AR', lang: 'العربية', flag: '🇸🇦', accuracyScore: 72,
      title: 'باتيك مصنوع يدويًا من باكالونغان',
      desc: 'باتيك أصيل مرسوم باليد من باكالونغان مع نقوش باران الكلاسيكية والأصباغ الطبيعية.' },
    { code: 'JA', lang: '日本語', flag: '🇯🇵', accuracyScore: 91,
      title: 'パカロンガン手描きバティック — クラシックパラン柄',
      desc: 'インドネシア・パカロンガン産の本物の手描きバティック。天然染料を使用したクラシックなパラン模様。' },
    { code: 'DE', lang: 'Deutsch', flag: '🇩🇪', accuracyScore: 94,
      title: 'Handgezeichneter Batik aus Pekalongan — Klassisches Parang-Motiv',
      desc: 'Authentischer handgezeichneter Batik aus Pekalongan, Indonesien. Mit klassischem Parang-Motiv und Naturfarben.' },
    { code: 'ID', lang: 'Bahasa Indonesia', flag: '🇮🇩', accuracyScore: 99,
      title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
      desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium.' },
  ],
};

// ─── Processing Stages ───────────────────────────────────────────────────────

const STAGES = [
  { key: 'upload',   label: 'Mengunggah foto...',                  pct: 10 },
  { key: 'stt',      label: 'Memproses suara (Whisper AI)...',     pct: 25 },
  { key: 'vision',   label: 'Menganalisis foto (GPT-4o Vision)...', pct: 45 },
  { key: 'listing',  label: 'Membuat deskripsi 6 bahasa...',       pct: 65 },
  { key: 'pricing',  label: 'Menghitung harga ekspor...',          pct: 85 },
  { key: 'done',     label: 'Selesai!',                            pct: 100 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AccuracyBadge({ score }: { score: number }) {
  if (score >= 90) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
      {score}% akurat
    </span>
  );
  if (score >= 75) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
      <AlertTriangle size={9} /> {score}% — cek ulang
    </span>
  );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
      <AlertTriangle size={9} /> {score}% — perlu koreksi
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UploadPage() {
  const router = useRouter();

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
    // Generate preview URLs
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
    // Simulate AI result
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

  // ── Loading Screen ───────────────────────────────────────────────────────────

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-[#F7F7F5]">
        <Loader className="animate-spin text-[#0F4A33] mb-6" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Sedang Bekerja</h2>
        <p className="text-gray-500 text-sm mb-6">{stage}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#0F4A33] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#0F4A33] font-bold mt-3">{progress}%</p>
      </div>
    );
  }

  // ── Preview & Edit Screen ────────────────────────────────────────────────────

  if (aiResult) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        {/* Header */}
        <div className="bg-[#0F4A33] px-5 py-5">
          <button onClick={() => setAiResult(null)} className="text-[#7EE8BC] text-sm mb-2 block">
            ← Upload Ulang
          </button>
          <h1 className="text-white text-xl font-bold">Cek & Edit Hasil AI</h1>
          <p className="text-[#A8D5C2] text-xs mt-1">
            Pastikan semua informasi sudah benar sebelum dipublish
          </p>
        </div>

        <div className="px-5 pt-5 pb-32 flex flex-col gap-4">

          {/* ── Foto Preview ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Foto yang Diupload
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photoPreviews.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                />
              ))}
            </div>
          </div>

          {/* ── Info Dasar ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Edit3 size={14} className="text-[#0F4A33]" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Informasi Produk
              </p>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-[11px] text-gray-400 font-semibold uppercase mb-1 block">
                Nama Produk
              </label>
              <input
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-semibold focus:outline-none focus:border-[#0F4A33] transition-colors"
              />
            </div>

            {/* Desc */}
            <div className="mb-3">
              <label className="text-[11px] text-gray-400 font-semibold uppercase mb-1 block">
                Deskripsi (Indonesia)
              </label>
              <textarea
                value={editedDesc}
                onChange={e => setEditedDesc(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 leading-relaxed focus:outline-none focus:border-[#0F4A33] transition-colors resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold uppercase mb-1 block">
                Harga Ekspor (USD)
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0F4A33] transition-colors">
                <span className="bg-gray-50 px-3 py-2.5 text-gray-500 text-sm font-bold border-r border-gray-200">
                  $
                </span>
                <input
                  type="number"
                  value={editedPrice}
                  onChange={e => setEditedPrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 text-sm font-bold text-[#0F4A33] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                💡 {aiResult.priceRationale}
              </p>
            </div>
          </div>

          {/* ── Cek Translate ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-100">
              <Globe size={14} className="text-[#0F4A33]" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">
                Cek Akurasi Terjemahan
              </p>
              <span className="text-[10px] text-gray-400">
                {editedListings.filter(l => l.accuracyScore < 90).length} perlu dicek
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {editedListings.map(listing => (
                <div key={listing.code}>
                  {/* Listing Header — tap to expand */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    onClick={() =>
                      setExpandedListing(
                        expandedListing === listing.code ? null : listing.code
                      )
                    }
                  >
                    <span className="text-xl flex-shrink-0">{listing.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-[#0F4A33] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {listing.code}
                        </span>
                        <span className="text-xs text-gray-400">{listing.lang}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{listing.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AccuracyBadge score={listing.accuracyScore} />
                      {expandedListing === listing.code
                        ? <ChevronUp size={14} className="text-gray-400" />
                        : <ChevronDown size={14} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* Listing Edit Form */}
                  {expandedListing === listing.code && (
                    <div className="px-4 pb-4 bg-gray-50/60 border-t border-gray-100">
                      <div className="mb-3 mt-3">
                        <label className="text-[11px] text-gray-400 font-semibold uppercase mb-1 block">
                          Judul
                        </label>
                        <input
                          value={listing.title}
                          onChange={e =>
                            handleListingChange(listing.code, 'title', e.target.value)
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-semibold focus:outline-none focus:border-[#0F4A33] transition-colors bg-white"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="text-[11px] text-gray-400 font-semibold uppercase mb-1 block">
                          Deskripsi
                        </label>
                        <textarea
                          value={listing.desc}
                          onChange={e =>
                            handleListingChange(listing.code, 'desc', e.target.value)
                          }
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed focus:outline-none focus:border-[#0F4A33] transition-colors resize-none bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleResetListing(listing.code)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <RotateCcw size={11} /> Reset ke hasil AI
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Warning jika ada akurasi rendah ─────────────────────────────── */}
          {editedListings.some(l => l.accuracyScore < 75) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Ada terjemahan yang perlu dicek</p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  Beberapa bahasa memiliki akurasi di bawah 75%. Disarankan untuk 
                  mengoreksi sebelum publish agar buyer tidak bingung.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky Publish Button ─────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 px-5 py-4">
          <button
            onClick={handlePublish}
            disabled={publishing || !editedTitle.trim()}
            className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {publishing
              ? <><Loader size={18} className="animate-spin" /> Publishing...</>
              : <><Send size={18} /> Publish ke Marketplace</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Upload Screen (default) ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-2 block">
          ← Kembali
        </button>
        <h1 className="text-white text-xl font-bold">Daftarkan Produk</h1>
        <p className="text-[#A8D5C2] text-xs mt-1">Foto + Cerita = Listing Ekspor Otomatis</p>
      </div>

      <div className="px-5 pt-6 pb-24">

        {/* ── Foto ─────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">1. Foto Produk</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center gap-2 bg-white"
          >
            <Camera className="text-gray-400" size={32} />
            <span className="text-gray-500 text-sm font-semibold">Ambil atau Pilih Foto</span>
            <span className="text-gray-400 text-xs">JPG, PNG · Maks 10MB</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handlePhotoChange}
          />

          {/* Preview thumbnail setelah foto dipilih */}
          {photoPreviews.length > 0 && (
            <div className="mt-3">
              <p className="text-green-700 text-sm font-semibold flex items-center gap-1 mb-2">
                <CheckCircle size={16} /> {photos.length} foto dipilih
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photoPreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Voice ────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">2. Ceritakan Produk (Opsional)</h2>
          <p className="text-gray-500 text-xs mb-3">
            Bicara dalam bahasa apapun — Jawa, Sunda, atau Indonesia
          </p>
          {!recorded ? (
            <button
              onPointerDown={() => setIsRecording(true)}
              onPointerUp={() => { setIsRecording(false); setRecorded(true); }}
              className={`w-full py-8 rounded-2xl flex flex-col items-center gap-2 font-bold text-base transition-all ${
                isRecording ? 'bg-red-600 text-white' : 'bg-green-100 text-[#0F4A33]'
              }`}
            >
              {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
              {isRecording ? 'Merekam... (lepas untuk berhenti)' : 'Tahan untuk Merekam'}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <p className="font-semibold text-green-900 text-sm">Rekaman siap</p>
              </div>
              <button
                onClick={() => setRecorded(false)}
                className="text-red-500 text-xs font-semibold"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={photos.length === 0}
          className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
        >
          <Upload size={20} /> Proses dengan AI
        </button>
      </div>
    </div>
  );
}