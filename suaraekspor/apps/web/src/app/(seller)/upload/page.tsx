'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Camera, Upload, CheckCircle, Loader } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAIPipeline } from '@/hooks/useAIPipeline';
import apiClient from '@/lib/api-client';

export default function UploadPage() {
  const router = useRouter();
  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useVoiceRecorder();
  const [photos, setPhotos] = useState<File[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pipelineStatus, isComplete, isError } = useAIPipeline(productId);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  }

  async function handleSubmit() {
    if (photos.length === 0) { setError('Minimal 1 foto produk diperlukan'); return; }
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

  // Setelah AI pipeline selesai, redirect ke halaman produk
  if (isComplete && productId) {
    router.push(`/products/${productId}`);
  }

  // Tampilan status AI pipeline
  if (productId && !isComplete && !isError) {
    const stageLabels: Record<string, string> = {
      pending: 'Menunggu antrian...',
      uploading_photos: 'Mengunggah foto...',
      stt: 'Memproses rekaman suara (Whisper AI)...',
      vision: 'Menganalisis foto produk (GPT-4o Vision)...',
      listing: 'Membuat deskripsi multibahasa (6 bahasa)...',
      pricing: 'Menghitung rekomendasi harga ekspor...',
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-gray-50">
        <Loader className="animate-spin text-green-700 mb-6" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Sedang Bekerja</h2>
        <p className="text-gray-500 text-sm mb-6">
          {stageLabels[pipelineStatus?.stage ?? 'pending'] ?? 'Memproses...'}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${pipelineStatus?.progress ?? 0}%` }}
          />
        </div>
        <p className="text-green-700 font-bold mt-3">{pipelineStatus?.progress ?? 0}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-green-900 px-5 py-5">
        <h1 className="text-white text-xl font-bold">Daftarkan Produk</h1>
        <p className="text-green-300 text-xs mt-1">Foto + Cerita = Listing Ekspor Otomatis</p>
      </div>

      <div className="flex-1 px-5 pt-6 pb-24">
        {/* FOTO */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">1. Foto Produk</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center gap-2 bg-white">
            <Camera className="text-gray-400" size={32} />
            <span className="text-gray-500 text-sm font-semibold">Ambil atau Pilih Foto</span>
            <span className="text-gray-400 text-xs">JPG, PNG, WebP · Maks 10MB</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoChange} />
          {photos.length > 0 && (
            <p className="text-green-700 text-sm font-semibold mt-2">
              <CheckCircle className="inline" size={16} /> {photos.length} foto dipilih
            </p>
          )}
        </div>

        {/* VOICE */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">2. Ceritakan Produk (Opsional)</h2>
          <p className="text-gray-500 text-xs mb-3">
            Bicara dalam bahasa apapun — Jawa, Sunda, Batak, atau Indonesia
          </p>
          {!audioBlob ? (
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              className={`w-full py-8 rounded-2xl flex flex-col items-center gap-2 font-bold text-base transition-all ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-green-100 text-green-900'
              }`}>
              {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
              {isRecording ? `Merekam... ${duration}s (lepas untuk berhenti)` : 'Tahan untuk Merekam'}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-green-900 text-sm">Rekaman siap</p>
                  <p className="text-green-600 text-xs">{duration} detik</p>
                </div>
              </div>
              <button onClick={resetRecording} className="text-red-500 text-xs font-semibold">Hapus</button>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={uploading || photos.length === 0}
          className="w-full bg-green-800 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50">
          <Upload size={20} />
          {uploading ? 'Mengunggah...' : 'Proses dengan AI'}
        </button>
      </div>
    </div>
  );
}