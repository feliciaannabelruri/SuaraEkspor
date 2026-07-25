'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

interface ImpactMetrics {
  generatedAt: string;
  platformSince: string | null;
  sellers: { total: number; verified: number; withActiveProduct: number };
  buyers: { total: number };
  products: { total: number; byStatus: Record<string, number>; totalViews: number };
  listings: { total: number; byLanguage: Record<string, number> };
  engagement: { conversations: number; messages: number; whatsappMessages: number };
  transactions: { total: number; real: number; simulated: number; realGmvUsd: number };
}

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
      <p className="text-gray-500 text-xs font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="text-gray-400 text-[11px]">{hint}</p>}
    </div>
  );
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-gray-600 uppercase">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700">{count}</span>
    </div>
  );
}

export default function ImpactDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    apiClient
      .get('/impact')
      .then((res) => setMetrics(res.data.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Halaman ini khusus admin. Anda tidak memiliki akses.');
        } else {
          setError('Gagal memuat data impact metrics.');
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('se_token')) {
      router.push('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner fullHeight label="Memuat impact metrics..." />;
  if (error || !metrics) return <ErrorState message={error} onRetry={load} fullHeight />;

  const languageEntries = Object.entries(metrics.listings.byLanguage);
  const maxLanguageCount = Math.max(1, ...languageEntries.map(([, c]) => c));
  const sinceLabel = metrics.platformSince
    ? new Date(metrics.platformSince).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Impact & Adoption Metrics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Angka nyata dari database — bukan proyeksi. Sejak {sinceLabel}. Terakhir diperbarui{' '}
          {new Date(metrics.generatedAt).toLocaleString('id-ID')}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatTile label="Total Penjual (UMKM)" value={metrics.sellers.total} hint={`${metrics.sellers.verified} terverifikasi`} />
        <StatTile label="Penjual dengan Produk Aktif" value={metrics.sellers.withActiveProduct} />
        <StatTile label="Total Pembeli" value={metrics.buyers.total} />
        <StatTile label="Total Produk" value={metrics.products.total} />
        <StatTile label="Total Dilihat (Views)" value={metrics.products.totalViews} />
        <StatTile label="Listing Multibahasa" value={metrics.listings.total} />
        <StatTile label="Percakapan Buyer-Seller" value={metrics.engagement.conversations} />
        <StatTile label="Pesan Terkirim" value={metrics.engagement.messages} />
        <StatTile label="Pesan WhatsApp" value={metrics.engagement.whatsappMessages} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Transaksi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label="Total Transaksi" value={metrics.transactions.total} />
          <StatTile label="Transaksi Nyata" value={metrics.transactions.real} />
          <StatTile label="Transaksi Uji Coba" value={metrics.transactions.simulated} />
          <StatTile label="GMV Nyata (USD)" value={`$${metrics.transactions.realGmvUsd.toFixed(2)}`} hint="completed/released" />
        </div>
      </div>

      {languageEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Jangkauan Bahasa Listing</h2>
          <div className="flex flex-col gap-3">
            {languageEntries.map(([lang, count]) => (
              <Bar key={lang} label={lang} count={count} max={maxLanguageCount} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
