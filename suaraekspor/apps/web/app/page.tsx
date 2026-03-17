'use client';
import Link from 'next/link';
import { ArrowRight, Globe, Mic, Camera, Shield, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F4A33]">

      {/* DESKTOP NAVBAR */}
      <nav className="hidden md:flex items-center justify-between px-16 py-5 border-b border-white/10">
        <div className="text-white text-2xl font-extrabold tracking-tight">
          Suara<span className="text-[#7EE8BC]">Ekspor</span>
        </div>
        <div className="flex items-center gap-8 text-white/70 text-sm font-medium">
          <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a>
          <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
          <a href="/marketplace" className="hover:text-white transition-colors">Marketplace</a>
        </div>
        <Link href="/login" className="bg-white text-[#0F4A33] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#7EE8BC] transition-colors">
          Mulai Sekarang
        </Link>
      </nav>

      {/* HERO — RESPONSIVE */}
      <div className="flex flex-col md:flex-row md:items-center md:min-h-[90vh] px-6 md:px-16 pt-14 md:pt-0 pb-10 md:gap-16 max-w-7xl mx-auto">

        {/* LEFT — TEXT */}
        <div className="flex-1">
          <span className="inline-block text-[#7EE8BC] text-xs font-bold tracking-widest uppercase mb-5 bg-white/10 px-3 py-1 rounded-full">
            PIDI DIGDAYA X · PS3
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Jual ke Dunia.<br />
            <span className="text-[#7EE8BC]">Foto & Bicara.</span><br />
            Selesai.
          </h1>
          <p className="text-[#A8D5C2] text-sm md:text-lg leading-relaxed mb-8 max-w-lg">
            AI kami menerjemahkan produkmu ke 6 bahasa, menemukan buyer internasional, dan menangani semua komunikasi — tanpa perlu bahasa Inggris sepatah pun.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/login" className="bg-white text-[#0F4A33] font-bold py-4 px-8 rounded-2xl text-base text-center flex items-center justify-center gap-2 hover:bg-[#7EE8BC] transition-colors">
              Mulai Jual Produk <ArrowRight size={18} />
            </Link>
            <Link href="/marketplace" className="border border-[#2E9E6E] text-[#7EE8BC] font-semibold py-4 px-8 rounded-2xl text-sm text-center hover:bg-white/10 transition-colors">
              Lihat Marketplace
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm md:max-w-md">
            {[
              { num: '65,5 Jt', label: 'UMKM Indonesia' },
              { num: '6', label: 'Bahasa Target' },
              { num: '3', label: 'Langkah Saja' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-white text-xl md:text-2xl font-extrabold">{s.num}</div>
                <div className="text-[#A8D5C2] text-[10px] mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — PHONE MOCKUP (desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0">
          <div className="w-72 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white/20">
            <div className="bg-[#0F4A33] px-4 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm">SuaraEkspor</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>
            </div>
            <div className="bg-[#F7F7F5] p-4">
              <div className="bg-green-100 rounded-xl p-3 text-center mb-3">
                <p className="text-green-900 text-xs font-semibold">Selamat datang! Mau jual produk apa?</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
                  <Camera size={28} className="text-green-700" />
                  <span className="text-xs font-bold text-green-900">Foto Produk</span>
                </div>
                <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
                  <Mic size={28} className="text-green-700" />
                  <span className="text-xs font-bold text-green-900">Ceritakan</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Produk Terbaru</p>
                {[
                  { name: 'Batik Pekalongan', price: '$45', langs: 'EN ZH AR' },
                  { name: 'Kopi Toraja', price: '$18', langs: 'EN JA DE' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.langs}</p>
                    </div>
                    <span className="text-xs font-bold text-green-700">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARA KERJA */}
      <div id="cara-kerja" className="bg-white/5 py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#7EE8BC] text-xs font-bold tracking-widest uppercase text-center mb-3">Cara Kerja</p>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold text-center mb-12">Tiga Langkah. Itu Saja.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Camera, step: '01', title: 'Foto Produk', desc: 'Ambil foto produkmu langsung dari kamera HP. Tidak perlu foto studio.' },
              { icon: Mic, step: '02', title: 'Ceritakan', desc: 'Tekan tombol mikrofon dan ceritakan produkmu dalam Bahasa Jawa, Sunda, atau Indonesia.' },
              { icon: Globe, step: '03', title: 'AI Bekerja', desc: 'AI kami buat listing 6 bahasa, rekomendasi harga, dan tangani komunikasi buyer otomatis.' },
            ].map((s) => (
              <div key={s.step} className="bg-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[#7EE8BC] text-3xl font-extrabold opacity-50">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <s.icon size={20} className="text-[#7EE8BC]" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[#A8D5C2] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FITUR */}
      <div id="fitur" className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#7EE8BC] text-xs font-bold tracking-widest uppercase text-center mb-3">Keunggulan</p>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold text-center mb-12">Platform Ekspor Paling Inklusif</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Multibahasa Otomatis', desc: 'Listing produk langsung dibuat dalam EN, ZH, AR, JA, DE, ID — tanpa kamu perlu tahu satu pun bahasa asing.' },
              { icon: Shield, title: 'AI Communication Agent', desc: 'Buyer kirim pesan → AI balas otomatis dalam bahasa buyer. Kamu dapat ringkasan dalam bahasa daerahmu via notifikasi suara.' },
              { icon: TrendingUp, title: 'Harga Ekspor Optimal', desc: 'AI analisis pasar global dan rekomendasikan harga jual yang kompetitif untuk produkmu di pasar internasional.' },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[#7EE8BC]/20 flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-[#7EE8BC]" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-[#A8D5C2] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BOTTOM */}
      <div className="py-16 px-6 md:px-16 text-center border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-4">Siap Ekspor ke Dunia?</h2>
          <p className="text-[#A8D5C2] mb-8">Bergabung bersama ribuan UMKM Indonesia yang sudah menemukan buyer internasional lewat SuaraEkspor.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-[#0F4A33] font-bold py-4 px-10 rounded-2xl text-base hover:bg-[#7EE8BC] transition-colors">
            Mulai Gratis Sekarang <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 md:px-16 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white font-extrabold text-lg">Suara<span className="text-[#7EE8BC]">Ekspor</span></div>
        <p className="text-white/40 text-xs text-center">PIDI DIGDAYA X Hackathon 2026 · PS3 · Platform AI Ekspor Inklusif</p>
        <div className="flex gap-4 text-white/40 text-xs">
          <a href="/marketplace" className="hover:text-white transition-colors">Marketplace</a>
          <a href="/login" className="hover:text-white transition-colors">Masuk</a>
        </div>
      </div>

    </div>
  );
}