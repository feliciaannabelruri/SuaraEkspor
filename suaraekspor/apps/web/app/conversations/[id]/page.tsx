'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, Send } from 'lucide-react';

const conv = {
  buyer: 'John Smith',
  country: 'USA',
  product: 'Batik Tulis Pekalongan',
  messages: [
    {
      id: 1, role: 'buyer', lang: 'en',
      text: 'Hi, I am interested in ordering 5 pieces. What is the shipping cost to the US?',
      time: '10:23',
    },
    {
      id: 2, role: 'ai', lang: 'en',
      text: 'Hello John! Thank you for your interest in our Batik Pekalongan. For 5 pieces, the total would be $225. Shipping to the US typically costs $25–35 via DHL Express (5–7 business days). Would you like to proceed?',
      summary: 'John mau pesan 5 lembar. Kita kasih harga $225 + ongkir $25-35 ke Amerika. Dia minta konfirmasi.',
      time: '10:23',
    },
    {
      id: 3, role: 'buyer', lang: 'en',
      text: 'That sounds good. Can you do $200 for 5 pieces?',
      time: '10:31',
    },
    {
      id: 4, role: 'ai', lang: 'en',
      text: 'We appreciate your offer! The best we can do is $210 for 5 pieces — that includes a small discount from our standard price. This still includes our certificate of authenticity for each piece. Would that work for you?',
      summary: 'John nawar $200 untuk 5 lembar. Kita counter $210 dengan sertifikat keaslian. Tunggu konfirmasi.',
      time: '10:31',
    },
  ],
};

export default function ConversationDetailPage() {
  const router = useRouter();
  const [playing, setPlaying] = useState<number|null>(null);

  function playAudio(id: number) {
    setPlaying(id);
    setTimeout(() => setPlaying(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      <div className="bg-[#0F4A33] px-5 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-3 block">← Kembali</button>
        <h1 className="text-white font-bold text-base">{conv.buyer} · {conv.country}</h1>
        <p className="text-[#A8D5C2] text-xs mt-0.5">{conv.product}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-[#7EE8BC] rounded-full animate-pulse" />
          <p className="text-[#7EE8BC] text-xs font-semibold">AI menangani balasan otomatis</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3 overflow-y-auto">
        {conv.messages.map(m => (
          <div key={m.id}>
            {m.role === 'buyer' ? (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <p className="text-[10px] text-gray-400 mb-1">{conv.buyer} · {m.time}</p>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                    <p className="text-sm text-gray-800">{m.text}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <p className="text-[10px] text-gray-400 mb-1 text-right">AI SuaraEkspor · {m.time}</p>
                  <div className="bg-[#0F4A33] rounded-2xl rounded-tr-none px-4 py-3">
                    <p className="text-sm text-white">{m.text}</p>
                  </div>
                  {/* RINGKASAN UNTUK PENJUAL */}
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Ringkasan untuk Anda</p>
                      <button onClick={() => playAudio(m.id)}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-all
                          ${playing === m.id ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-800'}`}>
                        <Volume2 size={10} />
                        {playing === m.id ? 'Memutar...' : 'Dengar'}
                      </button>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">{m.summary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-4 bg-white border-t border-gray-100 flex items-center gap-2">
        <p className="flex-1 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">AI membalas otomatis dalam bahasa buyer...</p>
        <button className="w-10 h-10 bg-[#0F4A33] rounded-xl flex items-center justify-center flex-shrink-0">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}