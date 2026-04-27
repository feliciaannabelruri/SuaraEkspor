'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Package, MessageSquare, Check, X, Edit3, Wifi, WifiOff, ChevronRight, Send, Globe } from 'lucide-react';

type Message = {
  id: string;
  channel: 'wa' | 'inapp';
  buyer: string;
  buyerCountry: string;
  originalText: string;
  translatedText: string;
  aiReply: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
};

const dummyMessages: Message[] = [
  {
    id: '1',
    channel: 'wa',
    buyer: 'Ahmad Faruq',
    buyerCountry: 'Malaysia',
    originalText: 'Hi, I am interested in your batik product. Can you tell me more about the price and shipping to Malaysia?',
    translatedText: 'Halo, saya tertarik dengan produk batik Anda. Bisakah Anda ceritakan lebih lanjut tentang harga dan pengiriman ke Malaysia?',
    aiReply: 'Hi Ahmad! Thank you for your interest. Our batik starts from $45/piece. We ship to Malaysia via JNE International, estimated 5-7 days. Would you like to order?',
    time: '10:32',
    status: 'pending',
  },
  {
    id: '2',
    channel: 'wa',
    buyer: 'Sophie Laurent',
    buyerCountry: 'Prancis',
    originalText: 'Bonjour! Est-ce que vous livrez en France? Quel est le délai de livraison?',
    translatedText: 'Halo! Apakah Anda mengirim ke Prancis? Berapa lama estimasi pengirimannya?',
    aiReply: 'Bonjour Sophie! Yes, we ship to France. Delivery takes 10-14 business days via EMS. Shipping cost starts from $15. Would you like to proceed?',
    time: '09:15',
    status: 'pending',
  },
  {
    id: '3',
    channel: 'inapp',
    buyer: 'Lim Wei',
    buyerCountry: 'Singapura',
    originalText: 'Do you have this in blue color? I want to buy 3 pieces.',
    translatedText: 'Apakah ada warna biru? Saya ingin beli 3 buah.',
    aiReply: 'Hi Lim Wei! Yes, we have blue color available. For 3 pieces, you get 10% discount. Total would be $121.50 including shipping. Shall I confirm your order?',
    time: '08:50',
    status: 'approved',
  },
  {
    id: '4',
    channel: 'wa',
    buyer: 'James Okonkwo',
    buyerCountry: 'Nigeria',
    originalText: 'Hello, what is the minimum order quantity? And do you accept PayPal?',
    translatedText: 'Halo, berapa minimum pemesanan? Dan apakah menerima PayPal?',
    aiReply: 'Hello James! Minimum order is 1 piece. We accept PayPal, bank transfer, and Western Union. Let me know if you have more questions!',
    time: 'Kemarin',
    status: 'rejected',
  },
];

export default function WhatsAppPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [messages, setMessages] = useState(dummyMessages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'wa' | 'inapp' | 'pending'>('all');

  function handleApprove(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    setEditingId(null);
  }

  function handleReject(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
  }

  function handleEdit(msg: Message) {
    setEditingId(msg.id);
    setEditText(msg.aiReply);
  }

  function handleSaveEdit(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, aiReply: editText, status: 'approved' } : m));
    setEditingId(null);
  }

  const filtered = messages.filter(m => {
    if (activeFilter === 'wa') return m.channel === 'wa';
    if (activeFilter === 'inapp') return m.channel === 'inapp';
    if (activeFilter === 'pending') return m.status === 'pending';
    return true;
  });

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">

      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5">
        <p className="text-[#7EE8BC] text-xs mb-1">SuaraEkspor</p>
        <h1 className="text-white text-xl font-bold">WhatsApp Integration</h1>
        <p className="text-[#A8D5C2] text-xs mt-0.5">Kelola pesan buyer dari semua channel</p>
      </div>

      {/* STATUS KONEKSI WA */}
      <div className="px-5 pt-5">
        <div className={`rounded-xl p-4 flex items-center justify-between ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
              {isConnected ? <Wifi size={20} className="text-green-600" /> : <WifiOff size={20} className="text-red-500" />}
            </div>
            <div>
              <p className={`font-semibold text-sm ${isConnected ? 'text-green-800' : 'text-red-700'}`}>
                {isConnected ? 'WhatsApp Terhubung' : 'WhatsApp Belum Terhubung'}
              </p>
              <p className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                {isConnected ? '+62 812-3456-7890 · Aktif' : 'Hubungkan nomor WA Anda'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${isConnected ? 'bg-red-100 text-red-600' : 'bg-[#0F4A33] text-white'}`}
          >
            {isConnected ? 'Putuskan' : 'Hubungkan'}
          </button>
        </div>

        {/* STATS */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xl font-bold text-[#0F4A33]">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Menunggu</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xl font-bold text-gray-800">{messages.filter(m => m.channel === 'wa').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pesan WA</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xl font-bold text-gray-800">{messages.filter(m => m.status === 'approved').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Disetujui</p>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {(['all', 'pending', 'wa', 'inapp'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                activeFilter === f
                  ? 'bg-[#0F4A33] text-white border-[#0F4A33]'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'pending' ? `Pending (${pendingCount})` : f === 'wa' ? 'WhatsApp' : 'In-App'}
            </button>
          ))}
        </div>
      </div>

      {/* INBOX */}
      <div className="px-5 mt-4 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada pesan</p>
          </div>
        )}

        {filtered.map((msg) => (
          <div key={msg.id} className={`bg-white rounded-xl border overflow-hidden ${
            msg.status === 'approved' ? 'border-green-200' :
            msg.status === 'rejected' ? 'border-gray-200 opacity-60' :
            'border-gray-200'
          }`}>

            {/* MESSAGE HEADER */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#7EE8BC] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0F4A33] font-bold text-xs">{msg.buyer.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 text-sm">{msg.buyer}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      msg.channel === 'wa'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {msg.channel === 'wa' ? 'WA' : 'In-App'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{msg.buyerCountry} · {msg.time}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                msg.status === 'approved' ? 'bg-green-100 text-green-700' :
                msg.status === 'rejected' ? 'bg-gray-100 text-gray-500' :
                'bg-amber-100 text-amber-700'
              }`}>
                {msg.status === 'approved' ? '✓ Terkirim' : msg.status === 'rejected' ? 'Ditolak' : 'Pending'}
              </span>
            </div>

            {/* PESAN ASLI */}
            <div className="px-4 pb-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Globe size={10} /> Pesan asli ({msg.buyerCountry})
              </p>
              <p className="text-sm text-gray-700 italic">"{msg.originalText}"</p>
            </div>

            {/* TERJEMAHAN */}
            <div className="px-4 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-blue-500 mb-1">🔤 Terjemahan AI</p>
              <p className="text-sm text-gray-800">{msg.translatedText}</p>
            </div>

            {/* AI REPLY */}
            <div className="px-4 py-3 bg-[#f0faf5] border-b border-gray-100">
              <p className="text-xs text-[#0F4A33] mb-1.5 flex items-center gap-1">
                <span>✨</span> Balasan AI (dalam bahasa buyer)
              </p>
              {editingId === msg.id ? (
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full text-sm text-gray-800 bg-white border border-[#0F4A33]/30 rounded-lg p-2.5 resize-none focus:outline-none focus:border-[#0F4A33]"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-800">{msg.aiReply}</p>
              )}
            </div>

            {/* ACTION BUTTONS */}
            {msg.status === 'pending' && (
              <div className="px-4 py-3 flex gap-2">
                {editingId === msg.id ? (
                  <button
                    onClick={() => handleSaveEdit(msg.id)}
                    className="flex-1 bg-[#0F4A33] text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Send size={13} /> Kirim Balasan
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleApprove(msg.id)}
                      className="flex-1 bg-[#0F4A33] text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleEdit(msg)}
                      className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleReject(msg.id)}
                      className="w-10 bg-white border border-gray-200 text-red-400 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            )}

            {msg.status === 'approved' && (
              <div className="px-4 py-3 flex items-center gap-1.5 text-green-600">
                <Check size={13} />
                <p className="text-xs font-medium">Balasan telah dikirim ke buyer</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <Package size={22} /><span className="text-xs mt-1">Produk</span>
        </Link>
        <Link href="/upload" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <Plus size={22} /><span className="text-xs mt-1">Upload</span>
        </Link>
        <Link href="/conversations" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <MessageSquare size={22} /><span className="text-xs mt-1">Pesan</span>
        </Link>
      </nav>
    </div>
  );
}