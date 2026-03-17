'use client';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

const dummyConvs = [
  { id: '1', buyer: 'John Smith (USA)', product: 'Batik Pekalongan', msg: 'I would like to order 5 pieces. What is the shipping cost?', time: '2m ago', unread: true },
  { id: '2', buyer: 'Tanaka Hiroshi (Japan)', product: 'Kopi Toraja', msg: 'Is this coffee available for bulk order?', time: '1h ago', unread: false },
];

export default function ConversationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      <div className="bg-[#0F4A33] px-5 py-5">
        <h1 className="text-white text-xl font-bold">Pesan dari Buyer</h1>
        <p className="text-[#A8D5C2] text-xs mt-1">AI menangani balasan otomatis</p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {dummyConvs.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-bold text-gray-900 text-sm">{c.buyer}</p>
                <p className="text-xs text-gray-400">{c.product}</p>
              </div>
              <div className="flex items-center gap-2">
                {c.unread && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                <span className="text-xs text-gray-400">{c.time}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{c.msg}</p>
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-700 font-semibold">Ringkasan AI untuk Anda:</p>
              <p className="text-xs text-green-600 mt-0.5">Buyer ingin pesan produk dan tanya ongkos kirim. AI sudah balas otomatis.</p>
            </div>
          </div>
        ))}
      </div>

<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 flex">        <a href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span className="text-xs mt-1">Produk</span>
        </a>
        <a href="/upload" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span className="text-xs mt-1">Upload</span>
        </a>
        <a href="/conversations" className="flex-1 flex flex-col items-center py-3 text-[#0F4A33]">
          <MessageSquare size={22} />
          <span className="text-xs mt-1">Pesan</span>
        </a>
      </nav>
    </div>
  );
}