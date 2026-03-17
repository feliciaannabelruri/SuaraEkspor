'use client';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, DollarSign, Package, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const guides = [
  {
    id: 1,
    icon: FileText,
    title: 'Dokumen Ekspor yang Dibutuhkan',
    tag: 'Regulasi',
    color: 'bg-blue-50 text-blue-700',
    content: [
      { q: 'Apa saja dokumen wajib?', a: 'Invoice komersial, packing list, bill of lading/airway bill, certificate of origin (SKA), dan customs declaration.' },
      { q: 'Di mana mengurus Certificate of Origin?', a: 'Di Dinas Perdagangan setempat atau secara online via INATRADE (inatrade.kemendag.go.id). Biaya sekitar Rp 50.000–150.000 per SKA.' },
      { q: 'Apakah batik perlu izin khusus?', a: 'Tidak, batik dan kerajinan tangan umumnya bebas ekspor. Cukup memiliki NIB (Nomor Induk Berusaha) dari OSS.' },
    ],
  },
  {
    id: 2,
    icon: DollarSign,
    title: 'Cara Terima Pembayaran Internasional',
    tag: 'Keuangan',
    color: 'bg-green-50 text-green-700',
    content: [
      { q: 'Metode pembayaran apa yang aman?', a: 'PayPal (paling umum), Wise (biaya rendah), Letter of Credit/L/C (untuk order besar), dan transfer bank SWIFT.' },
      { q: 'Berapa biaya PayPal?', a: 'PayPal memotong sekitar 4.4% + biaya tetap per transaksi untuk pembayaran internasional. Wise lebih murah untuk transfer besar.' },
      { q: 'Bagaimana melindungi diri dari penipuan?', a: 'Selalu minta pembayaran penuh atau DP 50% sebelum kirim. Gunakan escrow untuk order pertama dengan buyer baru.' },
    ],
  },
  {
    id: 3,
    icon: Package,
    title: 'Panduan Pengiriman Internasional',
    tag: 'Logistik',
    color: 'bg-purple-50 text-purple-700',
    content: [
      { q: 'Ekspedisi apa yang tersedia?', a: 'DHL Express (3–5 hari, mahal), FedEx, UPS, EMS Pos Indonesia (7–14 hari, lebih murah), dan J&T International.' },
      { q: 'Bagaimana menghitung berat volumetrik?', a: 'Rumus: (P x L x T cm) / 5000 = berat volumetrik kg. Gunakan yang lebih besar antara berat aktual vs volumetrik.' },
      { q: 'Berapa kisaran biaya kirim ke USA?', a: 'Paket 1kg: DHL ~Rp 350.000–450.000, EMS ~Rp 150.000–200.000. Harga bisa berubah, cek langsung di website ekspedisi.' },
    ],
  },
  {
    id: 4,
    icon: BookOpen,
    title: 'Tips Sukses Ekspor UMKM',
    tag: 'Tips',
    color: 'bg-amber-50 text-amber-700',
    content: [
      { q: 'Bagaimana menarik buyer internasional?', a: 'Foto produk berkualitas tinggi, deskripsi yang jelas dalam bahasa Inggris, harga kompetitif, dan respons cepat terhadap pertanyaan buyer.' },
      { q: 'Platform marketplace internasional apa yang cocok?', a: 'Etsy (kerajinan tangan), Amazon Handmade, eBay, dan Alibaba untuk order grosir. SuaraEkspor membantu kamu masuk ke semua platform ini.' },
      { q: 'Berapa modal awal untuk mulai ekspor?', a: 'Sangat fleksibel — bisa mulai dari 1 produk. Modal utama adalah biaya pengiriman pertama dan kemasan yang bagus.' },
    ],
  },
];

export default function PanduanPage() {
  const router = useRouter();
  const [open, setOpen] = useState<{[key: string]: boolean}>({});

  function toggle(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-10">
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-3 block">← Kembali</button>
        <h1 className="text-white text-xl font-bold">Panduan Ekspor</h1>
        <p className="text-[#A8D5C2] text-xs mt-1">Digital Advisor untuk UMKM Indonesia</p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {guides.map(g => (
          <div key={g.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${g.color.split(' ')[0]}`}>
                  <g.icon size={18} className={g.color.split(' ')[1]} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{g.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.color}`}>{g.tag}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-50">
              {g.content.map((item, i) => (
                <div key={i} className="border-b border-gray-50 last:border-0">
                  <button
                    onClick={() => toggle(`${g.id}-${i}`)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{item.q}</p>
                    <ChevronRight size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${open[`${g.id}-${i}`] ? 'rotate-90' : ''}`} />
                  </button>
                  {open[`${g.id}-${i}`] && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}