'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Check, Sparkles, Building2 } from 'lucide-react';

interface Plan {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  successFee: string;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    tagline: 'Untuk UMKM yang baru mulai ekspor',
    price: 'Gratis',
    priceNote: 'Tanpa biaya bulanan',
    successFee: 'Komisi 5% hanya saat transaksi berhasil',
    cta: 'Mulai Gratis',
    ctaHref: '/register',
    features: [
      'Listing produk tanpa batas',
      'AI voice-to-listing (foto + suara → deskripsi multibahasa)',
      'AI Communication Agent untuk balasan buyer',
      'Rekomendasi harga ekspor dasar',
      'Dokumen legal ekspor (invoice, packing list, COO)',
    ],
  },
  {
    name: 'Growth',
    tagline: 'Untuk UMKM yang sudah aktif bertransaksi',
    price: 'Rp149rb',
    priceNote: 'per bulan',
    successFee: 'Komisi turun jadi 3% per transaksi berhasil',
    cta: 'Upgrade ke Growth',
    ctaHref: '/register',
    highlighted: true,
    badge: 'Paling Diminati',
    features: [
      'Semua fitur Starter',
      'Prioritas tampil di halaman utama marketplace',
      'Analitik performa listing lanjutan',
      'Export Advisor AI tanpa batas',
      'Promo-kit media sosial tanpa batas',
      'Dukungan prioritas',
    ],
  },
  {
    name: 'Mitra Institusi',
    tagline: 'Untuk Dinas KUKM, koperasi, dan pendamping UMKM',
    price: 'Custom',
    priceNote: 'Sesuai jumlah UMKM binaan',
    successFee: 'Skema komisi dinegosiasikan',
    cta: 'Hubungi Kami',
    ctaHref: '/register',
    features: [
      'Kelola banyak UMKM binaan dari satu akun (mode middleman)',
      'Dashboard dampak & adopsi lintas UMKM',
      'Onboarding & pendampingan bersama',
      'Co-branding dengan program dinas/koperasi',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* Header Banner */}
      <section className="bg-primary text-white py-16 md:py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,128,47,0.15),transparent_40%)]" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-secondary-container text-xs font-bold tracking-[0.2em] uppercase">Paket & Harga</span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Mulai gratis, bayar hanya saat berhasil ekspor
          </h1>
          <p className="text-on-primary-container text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Tidak ada biaya di muka. SuaraEkspor hanya mendapat komisi ketika UMKM juga mendapat penjualan.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-16 md:py-24 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-all ${
                plan.highlighted
                  ? 'bg-white border-primary shadow-lg md:-translate-y-3'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles size={12} />
                  {plan.badge}
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {plan.name === 'Mitra Institusi' && <Building2 size={18} className="text-primary" />}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-xs text-gray-500">{plan.tagline}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-400">{plan.priceNote}</span>
                </div>
                <p className="text-xs font-semibold text-secondary-container mt-2">{plan.successFee}</p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                    <Check size={15} className="text-secondary-container mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full text-center font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:opacity-90 shadow-sm'
                    : 'bg-secondary-container text-white hover:opacity-90'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-12 max-w-xl mx-auto leading-relaxed">
          Paket dan komisi di atas adalah rancangan model bisnis awal SuaraEkspor dan dapat berubah
          seiring hasil pilot bersama UMKM. Pembayaran dan penagihan langganan belum aktif pada
          tahap prototipe ini.
        </p>
      </section>

      <Footer />
    </div>
  );
}
