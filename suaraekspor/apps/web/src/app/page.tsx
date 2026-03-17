'use client';
import Link from 'next/link';
import { ArrowRight, Globe, Mic, Camera } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#0F4A33] flex-1 flex flex-col px-6 pt-16 pb-10">
        <div className="mb-2">
          <span className="text-[#7EE8BC] text-xs font-bold tracking-widest uppercase">
            PIDI DIGDAYA X · PS3
          </span>
        </div>
        <h1 className="text-white text-[38px] font-extrabold leading-[1.1] tracking-tight mb-5">
          Jual ke Dunia.<br />
          <span className="text-[#7EE8BC]">Foto & Bicara.</span><br />
          Selesai.
        </h1>
        <p className="text-[#A8D5C2] text-sm leading-relaxed mb-10">
          AI kami menerjemahkan produkmu ke 6 bahasa, menemukan buyer internasional, dan menangani semua komunikasi — tanpa kamu perlu bahasa Inggris sepatah pun.
        </p>

        <div className="flex flex-col gap-3 mb-12">
          <Link href="/login" className="bg-white text-[#0F4A33] font-bold py-4 px-6 rounded-2xl text-base text-center flex items-center justify-center gap-2">
            Mulai Jual Produk <ArrowRight size={18} />
          </Link>
          <Link href="/marketplace" className="border border-[#2E9E6E] text-[#7EE8BC] font-semibold py-4 px-6 rounded-2xl text-sm text-center">
            Lihat Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { num: '65,5 Jt', label: 'UMKM Indonesia' },
            { num: '6', label: 'Bahasa Target' },
            { num: '3', label: 'Langkah Saja' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-white text-2xl font-extrabold">{s.num}</div>
              <div className="text-[#A8D5C2] text-[10px] mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-[#A8D5C2] text-xs font-semibold mb-4 uppercase tracking-wider">Cara Kerja</p>
          <div className="flex flex-col gap-4">
            {[
              { icon: Camera, title: 'Foto Produk', desc: 'Ambil foto produkmu' },
              { icon: Mic, title: 'Ceritakan', desc: 'Bicara dalam bahasa apapun' },
              { icon: Globe, title: 'AI Bekerja', desc: 'Listing 6 bahasa otomatis' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <step.icon size={18} className="text-[#7EE8BC]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-[#A8D5C2] text-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}