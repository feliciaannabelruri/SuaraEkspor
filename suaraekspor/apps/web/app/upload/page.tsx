'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Camera, Upload, CheckCircle, Loader } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stages = [
    { key: 'upload', label: 'Mengunggah foto...', pct: 10 },
    { key: 'stt', label: 'Memproses suara (Whisper AI)...', pct: 25 },
    { key: 'vision', label: 'Menganalisis foto (GPT-4o Vision)...', pct: 45 },
    { key: 'listing', label: 'Membuat deskripsi 6 bahasa...', pct: 65 },
    { key: 'pricing', label: 'Menghitung harga ekspor...', pct: 85 },
    { key: 'done', label: 'Selesai!', pct: 100 },
  ];

  async function handleSubmit() {
    if (photos.length === 0) { alert('Pilih minimal 1 foto'); return; }
    setProcessing(true);
    for (const s of stages) {
      setStage(s.label);
      setProgress(s.pct);
      await new Promise(r => setTimeout(r, 1200));
    }
    router.push('/product/new');
  }

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-[#F7F7F5]">
        <Loader className="animate-spin text-[#0F4A33] mb-6" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Sedang Bekerja</h2>
        <p className="text-gray-500 text-sm mb-6">{stage}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[#0F4A33] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[#0F4A33] font-bold mt-3">{progress}%</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-2 block">← Kembali</button>
        <h1 className="text-white text-xl font-bold">Daftarkan Produk</h1>
        <p className="text-[#A8D5C2] text-xs mt-1">Foto + Cerita = Listing Ekspor Otomatis</p>
      </div>

      <div className="px-5 pt-6 pb-24">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">1. Foto Produk</h2>
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center gap-2 bg-white">
            <Camera className="text-gray-400" size={32} />
            <span className="text-gray-500 text-sm font-semibold">Ambil atau Pilih Foto</span>
            <span className="text-gray-400 text-xs">JPG, PNG · Maks 10MB</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && setPhotos(Array.from(e.target.files))} />
          {photos.length > 0 && (
            <p className="text-green-700 text-sm font-semibold mt-2 flex items-center gap-1">
              <CheckCircle size={16} /> {photos.length} foto dipilih
            </p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">2. Ceritakan Produk (Opsional)</h2>
          <p className="text-gray-500 text-xs mb-3">Bicara dalam bahasa apapun — Jawa, Sunda, atau Indonesia</p>
          {!recorded ? (
            <button
              onPointerDown={() => setIsRecording(true)}
              onPointerUp={() => { setIsRecording(false); setRecorded(true); }}
              className={`w-full py-8 rounded-2xl flex flex-col items-center gap-2 font-bold text-base transition-all ${isRecording ? 'bg-red-600 text-white' : 'bg-green-100 text-[#0F4A33]'}`}>
              {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
              {isRecording ? 'Merekam... (lepas untuk berhenti)' : 'Tahan untuk Merekam'}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <p className="font-semibold text-green-900 text-sm">Rekaman siap</p>
              </div>
              <button onClick={() => setRecorded(false)} className="text-red-500 text-xs font-semibold">Hapus</button>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={photos.length === 0}
          className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-40">
          <Upload size={20} /> Proses dengan AI
        </button>
      </div>
    </div>
  );
}