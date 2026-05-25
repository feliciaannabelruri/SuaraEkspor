'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMiddleman } from "../context/middleman-context";
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';

const guides = [
  {
    id: 1,
    icon: 'description',
    title: 'Dokumen Ekspor yang Dibutuhkan',
    tag: 'Regulasi',
    color: 'text-[#0F4A33] bg-[#c5eadf]',
    time: '5 Menit Baca',
    content: [
      { q: 'Apa saja dokumen wajib?', a: 'Invoice komersial, packing list, bill of lading/airway bill, certificate of origin (SKA), dan customs declaration.' },
      { q: 'Di mana mengurus Certificate of Origin?', a: 'Di Dinas Perdagangan setempat atau secara online via INATRADE (inatrade.kemendag.go.id). Biaya sekitar Rp 50.000–150.000 per SKA.' },
      { q: 'Apakah batik perlu izin khusus?', a: 'Tidak, batik dan kerajinan tangan umumnya bebas ekspor. Cukup memiliki NIB (Nomor Induk Berusaha) dari OSS.' },
    ],
  },
  {
    id: 2,
    icon: 'payments',
    title: 'Cara Terima Pembayaran Internasional',
    tag: 'Keuangan',
    color: 'text-[#9c4400] bg-[#ffdbca]',
    time: '7 Menit Baca',
    content: [
      { q: 'Metode pembayaran apa yang aman?', a: 'PayPal (paling umum), Wise (biaya rendah), Letter of Credit/L/C (untuk order besar), dan transfer bank SWIFT.' },
      { q: 'Berapa biaya PayPal?', a: 'PayPal memotong sekitar 4.4% + biaya tetap per transaksi untuk pembayaran internasional. Wise lebih murah untuk transfer besar.' },
      { q: 'Bagaimana melindungi diri dari penipuan?', a: 'Selalu minta pembayaran penuh atau DP 50% sebelum kirim. Gunakan escrow untuk order pertama dengan buyer baru.' },
    ],
  },
  {
    id: 3,
    icon: 'local_shipping',
    title: 'Panduan Pengiriman Internasional',
    tag: 'Logistik',
    color: 'text-[#0F4A33] bg-[#b0f2b7]',
    time: '5 Menit Baca',
    content: [
      { q: 'Ekspedisi apa yang tersedia?', a: 'DHL Express (3–5 hari, mahal), FedEx, UPS, EMS Pos Indonesia (7–14 hari, lebih murah), dan J&T International.' },
      { q: 'Bagaimana menghitung berat volumetrik?', a: 'Rumus: (P x L x T cm) / 5000 = berat volumetrik kg. Gunakan yang lebih besar antara berat aktual vs volumetrik.' },
      { q: 'Berapa kisaran biaya kirim ke USA?', a: 'Paket 1kg: DHL ~Rp 350.000–450.000, EMS ~Rp 150.000–200.000. Harga bisa berubah, cek langsung di website ekspedisi.' },
    ],
  },
  {
    id: 4,
    icon: 'lightbulb',
    title: 'Tips Sukses Ekspor UMKM',
    tag: 'Tips',
    color: 'text-[#0F4A33] bg-[#f6f3f2]',
    time: '4 Menit Baca',
    content: [
      { q: 'Bagaimana menarik buyer internasional?', a: 'Foto produk berkualitas tinggi, deskripsi yang jelas dalam bahasa Inggris, harga kompetitif, dan respons cepat terhadap pertanyaan buyer.' },
      { q: 'Platform marketplace internasional apa yang cocok?', a: 'Etsy (kerajinan tangan), Amazon Handmade, eBay, dan Alibaba untuk order grosir. SuaraEkspor membantu kamu masuk ke semua platform ini.' },
      { q: 'Berapa modal awal untuk mulai ekspor?', a: 'Sangat fleksibel — bisa mulai dari 1 produk. Modal utama adalah biaya pengiriman pertama dan kemasan yang bagus.' },
    ],
  },
];

export default function PanduanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  function toggle(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const activeCount = Object.values(open).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.max(0, (activeCount / 12) * 100)); // rough estimate

  return (
    <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-[#FDF0E8] flex flex-col relative pb-24 md:pb-10">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Panduan</h1>
            <p className="text-xs text-gray-500">Digital Advisor</p>
          </div>
          <div className="flex items-center gap-4">
            <MobileProfileMenu />
          </div>
        </header>

        {/* HEADER ROW */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2 md:pb-0 max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Panduan</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Panduan Ekspor</h1>
            <p className="text-xs md:text-sm text-gray-500">
              Digital Advisor untuk UMKM Indonesia. Lengkapi pengetahuan ekspor Anda.
            </p>
          </div>
        </div>

        {/* CATEGORY BENTO GRID */}
        <section className="px-4 md:px-12 mt-6 relative z-20">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {guides.map(g => (
              <a href={`#section-${g.id}`} key={g.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#0F4A33] transition-all group cursor-pointer shadow-sm hover:shadow-md block">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all mb-4 ${g.color}`}>
                  <span className="material-symbols-outlined text-2xl md:text-3xl">{g.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-1.5 text-gray-900">{g.tag}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Panduan lengkap mengenai {g.tag.toLowerCase()} untuk UMKM Indonesia.</p>
              </a>
            ))}
          </div>
        </section>

        {/* ACCORDION CONTENT & RIGHT SIDEBAR */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pb-20">
          
          {/* Accordion Sections */}
          <div className="md:col-span-8 space-y-12 md:space-y-16">
            {guides.map((g) => (
              <div key={g.id} id={`section-${g.id}`} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0F4A33] text-2xl md:text-3xl">{g.icon}</span>
                    <h2 className="font-bold text-xl md:text-2xl text-gray-900">{g.title}</h2>
                  </div>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 w-fit">
                    Update: Bulan Ini
                  </span>
                </div>
                
                <div className="space-y-4">
                  {g.content.map((item, i) => {
                    const isOpen = open[`${g.id}-${i}`];
                    return (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all shadow-sm hover:border-[#0F4A33]/30">
                        <button 
                          className="w-full flex items-start sm:items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition-colors" 
                          onClick={() => toggle(`${g.id}-${i}`)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full pr-4">
                            <div className={`p-2.5 rounded-lg flex-shrink-0 hidden sm:flex ${g.color.replace('bg-', 'bg-').replace('/50', '/20')}`}>
                              <span className="material-symbols-outlined text-[20px]">{g.icon}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm md:text-base text-gray-800 leading-tight mb-1">{item.q}</h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{g.time} • {g.tag}</span>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-gray-400 transition-transform flex-shrink-0 mt-1 sm:mt-0 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        
                        {isOpen && (
                          <div className="border-t border-gray-100 bg-[#fcf9f8]">
                            <div className="p-4 md:p-6 text-sm text-gray-700 leading-relaxed space-y-4">
                              <p>{item.a}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar (Desktop Only) */}
          <aside className="hidden md:block col-span-4 sticky top-24 h-fit space-y-8">
            {/* Quick Actions Widget */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Siap untuk Ekspor?</h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-[#0F4A33] text-[18px]">check_circle</span>
                  Siapkan Dokumen
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-[#0F4A33] text-[18px]">check_circle</span>
                  Foto Produk Berkualitas
                </div>
              </div>
              <button onClick={() => router.push('/upload')} className="w-full py-2.5 bg-[#fe802f] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload Produk Baru
              </button>
            </div>
            
            {/* Artikel Terkait */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6 text-gray-900">Artikel Terkait</h3>
              <div className="space-y-6">
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      alt="Shipping" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=300&auto=format&fit=crop"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight group-hover:text-[#0F4A33] transition-colors text-gray-800 mb-2">Cara Memilih Kontainer untuk Ekspor Laut</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">12 Des • 10 Menit</p>
                  </div>
                </div>
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      alt="Documents" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src="https://images.unsplash.com/photo-1568227450917-a006c4bdae3b?q=80&w=300&auto=format&fit=crop"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight group-hover:text-[#0F4A33] transition-colors text-gray-800 mb-2">Panduan Mengisi PEB dengan Benar</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">10 Des • 15 Menit</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-[#fe802f] p-6 rounded-2xl text-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">Butuh Bantuan Personal?</h3>
              <p className="text-sm mb-5 opacity-90 leading-relaxed">Hubungi Expert Advisor kami melalui WhatsApp untuk konsultasi 1-on-1.</p>
              <button onClick={() => router.push('/whatsapp')} className="w-full py-3 bg-[#0F4A33] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Chat Advisor
              </button>
            </div>
          </aside>
        </div>

        {/* BOTTOM NAV MOBILE */}
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
      </main>
    </div>
  );
}