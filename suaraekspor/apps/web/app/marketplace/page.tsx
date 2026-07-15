'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import apiClient from '../../lib/api-client';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ProductCard from '../../components/ui/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';

interface ApiProduct {
  id: string;
  status: string;
  photoUrls: string[];
  recommendedPriceUsd?: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  category?: string | null;
  exportReadinessScore?: number | null;
  createdAt: string;
  listings: { languageCode: string; languageName: string; title: string; description: string; keywords: string[] }[];
  seller?: { name?: string | null; province?: string | null; businessName?: string | null } | null;
}

interface UiProduct {
  id: string;
  title: string;
  location: string;
  province: string;
  price: number;
  category: string;
  exportReady: boolean;
  langs: string[];
  added: string;
  image: string | null;
}

function mapProduct(p: ApiProduct): UiProduct {
  return {
    id: p.id,
    title: p.listings?.[0]?.title || 'Produk Tanpa Judul',
    location: p.seller?.businessName || p.seller?.name || p.seller?.province || '-',
    province: p.seller?.province || '-',
    price: p.recommendedPriceUsd ?? 0,
    category: p.category || 'Lainnya',
    exportReady: (p.exportReadinessScore ?? 0) >= 70,
    langs: (p.listings || []).map(l => l.languageCode.toUpperCase()),
    added: p.createdAt,
    image: p.photoUrls?.[0] || null,
  };
}

const CATEGORY_MAP: Record<string, string> = {
  'Semua': '',
  'Batik & Tekstil': 'tekstil',
  'Kerajinan Tangan': 'kerajinan',
  'Kopi & Kuliner': 'kuliner',
  'Pertanian & Tanaman': 'pertanian',
  'Lainnya': 'lainnya',
};

// All 38 Indonesian provinces
const ALL_PROVINCES = [
  'Semua Provinsi',
  'Aceh', 'Bali', 'Bangka Belitung', 'Banten', 'Bengkulu',
  'D.I. Yogyakarta', 'D.K.I. Jakarta', 'Gorontalo', 'Jambi',
  'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan Barat',
  'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur',
  'Kalimantan Utara', 'Kepulauan Riau', 'Lampung', 'Maluku',
  'Maluku Utara', 'Nusa Tenggara Barat (NTB)', 'Nusa Tenggara Timur (NTT)',
  'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Pegunungan',
  'Papua Selatan', 'Papua Tengah', 'Riau', 'Sulawesi Barat',
  'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara',
  'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara',
];

const LANG_CODES = ['EN', 'ZH', 'AR', 'JA', 'DE', 'ID'];
const ITEMS_PER_PAGE = 8;

const SORT_MAP: Record<string, string> = {
  'Terpopuler': 'export_ready',
  'Terbaru': 'newest',
  'Harga Terendah': 'price_asc',
  'Harga Tertinggi': 'price_desc',
};

interface FilterState {
  category: string;
  lang: string | null;
  province: string;
  minPrice: string;
  maxPrice: string;
  exportReady: boolean;
  inProgress: boolean;
}

const DEFAULT_FILTER: FilterState = {
  category: 'Semua',
  lang: null,
  province: 'Semua Provinsi',
  minPrice: '',
  maxPrice: '',
  exportReady: false,
  inProgress: false,
};

export default function MarketplacePage() {
  const { t } = useTranslation();

  const getCategoryTranslationKey = (cat: string) => {
    switch (cat) {
      case 'Semua': return 'mpCatAll';
      case 'Batik & Tekstil': return 'mpCatBatik';
      case 'Kerajinan Tangan': return 'mpCatCraft';
      case 'Kopi & Kuliner': return 'mpCatCoffee';
      case 'Pertanian & Tanaman': return 'mpCatAgriculture';
      case 'Lainnya': return 'mpCatOther';
      default: return '';
    }
  };

  // Pending = sidebar selections not yet applied
  const [pending, setPending] = useState<FilterState>({ ...DEFAULT_FILTER });
  // Applied = what's actually driving the grid
  const [applied, setApplied] = useState<FilterState>({ ...DEFAULT_FILTER });

  const [sortMode, setSortMode] = useState('Terpopuler');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const provinceRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<UiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Close province dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) {
        setProvinceOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setLoadError(null);
      try {
        const params: Record<string, string | number> = {
          lang: applied.lang ? applied.lang.toLowerCase() : 'en',
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: SORT_MAP[sortMode] || 'newest',
        };
        const catFilter = CATEGORY_MAP[applied.category];
        if (catFilter) params.category = catFilter;
        if (applied.province !== 'Semua Provinsi') params.province = applied.province;
        if (applied.minPrice) params.minPrice = applied.minPrice;
        if (applied.maxPrice) params.maxPrice = applied.maxPrice;
        if (applied.exportReady && !applied.inProgress) params.exportReady = 'true';
        if (applied.inProgress && !applied.exportReady) params.exportReady = 'false';

        const res = await apiClient.get('/marketplace', { params });
        if (cancelled) return;
        let data: ApiProduct[] = res.data?.data || [];
        if (applied.lang) {
          data = data.filter(p => p.listings && p.listings.length > 0);
        }
        setProducts(data.map(mapProduct));
        setTotal(res.data?.pagination?.total ?? data.length);
        setTotalPages(res.data?.pagination?.totalPages ?? 1);
      } catch (err) {
        if (!cancelled) {
          setLoadError('Gagal memuat produk. Silakan coba lagi.');
          setProducts([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [applied, sortMode, currentPage]);

  function toggleFavorite(id: string, e?: React.MouseEvent) {
    if (e) e.preventDefault();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function applyFilter() {
    setApplied({ ...pending });
    setCurrentPage(1);
  }

  function resetFilter() {
    setPending({ ...DEFAULT_FILTER });
    setApplied({ ...DEFAULT_FILTER });
    setCurrentPage(1);
  }

  const isFilterActive =
    applied.category !== 'Semua' ||
    applied.lang !== null ||
    applied.province !== 'Semua Provinsi' ||
    applied.minPrice !== '' ||
    applied.maxPrice !== '' ||
    applied.exportReady ||
    applied.inProgress;

  const hasPendingChanges = JSON.stringify(pending) !== JSON.stringify(applied);

  const pagedProducts = products;

  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 1) return [];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-background flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 md:px-16 py-6 md:py-12 flex flex-col md:flex-row gap-6 w-full">

        {/* ── SIDEBAR FILTER ────────────────────────────────── */}
        <aside className="hidden md:block w-[260px] flex-shrink-0">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-8 sticky top-24">

            {/* Kategori */}
            <div>
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                {t('Kategori') || 'Kategori'}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <li
                    key={cat}
                    onClick={() => {
                      setPending(prev => ({ ...prev, category: cat }));
                      setApplied(prev => ({ ...prev, category: cat }));
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-colors select-none ${pending.category === cat ? 'text-primary font-semibold' : 'hover:text-primary'}`}
                  >
                    {pending.category === cat && <span className="w-2 h-2 bg-secondary-container rounded-full flex-shrink-0" />}
                    {t(getCategoryTranslationKey(cat)) || cat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Provinsi Asal — custom upward dropdown */}
            <div>
              <h3 className="font-bold text-primary mb-3">{t('mpProvinceOrigin')}</h3>
              <div ref={provinceRef} className="relative">
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setProvinceOpen(prev => !prev)}
                  className="w-full bg-background border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:ring-1 focus:ring-primary outline-none"
                >
                  <span className={pending.province === 'Semua Provinsi' ? 'text-gray-600' : 'text-primary font-semibold'}>
                    {pending.province === 'Semua Provinsi' ? t('mpAllProvinces') : pending.province}
                  </span>
                  <span
                    className="material-symbols-outlined text-[18px] text-gray-600 transition-transform duration-200"
                    style={{ transform: provinceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown list — opens downward */}
                {provinceOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                    {ALL_PROVINCES.map(prov => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => {
                          setPending(prev => ({ ...prev, province: prov }));
                          setApplied(prev => ({ ...prev, province: prov }));
                          setProvinceOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          pending.province === prov ? 'text-primary font-semibold bg-gray-50' : 'text-gray-600'
                        }`}
                      >
                        {prov === 'Semua Provinsi' ? t('mpAllProvinces') : prov}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bahasa Tersedia */}
            <div>
              <h3 className="font-bold text-primary mb-3">{t('mpLangAvailable')}</h3>
              <div className="flex flex-wrap gap-2">
                {LANG_CODES.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      const newLang = pending.lang === code ? null : code;
                      setPending(prev => ({ ...prev, lang: newLang }));
                      setApplied(prev => ({ ...prev, lang: newLang }));
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 border rounded-lg text-sm font-bold transition-all ${
                      pending.lang === code
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga USD — fully functional */}
            <div>
              <h3 className="font-bold text-primary mb-3">{t('mpPriceRange')}</h3>
              <div className="flex items-center gap-2 mb-3">
                <input
                  className="w-1/2 bg-background border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Min"
                  type="number"
                  min="0"
                  value={pending.minPrice}
                  onChange={e => setPending(prev => ({ ...prev, minPrice: e.target.value }))}
                />
                <span className="text-gray-600 text-sm">–</span>
                <input
                  className="w-1/2 bg-background border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Max"
                  type="number"
                  min="0"
                  value={pending.maxPrice}
                  onChange={e => setPending(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
              {pending.minPrice || pending.maxPrice ? (
                <p className="text-xs text-secondary-container font-medium">
                  {pending.minPrice && !pending.maxPrice && `Minimal $${pending.minPrice}`}
                  {!pending.minPrice && pending.maxPrice && `Maksimal $${pending.maxPrice}`}
                  {pending.minPrice && pending.maxPrice && `$${pending.minPrice} – $${pending.maxPrice}`}
                </p>
              ) : null}
            </div>

            {/* Export Readiness */}
            <div>
              <h3 className="font-bold text-primary mb-3">Export Readiness</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    className="rounded border-gray-200 accent-primary"
                    type="checkbox"
                    checked={pending.exportReady}
                    onChange={e => {
                      const val = e.target.checked;
                      setPending(prev => ({ ...prev, exportReady: val }));
                      setApplied(prev => ({ ...prev, exportReady: val }));
                      setCurrentPage(1);
                    }}
                  />
                  <span className="group-hover:text-primary transition-colors">{t('mpExportReady')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    className="rounded border-gray-200 accent-primary"
                    type="checkbox"
                    checked={pending.inProgress}
                    onChange={e => {
                      const val = e.target.checked;
                      setPending(prev => ({ ...prev, inProgress: val }));
                      setApplied(prev => ({ ...prev, inProgress: val }));
                      setCurrentPage(1);
                    }}
                  />
                  <span className="group-hover:text-primary transition-colors">{t('mpInProgress')}</span>
                </label>
              </div>
            </div>

            {/* Apply Filter */}
            <button
              onClick={applyFilter}
              className={`w-full font-bold py-3 rounded-lg transition-all shadow-md active:scale-[0.98] ${
                hasPendingChanges
                  ? 'bg-secondary-container text-white hover:opacity-90'
                  : 'bg-secondary-container/60 text-white cursor-default'
              }`}
            >
              {t('Apply Filter') || 'Apply Filter'}
            </button>

            {isFilterActive && (
              <button onClick={resetFilter} className="w-full text-sm text-gray-600 hover:text-primary transition-colors underline">
                {t('Reset Filter') || 'Reset Filter'}
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <section className="flex-1 min-w-0">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-primary">{total}</span>
              <span className="text-gray-600 font-medium">{t('Produk Ditemukan') || 'Produk Ditemukan'}</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-4 py-2 font-medium text-sm text-primary hover:bg-gray-50 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm md:text-base">{t('Urutkan:') || 'Urutkan:'}</span>
                <select
                  value={sortMode}
                  onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-gray-200 rounded-lg px-3 md:px-4 py-2 font-medium text-sm md:text-base focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option>{t('Terpopuler') || 'Terpopuler'}</option>
                  <option>{t('Terbaru') || 'Terbaru'}</option>
                  <option>{t('mpSortPriceAsc')}</option>
                  <option>{t('mpSortPriceDesc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 mb-6">
              {applied.category !== 'Semua' && (
                <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.category}
                  <button onClick={() => { setApplied(p => ({ ...p, category: 'Semua' })); setPending(p => ({ ...p, category: 'Semua' })); setCurrentPage(1); }} className="ml-1 hover:text-secondary-container">✕</button>
                </span>
              )}
              {applied.province !== 'Semua Provinsi' && (
                <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.province}
                  <button onClick={() => { setApplied(p => ({ ...p, province: 'Semua Provinsi' })); setPending(p => ({ ...p, province: 'Semua Provinsi' })); setCurrentPage(1); }} className="ml-1 hover:text-secondary-container">✕</button>
                </span>
              )}
              {applied.lang && (
                <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.lang}
                  <button onClick={() => { setApplied(p => ({ ...p, lang: null })); setPending(p => ({ ...p, lang: null })); setCurrentPage(1); }} className="ml-1 hover:text-secondary-container">✕</button>
                </span>
              )}
              {(applied.minPrice || applied.maxPrice) && (
                <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.minPrice && applied.maxPrice ? `$${applied.minPrice}–$${applied.maxPrice}` : applied.minPrice ? `Min $${applied.minPrice}` : `Max $${applied.maxPrice}`}
                  <button onClick={() => { setApplied(p => ({ ...p, minPrice: '', maxPrice: '' })); setPending(p => ({ ...p, minPrice: '', maxPrice: '' })); setCurrentPage(1); }} className="ml-1 hover:text-secondary-container">✕</button>
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-24">
              <LoadingSpinner label="Memuat produk..." size="lg" />
            </div>
          )}

          {/* Error State */}
          {!loading && loadError && (
            <div className="py-24">
              <ErrorState title="Gagal Memuat" message={loadError} />
            </div>
          )}

          {/* Empty State */}
          {!loading && !loadError && pagedProducts.length === 0 && (
            <div className="py-24">
              <EmptyState 
                icon="inventory_2"
                title="Tidak ada produk ditemukan"
                description="Coba ubah filter kategori, provinsi, atau harga."
                cta={{ label: 'Reset Filter', onClick: resetFilter }}
              />
            </div>
          )}

          {/* Product Grid */}
          {!loading && !loadError && pagedProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  location={p.location}
                  price={p.price}
                  image={p.image}
                  exportReady={p.exportReady}
                  langs={p.langs}
                  isFavorite={favorites.has(p.id)}
                  onFavoriteToggle={(e) => toggleFavorite(p.id, e)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex gap-2">
                {getPageNumbers().map((p, i) =>
                  p === '...'
                    ? <span key={`e${i}`} className="px-2 self-end pb-2 text-gray-600">...</span>
                    : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${currentPage === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                      >{p}</button>
                    )
                )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}

        </section>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-background py-6 pb-12 px-6 shadow-xl border-l border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary">Filter Produk</h2>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Kategori */}
              <div>
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  Kategori
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                    <li
                      key={cat}
                      onClick={() => setPending(prev => ({ ...prev, category: cat }))}
                      className={`flex items-center gap-2 cursor-pointer transition-colors select-none py-1 ${pending.category === cat ? 'text-primary font-semibold' : 'hover:text-primary'}`}
                    >
                      {pending.category === cat && <span className="w-1.5 h-1.5 bg-secondary-container rounded-full flex-shrink-0" />}
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Provinsi Asal */}
              <div>
                <h3 className="font-bold text-primary mb-3">Provinsi Asal</h3>
                <select
                  value={pending.province}
                  onChange={e => setPending(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-primary"
                >
                  {ALL_PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Bahasa Tersedia */}
              <div>
                <h3 className="font-bold text-primary mb-3">Bahasa Tersedia</h3>
                <div className="flex flex-wrap gap-2">
                  {LANG_CODES.map((code) => (
                    <button
                      key={code}
                      onClick={() => setPending(prev => ({ ...prev, lang: prev.lang === code ? null : code }))}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                        pending.lang === code
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harga USD */}
              <div>
                <h3 className="font-bold text-primary mb-3">Harga (USD)</h3>
                <div className="flex items-center gap-2">
                  <input
                    className="w-1/2 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Min"
                    type="number"
                    min="0"
                    value={pending.minPrice}
                    onChange={e => setPending(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <span className="text-gray-600 text-sm">–</span>
                  <input
                    className="w-1/2 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Max"
                    type="number"
                    min="0"
                    value={pending.maxPrice}
                    onChange={e => setPending(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              {/* Export Readiness */}
              <div>
                <h3 className="font-bold text-primary mb-3">Export Readiness</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="rounded border-gray-200 accent-primary"
                      type="checkbox"
                      checked={pending.exportReady}
                      onChange={e => setPending(prev => ({ ...prev, exportReady: e.target.checked }))}
                    />
                    <span className="text-gray-600 hover:text-primary transition-colors">Ready to Export</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="rounded border-gray-200 accent-primary"
                      type="checkbox"
                      checked={pending.inProgress}
                      onChange={e => setPending(prev => ({ ...prev, inProgress: e.target.checked }))}
                    />
                    <span className="text-gray-600 hover:text-primary transition-colors">In Progress</span>
                  </label>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => { applyFilter(); setMobileFilterOpen(false); }}
                className="w-full font-bold py-3 bg-secondary-container text-white rounded-lg transition-all shadow-md hover:opacity-90 active:scale-[0.98]"
              >
                Apply Filter
              </button>

              {isFilterActive && (
                <button 
                  onClick={() => { resetFilter(); setMobileFilterOpen(false); }} 
                  className="w-full text-sm text-gray-600 hover:text-primary transition-colors underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}