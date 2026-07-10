'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import { useMiddleman } from "../context/middleman-context";
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import apiClient from '@/lib/api-client';

interface Listing {
  languageCode: string;
  languageName: string;
  title: string;
  description: string;
  keywords: string[];
}

interface Product {
  id: string;
  status: 'processing' | 'active' | 'inactive';
  photoUrls: string[];
  recommendedPriceUsd?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  category?: string;
  exportReadinessScore?: number;
  aiPipelineStage?: string;
  listings: Listing[];
  createdAt: string;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100';

function getAiStatusLabel(p: Product): 'Done' | 'Error' | 'Pending' | 'Processing' {
  if (p.aiPipelineStage === 'done') return 'Done';
  if (p.aiPipelineStage === 'error') return 'Error';
  if (p.status === 'processing' && p.aiPipelineStage === 'pending') return 'Pending';
  return 'Processing';
}

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();
  const [censoredIds, setCensoredIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('se_token')) {
      router.push('/login');
      return;
    }
    apiClient
      .get('/products')
      .then(({ data }) => {
        setProducts(data.data ?? []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function toggleCensor(id: string) {
    setCensoredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const sellerName = isMiddleman && activeUMKM ? activeUMKM.owner : 'Pak Budi';
  const businessName = isMiddleman && activeUMKM ? activeUMKM.name : 'Anda';

  const totalProducts = products.length;
  const exportReadyCount = products.filter(p => (p.exportReadinessScore ?? 0) >= 70).length;
  const exportReadyRatio = totalProducts > 0 ? Math.round((exportReadyCount / totalProducts) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-[#FDF0E8] flex flex-col relative pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-500">Overview keseluruhan aktivitas</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Kembali ke Homepage
            </Link>
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1440px] mx-auto w-full flex-1 space-y-8">

          {/* Header Area */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Dashboard</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                Selamat Pagi, {sellerName} <span className="text-2xl"></span>
              </h1>
              <p className="text-gray-500 text-xs md:text-sm">Lihat ringkasan bisnis ekspor {businessName} hari ini.</p>
            </div>
          </div>


          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
              <p className="text-3xl font-bold text-[#0F4A33]">{totalProducts}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#fe802f]/10 rounded-lg flex items-center justify-center text-[#fe802f]">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </div>
                <span className="text-[10px] font-bold text-[#fe802f] bg-[#fe802f]/10 px-2 py-1 rounded">3 BARU</span>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Messages</p>
              <p className="text-3xl font-bold text-[#0F4A33]">8</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#7EE8BC]/20 rounded-lg flex items-center justify-center text-[#0F4A33]">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </div>
                <span className="text-[10px] font-bold text-[#0F4A33] bg-[#7EE8BC]/20 px-2 py-1 rounded">{exportReadyRatio}% Ratio</span>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Export Ready</p>
              <p className="text-3xl font-bold text-[#0F4A33]">{exportReadyCount}</p>
            </div>

            <div className="bg-[#0F4A33] rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded">Target: $5k</span>
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Export Value</p>
              <p className="text-3xl font-bold text-white">$2,840</p>
            </div>
          </div>

          {/* Products Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-[#0F4A33] text-xl md:text-2xl font-bold">Produk Saya</h2>
              <Link href="/upload" className="bg-[#b35a22] hover:bg-[#964718] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Upload Produk Baru
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400 text-sm">
                Memuat produk...
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                <p className="text-gray-500 text-sm mb-4">Anda belum memiliki produk. Mulai dengan mengunggah produk pertama Anda.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 bg-[#0F4A33] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a3323] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Upload Produk Baru
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Produk</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Harga ($)</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Pipeline</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bahasa</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ready %</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const name = p.listings?.[0]?.title ?? 'Produk baru';
                      const category = p.category ?? '-';
                      const price = p.recommendedPriceUsd ? `$${p.recommendedPriceUsd}` : '—';
                      const aiStatus = getAiStatusLabel(p);
                      const langs = p.listings?.length ? p.listings.map(l => l.languageCode.toUpperCase()).join(' ') : '-';
                      const ready = p.exportReadinessScore ?? 0;
                      const img = p.photoUrls?.[0] ?? FALLBACK_IMG;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${censoredIds.has(p.id) ? 'blur-md' : ''}`}>
                              <img src={img} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className={`font-bold text-gray-800 ${censoredIds.has(p.id) ? 'blur-sm select-none' : ''}`}>{censoredIds.has(p.id) ? '••••••••••••••••' : name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md">{category}</span>
                          </td>
                          <td className={`py-4 px-6 font-bold text-gray-800 ${censoredIds.has(p.id) ? 'blur-sm select-none' : ''}`}>{censoredIds.has(p.id) ? '$$$' : price}</td>
                          <td className="py-4 px-6">
                            {aiStatus === 'Done' && (
                              <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Done
                              </div>
                            )}
                            {aiStatus === 'Processing' && (
                              <div className="flex items-center gap-1.5 text-[#fe802f] text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">sync</span>
                                Processing
                              </div>
                            )}
                            {aiStatus === 'Pending' && (
                              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                Pending
                              </div>
                            )}
                            {aiStatus === 'Error' && (
                              <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                Error
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-700 font-semibold tracking-wider">{langs}</td>
                          <td className="py-4 px-6">
                            <div className="w-24">
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${ready >= 90 ? 'bg-[#0F4A33]' : ready > 0 ? 'bg-[#fe802f]' : 'bg-gray-300'}`}
                                  style={{ width: `${ready}%` }}
                                />
                              </div>
                              <p className="text-[10px] font-bold text-gray-500 mt-1">{ready}%</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <Link href={`/product/${p.id}`} className="hover:text-[#0F4A33] transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></Link>
                              <button onClick={() => toggleCensor(p.id)} className="hover:text-[#0F4A33] transition-colors"><span className="material-symbols-outlined text-[18px]">{censoredIds.has(p.id) ? 'visibility_off' : 'visibility'}</span></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Dashboard Analytics Preview */}
          <section className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 block shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[#0F4A33] text-xl font-bold">Tinjauan Penjualan</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-500 tracking-wider">7 HARI TERAKHIR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Area */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Total View Statistik</p>
                <div className="h-40 flex items-end gap-1.5 sm:gap-3 border-b border-gray-200 pb-2">
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '40%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Sen</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '55%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Sel</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '35%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Rab</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '70%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Kam</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '85%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Jum</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33] rounded-t-sm transition-colors" style={{ height: '100%' }}></div>
                    <span className="text-[10px] font-bold text-[#0F4A33] mt-2">Sab</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-[#0F4A33]/20 rounded-t-sm group-hover:bg-[#0F4A33] transition-colors" style={{ height: '60%' }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Min</span>
                  </div>
                </div>
              </div>

              {/* Stats Side */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-1 lg:gap-0 lg:flex lg:flex-col lg:justify-between h-full">
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-gray-500 mb-1">TOTAL VIEW</p>
                  <p className="text-2xl font-bold text-[#0F4A33]">1,240</p>
                  <p className="text-xs text-green-600 font-bold mt-1">+12% vs minggu lalu</p>
                </div>
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-[#fe802f] mb-1">NEGOSIASI AKTIF</p>
                  <p className="text-2xl font-bold text-[#0F4A33]">2</p>
                  <p className="text-xs text-gray-500 font-bold mt-1">Sedang berjalan</p>
                </div>
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg border border-[#7EE8BC]/50 lg:border-none">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-gray-500 mb-1">SKOR TOKO</p>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#fe802f] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <p className="text-2xl font-bold text-[#0F4A33]">4.8</p>
                  </div>
                  <p className="text-xs text-[#0F4A33] font-bold mt-1">Sangat Baik</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
            {/* Aktivitas Terkini */}
            <div className="xl:col-span-2">
              <h2 className="text-[#0F4A33] text-xl font-bold mb-4">Aktivitas Terkini</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#fe802f]/10 text-[#fe802f] flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </div>
                  <div>
                    <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed font-medium"><span className="font-bold">Buyer dari Dubai</span> baru saja melihat produk <span className="font-bold">Batik Tulis Premium</span> Anda.</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">2 jam yang lalu</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#7EE8BC]/20 text-[#0F4A33] flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                  </div>
                  <div>
                    <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed font-medium"><span className="font-bold">AI Translation Complete:</span> Listing produk <span className="font-bold">Kopi Arabica</span> sekarang tersedia dalam 4 bahasa.</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">3 jam yang lalu</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed font-medium">Pesan baru dari <span className="font-bold">Tanaka San (Jepang)</span> mengenai pengiriman wholesale.</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Kemarin, 13:42</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Insight */}
            <div className="xl:col-span-1 flex flex-col">
              <h2 className="text-[#0F4A33] text-xl font-bold mb-4 xl:opacity-0 xl:hidden">Export Insight</h2>
              <div className="bg-[#0F4A33] rounded-2xl p-6 md:p-8 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none">
                  <span className="material-symbols-outlined text-[200px] translate-x-8 translate-y-8">trending_up</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[#7EE8BC] text-xl font-bold mb-4">Export Insight</h3>
                  <p className="text-white/90 text-[13px] md:text-sm leading-relaxed font-medium">
                    Permintaan kerajinan anyaman meningkat 25% di pasar Timur Tengah bulan ini. Gunakan fitur AI Translate untuk optimasi listing Anda.
                  </p>
                </div>
                <div className="mt-8 relative z-10">
                  <button className="bg-[#7EE8BC] text-[#0F4A33] font-bold px-6 py-3 rounded-xl text-sm hover:bg-white transition-colors shadow-sm w-fit">
                    Lihat Laporan
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE BOTTOM NAV */}
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
