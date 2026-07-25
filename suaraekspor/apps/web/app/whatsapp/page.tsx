'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMiddleman } from "../context/middleman-context";
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import apiClient from '@/lib/api-client';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

type WaMessage = {
  id: string;
  buyerPhone: string;
  buyerName: string | null;
  originalText: string;
  translatedText: string | null;
  aiReply: string | null;
  sellerReplyText: string | null;
  sellerReplyLang: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  product?: { listings?: { title: string }[] } | null;
};

type WaStatus = {
  configured: boolean;
  platformNumber?: string;
};

export default function WhatsAppPage() {
  usePathname();
  useMiddleman();

  const [status, setStatus] = useState<WaStatus>({ configured: false });
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Balas dengan kata-kata sendiri (bahasa daerah/Indonesia) — AI menerjemahkan sebelum dikirim
  const [ownReplyId, setOwnReplyId] = useState<string | null>(null);
  const [ownReplyText, setOwnReplyText] = useState('');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useVoiceRecorder();
  const pendingVoiceIdRef = useRef<string | null>(null);

  // Konfirmasi deal — dibuat setelah nego harga & ongkir selesai di chat, di sinilah Transaction sungguhan pertama kali dibuat
  const [dealId, setDealId] = useState<string | null>(null);
  const [dealForm, setDealForm] = useState({ quantity: '1', agreedPriceUsd: '', buyerAddress: '', shippingCourier: '', shippingCost: '', disbursementMethod: 'bank_transfer' });
  const [dealBusy, setDealBusy] = useState(false);
  const [dealError, setDealError] = useState('');
  const [dealSuccessId, setDealSuccessId] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiClient.get('/whatsapp/status');
      if (res.data.success) setStatus(res.data.data);
    } catch (err) {
      console.error('Gagal mengambil status WhatsApp:', err);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiClient.get('/whatsapp/messages');
      if (res.data.success) setMessages(res.data.data);
    } catch (err) {
      console.error('Gagal mengambil pesan WhatsApp:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchMessages()]);
      setLoading(false);
    })();
  }, [fetchStatus, fetchMessages]);

  async function handleApprove(id: string, overrideText?: string) {
    setBusyId(id);
    try {
      const res = await apiClient.post(`/whatsapp/messages/${id}/approve`, overrideText ? { text: overrideText } : {});
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === id ? res.data.data : m));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Gagal mengirim balasan WhatsApp:', err);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await apiClient.post(`/whatsapp/messages/${id}/reject`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
    } catch (err) {
      console.error('Gagal menolak pesan WhatsApp:', err);
    } finally {
      setBusyId(null);
    }
  }

  function openDealForm(msg: WaMessage) {
    setDealId(msg.id);
    setDealForm({ quantity: '1', agreedPriceUsd: '', buyerAddress: '', shippingCourier: '', shippingCost: '', disbursementMethod: 'bank_transfer' });
    setDealError('');
  }

  async function handleConfirmDeal(id: string) {
    const quantity = Number(dealForm.quantity);
    const agreedPriceUsd = Number(dealForm.agreedPriceUsd);
    if (!quantity || !agreedPriceUsd) {
      setDealError('Kuantitas dan harga disepakati harus diisi');
      return;
    }
    setDealBusy(true);
    setDealError('');
    try {
      await apiClient.post(`/whatsapp/messages/${id}/confirm-deal`, {
        quantity,
        agreedPriceUsd,
        buyerAddress: dealForm.buyerAddress || undefined,
        shippingCourier: dealForm.shippingCourier || undefined,
        shippingCost: dealForm.shippingCost ? Number(dealForm.shippingCost) : undefined,
        disbursementMethod: dealForm.disbursementMethod || undefined,
      });
      setDealId(null);
      setDealSuccessId(id);
      setTimeout(() => setDealSuccessId(null), 4000);
    } catch (err: any) {
      setDealError(err.response?.data?.error ?? 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setDealBusy(false);
    }
  }

  function handleEdit(msg: WaMessage) {
    setEditingId(msg.id);
    setEditText(msg.aiReply ?? '');
  }

  function openOwnReply(msg: WaMessage) {
    setOwnReplyId(msg.id);
    setOwnReplyText('');
  }

  async function handleSendOwnReply(id: string) {
    if (!ownReplyText.trim()) return;
    setBusyId(id);
    try {
      const res = await apiClient.post(`/whatsapp/messages/${id}/reply`, { text: ownReplyText.trim() });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === id ? res.data.data : m));
        setOwnReplyId(null);
        setOwnReplyText('');
      }
    } catch (err) {
      console.error('Gagal mengirim balasan sendiri:', err);
    } finally {
      setBusyId(null);
    }
  }

  async function handleStartVoiceReply(id: string) {
    setRecordingId(id);
    pendingVoiceIdRef.current = id;
    try {
      await startRecording();
    } catch {
      setRecordingId(null);
      pendingVoiceIdRef.current = null;
    }
  }

  useEffect(() => {
    if (!audioBlob || !pendingVoiceIdRef.current) return;
    const id = pendingVoiceIdRef.current;
    pendingVoiceIdRef.current = null;
    setRecordingId(null);
    (async () => {
      setBusyId(id);
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'reply.webm');
        const res = await apiClient.post(`/whatsapp/messages/${id}/reply-voice`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setMessages(prev => prev.map(m => m.id === id ? res.data.data : m));
        }
      } catch (err) {
        console.error('Gagal mengirim balasan suara:', err);
      } finally {
        setBusyId(null);
        resetRecording();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const filtered = messages.filter(m => activeFilter === 'all' ? true : m.status === activeFilter);
  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">WhatsApp</h1>
            <p className="text-xs text-gray-500">AI Middleman SuaraEkspor</p>
          </div>
          <div className="flex items-center gap-4">
            {/* STATUS AI WHATSAPP PLATFORM */}
            <div className="bg-white border border-gray-200 rounded-md py-1.5 px-2.5 sm:px-3 flex items-center gap-2 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${status.configured ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></span>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                {status.configured ? 'AI WhatsApp Aktif' : 'Belum Dikonfigurasi'}
              </span>
            </div>
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1440px] mx-auto w-full flex-1 space-y-6">

          {/* INFO BANNER — tidak ada aksi connect, ini otomatis */}
          <div className="bg-[#f0faf5] border border-primary/30 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">smart_toy</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-primary text-sm">AI WhatsApp Middleman SuaraEkspor</p>
              <p className="text-xs text-gray-600 mt-1">
                Buyer chat lewat tombol <b>&ldquo;Chat via WhatsApp&rdquo;</b> di halaman produk Anda — otomatis masuk ke sini,
                sudah diterjemahkan AI. Anda tidak perlu setup atau menghubungkan nomor WhatsApp apa pun.
              </p>
              {!status.configured && (
                <p className="text-xs text-red-500 mt-2">
                  Fitur ini belum aktif dari sisi platform — hubungi admin SuaraEkspor.
                </p>
              )}
            </div>
          </div>

          {/* HEADER ROW */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : WhatsApp</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">WhatsApp Integration</h1>
              <p className="text-xs md:text-sm text-gray-500">Sinkronisasi pesan global otomatis dengan teknologi AI.</p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{pendingCount}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Menunggu</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{messages.length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Pesan WA</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{messages.filter(m => m.status === 'approved').length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Disetujui</p>
              </div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap border transition-colors ${
                    activeFilter === f
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'pending' ? 'Pending' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="bg-background overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 bg-background flex flex-col gap-4">
              {loading && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm font-bold">Memuat...</p>
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">chat_bubble</span>
                  <p className="text-sm font-bold">Belum ada pesan masuk</p>
                </div>
              )}

              {filtered.map((msg) => (
                <div key={msg.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${msg.status === 'rejected' ? 'opacity-60' : ''}`}>

                  {/* Header */}
                  <div className="p-4 md:p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-[16px]">{(msg.buyerName || msg.buyerPhone).charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-[15px] font-bold text-gray-800 leading-tight">{msg.buyerName || msg.buyerPhone}</h4>
                            {msg.status === 'pending' && <span className="px-2 py-0.5 bg-gray-200 text-on-background rounded-full text-[9px] font-bold uppercase tracking-wider">High Priority</span>}
                            <span className="px-2 py-0.5 bg-tertiary-fixed text-tertiary rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">bolt</span> AI Translated
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <span className="material-symbols-outlined text-[12px]">public</span>
                            <span className="text-[11px] font-medium">{msg.buyerPhone} &bull; {new Date(msg.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                          {msg.product?.listings?.[0]?.title && (
                            <div className="flex items-center gap-1 text-primary mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                              <span className="text-[11px] font-semibold">{msg.product.listings[0].title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Grid (Responsive) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">PESAN ASLI</p>
                        <p className="text-sm italic text-gray-700">"{msg.originalText}"</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">TERJEMAHAN AI</p>
                        <p className="text-sm text-gray-800">"{msg.translatedText}"</p>
                      </div>
                      <div className="bg-[#f0faf5] p-4 rounded-lg border-l-4 border-primary flex flex-col">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">BALASAN AI (SARAN)</p>
                        {editingId === msg.id ? (
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full text-sm text-gray-800 bg-white border border-primary/30 rounded-lg p-2.5 resize-none focus:outline-none focus:border-primary flex-1 min-h-[80px]"
                          />
                        ) : (
                          <p className="text-sm text-gray-800">"{msg.aiReply}"</p>
                        )}
                      </div>
                    </div>

                    {/* Balas dengan kata-kata sendiri (bahasa daerah/Indonesia) */}
                    {msg.status === 'pending' && (
                      <div className="mt-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
                        {ownReplyId === msg.id ? (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Balas Dengan Kata-Katamu Sendiri (akan diterjemahkan otomatis)</p>
                            <textarea
                              value={ownReplyText}
                              onChange={e => setOwnReplyText(e.target.value)}
                              placeholder="Tulis balasan dalam Bahasa Indonesia / bahasa daerah..."
                              className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:border-primary min-h-[70px]"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleSendOwnReply(msg.id)}
                                disabled={busyId === msg.id || !ownReplyText.trim()}
                                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[14px]">translate</span> Terjemahkan & Kirim
                              </button>
                              <button
                                onClick={() => { setOwnReplyId(null); setOwnReplyText(''); }}
                                className="text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => openOwnReply(msg)}
                              className="flex items-center gap-1.5 text-gray-600 hover:text-primary font-bold text-[13px] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">keyboard</span> Balas Sendiri (Teks)
                            </button>
                            {recordingId === msg.id ? (
                              <button
                                onClick={stopRecording}
                                className="flex items-center gap-1.5 text-red-500 font-bold text-[13px] animate-pulse"
                              >
                                <span className="material-symbols-outlined text-[16px]">stop_circle</span> Stop ({duration}s)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartVoiceReply(msg.id)}
                                disabled={isRecording || busyId === msg.id}
                                className="flex items-center gap-1.5 text-gray-600 hover:text-primary font-bold text-[13px] transition-colors disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[16px]">mic</span> Balas Sendiri (Suara)
                              </button>
                            )}
                            <span className="text-[10px] text-gray-400">Bicara/ketik pakai bahasa daerah, AI yang menerjemahkan ke bahasa buyer</span>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.status === 'approved' && msg.sellerReplyText && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 text-[11px] text-gray-500">
                        <span className="font-bold uppercase tracking-wider">Kata asli penjual: </span>"{msg.sellerReplyText}"
                      </div>
                    )}

                    {/* Konfirmasi Deal — setelah harga & ongkir disepakati di chat */}
                    {msg.product && (
                      <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                        {dealSuccessId === msg.id ? (
                          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Pesanan dibuat! Cek di halaman Transaksi.
                          </p>
                        ) : dealId === msg.id ? (
                          <div className="space-y-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Konfirmasi Deal (harga & ongkir sudah disepakati di chat)</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Kuantitas</label>
                                <input type="number" min={1} value={dealForm.quantity} onChange={e => setDealForm({ ...dealForm, quantity: e.target.value })} className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-primary" />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Harga Disepakati (USD)</label>
                                <input type="number" min={0} step="0.01" value={dealForm.agreedPriceUsd} onChange={e => setDealForm({ ...dealForm, agreedPriceUsd: e.target.value })} className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-primary" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Alamat Pembeli</label>
                              <textarea value={dealForm.buyerAddress} onChange={e => setDealForm({ ...dealForm, buyerAddress: e.target.value })} rows={2} placeholder="Alamat lengkap dari chat buyer..." className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Cek Ongkir (buka di tab baru, lalu isi hasilnya di bawah)</label>
                              <div className="flex flex-wrap gap-2">
                                <a href="https://www.jne.co.id/id/tracking/tarif" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">JNE →</a>
                                <a href="https://www.jet.co.id/tracking" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">J&T →</a>
                                <a href="https://sicepat.com/checkPrice" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">SiCepat →</a>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Kurir</label>
                                <input type="text" value={dealForm.shippingCourier} onChange={e => setDealForm({ ...dealForm, shippingCourier: e.target.value })} placeholder="mis. JNE REG" className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-primary" />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Ongkos Kirim (USD)</label>
                                <input type="number" min={0} step="0.01" value={dealForm.shippingCost} onChange={e => setDealForm({ ...dealForm, shippingCost: e.target.value })} className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-primary" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Metode Pencairan</label>
                              <select value={dealForm.disbursementMethod} onChange={e => setDealForm({ ...dealForm, disbursementMethod: e.target.value })} className="w-full text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-primary">
                                <option value="bank_transfer">Transfer Bank</option>
                                <option value="minimarket">Ambil di Minimarket</option>
                              </select>
                            </div>
                            {dealError && <p className="text-[11px] text-red-600">{dealError}</p>}
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleConfirmDeal(msg.id)} disabled={dealBusy} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">
                                {dealBusy ? 'Membuat...' : 'Buat Pesanan'}
                              </button>
                              <button onClick={() => setDealId(null)} className="text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => openDealForm(msg)} className="flex items-center gap-1.5 text-primary hover:underline font-bold text-[13px]">
                            <span className="material-symbols-outlined text-[16px]">handshake</span> Buat Pesanan (Deal)
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  {msg.status === 'pending' && (
                    <div className="px-4 py-3 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
                      <div className="flex gap-4 w-full md:w-auto order-2 md:order-1 justify-center md:justify-start">
                        {editingId !== msg.id && (
                          <>
                            <button onClick={() => handleEdit(msg)} className="flex items-center gap-1.5 text-gray-500 hover:text-primary font-bold text-[13px] transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit_note</span> Edit Respon
                            </button>
                            <button onClick={() => handleReject(msg.id)} disabled={busyId === msg.id} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-bold text-[13px] transition-colors disabled:opacity-50">
                              <span className="material-symbols-outlined text-[16px]">close</span> Tolak
                            </button>
                          </>
                        )}
                      </div>

                      <div className="w-full md:w-auto order-1 md:order-2">
                        {editingId === msg.id ? (
                          <button onClick={() => handleApprove(msg.id, editText)} disabled={busyId === msg.id} className="w-full md:w-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
                            <span className="material-symbols-outlined text-[16px]">send</span> Simpan & Kirim
                          </button>
                        ) : (
                          <button onClick={() => handleApprove(msg.id)} disabled={busyId === msg.id} className="w-full md:w-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                            <span className="material-symbols-outlined text-[16px]">send</span> Approve & Kirim
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.status === 'approved' && (
                    <div className="px-5 py-3 bg-gray-50 flex items-center justify-center md:justify-start gap-1.5 text-green-700">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <p className="text-[11px] font-bold uppercase tracking-wider">Telah Disetujui & Terkirim</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV MOBILE */}
        <MobileBottomNav />
      </main>
    </div>
  );
}
