'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const ALL_PRODUCTS = [
  { id: '1', title: 'Handwoven Rattan Bag', location: 'Pengrajin Bali', province: 'Bali', price: 42.00, category: 'KERAJINAN TANGAN', exportReady: true, langs: ['EN', 'ZH', 'AR'], added: '2024-01-10', popularity: 95, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiB8MGKxrm_v_wknhfwq_eNKONy8ObGnve3tcSrbGYKdvNNAulNSDYtHA6UMulOSqr_iYwlNZjL0PojIiUEbPaq1xls_KhtWUyyRLVuShmMMQ3Nwq77Ooy8I74KebuUps5i-AIn8gWg9InHqfdcq7PDaHabUg--HnOilCjUL8ukv6btNX8GSgO2nzdTzq6aGBYPggB0Yd9NWHtvsHReE03tUk7ScAAHjgcP5Amg_B9OP25gEXgJaUjlC320KH7I9ILNIDwjFgmNmsb' },
  { id: '2', title: 'Hand-Drawn Batik Silk', location: 'Pengrajin Solo', province: 'Jawa Tengah', price: 125.00, category: 'TEKSTIL & BATIK', exportReady: false, langs: ['EN', 'DE'], added: '2024-03-22', popularity: 60, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBprBrBBXUODnTs-brrmKPjKEIs71jWImBarFEwZAu_52Lsobc1tVIxXDbYHb0jaOgwvESRy06v-Pnh5aKTGeJsoAGM2TEJCl0bx4WdEzj2vV7AuxMJ55arUIrD__k1NCir8150urEh_d7oqOKobfcHPQJQcB44meM7Yh1iq7Lnm-GE93S8HI1oc26ojY5i7RlBzSm5oq7R5fYs7jUpFZbClDJcusHannVcPYClgZeKApJTGoxhoUiMeo5ft-uLLSPcloMefM4BWD1J' },
  { id: '3', title: 'Single Origin Arabica', location: 'Petani Aceh', province: 'Aceh', price: 28.00, category: 'KOPI & TEH', exportReady: true, langs: ['EN', 'JA'], added: '2024-05-01', popularity: 80, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcM6oTXx3DAQ-M18BhYaSoMa9iQWDoqQW9NEzD5K2Txb9aLytHmGL88fukOpOpFpVydugE60AhhqRB8pqhNJ8pylPKvlmD6kE9auxDt8_EBeFk51hB1kjAStxhk5Imgd3H-PeaINzXfua7MrW0R33JlEjrg8yjBGGM5J_2Ufx9bzldrxUmsjC7_j0uLkJxG7mmaL6gZduovcnBMMzcmshEZXMfgYLKLkG51pRgrEI6KHKwelGUjkZpY4O8JSro26fyBXitaD5tS8Po' },
  { id: '4', title: 'Bamboo Zen Lampshade', location: 'Pengrajin Yogyakarta', province: 'D.I. Yogyakarta', price: 55.00, category: 'FURNITUR', exportReady: false, langs: ['EN', 'DE'], added: '2024-02-15', popularity: 45, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrk74WEWxjXWfuui04KjqsBS_CGLA3dgJL4ZtOO2EbiJQyE7PRaBYsEZDggaiLcbButTKofvRO5533N8t_KF22QzNwcwWs3Ssqp5w7EgzqahK8SJW_IUzCbKqdiMQmuxUJnhBxQkgeuepuYXolxi72Q8zKVO9kG9nKvNbuYl7dfap0D2G6TbdHdcz5AJPptWJajoBHHYHI8NWJXJDsIkOWV4HYU2gHuGNdAoJYYpsyvRjbQU77cvrpAjscg-W7k5EDlPPdVbINZYn' },
  { id: '5', title: 'Tenun Ikat Sumba', location: 'Penenun NTT', province: 'Nusa Tenggara Timur', price: 89.00, category: 'TEKSTIL & BATIK', exportReady: true, langs: ['EN', 'ZH'], added: '2024-04-08', popularity: 72, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGq48dm5NPUvIc_bm1kWULANlu30X7yJsnHol4zTv1x4mXsH-LAPCVwRcTUQs-CuKivm6qE-VRDiSv8uvo5supl3JVy70zYoBTEak3KDS3JP0omZ0CA8a8Y_mbsh_qiEcRa0XYZ4NkuK1F1LI4XAn067HomkuoJ6Hdpl1hquhUBzdMU88DYg7dkuav_YVz_UOH4HbB-iFhyrHBlPpEfla0KAY9aZrN_g0mciw_VehJWzgL0QTaPEFSxtw5jLE90t2XWoz__E-F97s6' },
  { id: '6', title: 'Organic Virgin Coconut Oil', location: 'Petani Sulawesi', province: 'Sulawesi Tengah', price: 18.00, category: 'KOSMETIK NATURAL', exportReady: false, langs: ['EN', 'ZH', 'AR'], added: '2024-06-12', popularity: 88, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMl2Ysv8iD2TiD94wJ4ImRdUZwOpzhxb5CsZ6QGMc9thQNcq6UGoZN5BQG9P85D54qABA_bXsxN1WiJW8Xy4mCRUow9e5pc-p7HKkY_fiMZytOFfb5RGpd66-xT_1GEaTHBDfieo7iyWiBzWaa7GWTC2Cumf4am4gTpaAI-NiBXXcw6aMngIrGOhb0uTa3_0tEThJeLpC1Wz9pu9h5M-L5z5ko_MugHCy2t2Yz2h8ewhPStuXz60TmErTEqRppjDDiCaTc-DaUu_dr' },
  { id: '7', title: 'Wayang Kulit Wall Art', location: 'Pengrajin Jawa', province: 'Jawa Tengah', price: 210.00, category: 'KERAJINAN TANGAN', exportReady: true, langs: ['EN', 'ZH'], added: '2024-01-25', popularity: 55, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0116unN5GcDIGwcPjo-8Hq5-F7y9gBHY5OFtNlHJyRex84ZU8IL0uy13XU_JTQPhJRqgpvUeJzSWgHYqkoMlFlBn2-_5zfPIhScdZmb627iMpjTJVjSaG7OUnpL8QjN11t1y7kUXfAV4usfo5tgtlC4HLt7NV2-U81nUVaV7kFUVLEG6W6pzcKTwrU3CWpEsJ8DCtR6IqRQej7p7fHdLJxlXWjpds3PDV_vPvHXc5MZCerPKf9l33mT9weWieOCUC9acwCt40rZ_W' },
  { id: '8', title: 'Batik Tulis Premium', location: 'Pengrajin Pekalongan', province: 'Jawa Tengah', price: 95.00, category: 'TEKSTIL & BATIK', exportReady: true, langs: ['EN', 'DE', 'JA'], added: '2024-03-05', popularity: 91, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm1rmy2wRqElvx-tI6arxloke-i3IBxDqWv9QN5VI6Kc2OFOkwTo3-C3xRu06mxGzM2QsfQTaTNIcKIPLAV3_9woNWQ3_Xj9xCEAyHz_pSsyYNILiPgd8QCx5ixJvQ8Bh0qLaV8nh4gZ5ioWAMindMQXEIbm2c3jEM7Off-zEfhtUWyPp2qS0E4DRSFaEfqzulb4NRBYeeFccu8x-Q2uA8IigIe5s6SylzeAHnIZZWx-NOHZWBHgQQUGN4qOOmOzeDijm8rgxuFxdt' },
];

const CATEGORY_MAP: Record<string, string> = {
  'Semua': '',
  'Kerajinan Tangan': 'KERAJINAN TANGAN',
  'Tekstil & Batik': 'TEKSTIL & BATIK',
  'Kopi & Teh': 'KOPI & TEH',
  'Furnitur': 'FURNITUR',
  'Makanan & Minuman': 'MAKANAN & MINUMAN',
  'Kosmetik Natural': 'KOSMETIK NATURAL',
};

// All 38 Indonesian provinces
const ALL_PROVINCES = [
  'Semua Provinsi',
  'Aceh', 'Bali', 'Bangka Belitung', 'Banten', 'Bengkulu',
  'D.I. Yogyakarta', 'D.K.I. Jakarta', 'Gorontalo', 'Jambi',
  'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan Barat',
  'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur',
  'Kalimantan Utara', 'Kepulauan Riau', 'Lampung', 'Maluku',
  'Maluku Utara', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Pegunungan',
  'Papua Selatan', 'Papua Tengah', 'Riau', 'Sulawesi Barat',
  'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara',
  'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara',
];

const LANG_CODES = ['EN', 'ZH', 'AR', 'JA', 'DE'];
const ITEMS_PER_PAGE = 8;

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

  function toggleFavorite(id: string) {
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

  // ── Filtered + sorted ──
  const filteredProducts = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    // Category
    const catFilter = CATEGORY_MAP[applied.category];
    if (catFilter) list = list.filter(p => p.category === catFilter);

    // Language
    if (applied.lang) list = list.filter(p => p.langs.includes(applied.lang!));

    // Province
    if (applied.province !== 'Semua Provinsi') {
      list = list.filter(p => p.province === applied.province);
    }

    // Price min
    const minVal = parseFloat(applied.minPrice);
    if (!isNaN(minVal)) list = list.filter(p => p.price >= minVal);

    // Price max
    const maxVal = parseFloat(applied.maxPrice);
    if (!isNaN(maxVal)) list = list.filter(p => p.price <= maxVal);

    // Export readiness
    if (applied.exportReady && !applied.inProgress) list = list.filter(p => p.exportReady);
    if (applied.inProgress && !applied.exportReady) list = list.filter(p => !p.exportReady);

    // Sort
    switch (sortMode) {
      case 'Terbaru':        list.sort((a, b) => new Date(b.added).getTime() - new Date(a.added).getTime()); break;
      case 'Harga Terendah': list.sort((a, b) => a.price - b.price); break;
      case 'Harga Tertinggi': list.sort((a, b) => b.price - a.price); break;
      default:               list.sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [applied, sortMode]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pagedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    <div className="min-h-screen bg-[#FDF0E8] font-body-md text-[#1c1b1b] flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 md:px-16 py-6 md:py-12 flex flex-col md:flex-row gap-6 w-full">

        {/* ── SIDEBAR FILTER ────────────────────────────────── */}
        <aside className="hidden md:block w-[260px] flex-shrink-0">
          <div className="bg-white rounded-xl p-6 border border-[#c1c8c4] shadow-sm space-y-8 sticky top-24">

            {/* Kategori */}
            <div>
              <h3 className="font-bold text-[#01261f] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                Kategori
              </h3>
              <ul className="space-y-3 text-[#414846]">
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <li
                    key={cat}
                    onClick={() => setPending(prev => ({ ...prev, category: cat }))}
                    className={`flex items-center gap-2 cursor-pointer transition-colors select-none ${pending.category === cat ? 'text-[#01261f] font-semibold' : 'hover:text-[#01261f]'}`}
                  >
                    {pending.category === cat && <span className="w-2 h-2 bg-[#fe802f] rounded-full flex-shrink-0" />}
                    {cat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Provinsi Asal — custom upward dropdown */}
            <div>
              <h3 className="font-bold text-[#01261f] mb-3">Provinsi Asal</h3>
              <div ref={provinceRef} className="relative">
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setProvinceOpen(prev => !prev)}
                  className="w-full bg-[#FDF0E8] border border-[#c1c8c4] rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:ring-1 focus:ring-[#01261f] outline-none"
                >
                  <span className={pending.province === 'Semua Provinsi' ? 'text-[#414846]' : 'text-[#01261f] font-semibold'}>
                    {pending.province}
                  </span>
                  <span
                    className="material-symbols-outlined text-[18px] text-[#414846] transition-transform duration-200"
                    style={{ transform: provinceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown list — opens downward */}
                {provinceOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#c1c8c4] rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                    {ALL_PROVINCES.map(prov => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => {
                          setPending(prev => ({ ...prev, province: prov }));
                          setProvinceOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f0eded] transition-colors ${
                          pending.province === prov ? 'text-[#01261f] font-semibold bg-[#f0eded]' : 'text-[#414846]'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bahasa Tersedia */}
            <div>
              <h3 className="font-bold text-[#01261f] mb-3">Bahasa Tersedia</h3>
              <div className="flex flex-wrap gap-2">
                {LANG_CODES.map((code) => (
                  <button
                    key={code}
                    onClick={() => setPending(prev => ({ ...prev, lang: prev.lang === code ? null : code }))}
                    className={`px-3 py-1.5 border rounded-lg text-sm font-bold transition-all ${
                      pending.lang === code
                        ? 'bg-[#01261f] text-white border-[#01261f]'
                        : 'bg-white text-[#414846] border-[#c1c8c4] hover:border-[#01261f] hover:text-[#01261f]'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga USD — fully functional */}
            <div>
              <h3 className="font-bold text-[#01261f] mb-3">Harga (USD)</h3>
              <div className="flex items-center gap-2 mb-3">
                <input
                  className="w-1/2 bg-[#FDF0E8] border border-[#c1c8c4] rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#01261f]"
                  placeholder="Min"
                  type="number"
                  min="0"
                  value={pending.minPrice}
                  onChange={e => setPending(prev => ({ ...prev, minPrice: e.target.value }))}
                />
                <span className="text-[#414846] text-sm">–</span>
                <input
                  className="w-1/2 bg-[#FDF0E8] border border-[#c1c8c4] rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#01261f]"
                  placeholder="Max"
                  type="number"
                  min="0"
                  value={pending.maxPrice}
                  onChange={e => setPending(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
              {pending.minPrice || pending.maxPrice ? (
                <p className="text-xs text-[#fe802f] font-medium">
                  {pending.minPrice && !pending.maxPrice && `Minimal $${pending.minPrice}`}
                  {!pending.minPrice && pending.maxPrice && `Maksimal $${pending.maxPrice}`}
                  {pending.minPrice && pending.maxPrice && `$${pending.minPrice} – $${pending.maxPrice}`}
                </p>
              ) : null}
            </div>

            {/* Export Readiness */}
            <div>
              <h3 className="font-bold text-[#01261f] mb-3">Export Readiness</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    className="rounded border-[#c1c8c4] accent-[#1a3c34]"
                    type="checkbox"
                    checked={pending.exportReady}
                    onChange={e => setPending(prev => ({ ...prev, exportReady: e.target.checked }))}
                  />
                  <span className="group-hover:text-[#01261f] transition-colors">Ready to Export</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    className="rounded border-[#c1c8c4] accent-[#1a3c34]"
                    type="checkbox"
                    checked={pending.inProgress}
                    onChange={e => setPending(prev => ({ ...prev, inProgress: e.target.checked }))}
                  />
                  <span className="group-hover:text-[#01261f] transition-colors">In Progress</span>
                </label>
              </div>
            </div>

            {/* Apply Filter */}
            <button
              onClick={applyFilter}
              className={`w-full font-bold py-3 rounded-lg transition-all shadow-md active:scale-[0.98] ${
                hasPendingChanges
                  ? 'bg-[#fe802f] text-white hover:brightness-110'
                  : 'bg-[#fe802f]/60 text-white cursor-default'
              }`}
            >
              Apply Filter
            </button>

            {isFilterActive && (
              <button onClick={resetFilter} className="w-full text-sm text-[#414846] hover:text-[#01261f] transition-colors underline">
                Reset Filter
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <section className="flex-1 min-w-0">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-[#01261f]">{filteredProducts.length}</span>
              <span className="text-[#414846] font-medium">Produk Ditemukan</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1.5 bg-white border border-[#c1c8c4] rounded-lg px-4 py-2 font-medium text-sm text-[#01261f] hover:bg-[#f0eded] shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[#414846] text-sm md:text-base">Urutkan:</span>
                <select
                  value={sortMode}
                  onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-[#c1c8c4] rounded-lg px-3 md:px-4 py-2 font-medium text-sm md:text-base focus:ring-1 focus:ring-[#01261f] outline-none cursor-pointer"
                >
                  <option>Terpopuler</option>
                  <option>Terbaru</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 mb-6">
              {applied.category !== 'Semua' && (
                <span className="flex items-center gap-1 bg-[#1a3c34] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.category}
                  <button onClick={() => { setApplied(p => ({ ...p, category: 'Semua' })); setPending(p => ({ ...p, category: 'Semua' })); setCurrentPage(1); }} className="ml-1 hover:text-[#fe802f]">✕</button>
                </span>
              )}
              {applied.province !== 'Semua Provinsi' && (
                <span className="flex items-center gap-1 bg-[#1a3c34] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.province}
                  <button onClick={() => { setApplied(p => ({ ...p, province: 'Semua Provinsi' })); setPending(p => ({ ...p, province: 'Semua Provinsi' })); setCurrentPage(1); }} className="ml-1 hover:text-[#fe802f]">✕</button>
                </span>
              )}
              {applied.lang && (
                <span className="flex items-center gap-1 bg-[#1a3c34] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.lang}
                  <button onClick={() => { setApplied(p => ({ ...p, lang: null })); setPending(p => ({ ...p, lang: null })); setCurrentPage(1); }} className="ml-1 hover:text-[#fe802f]">✕</button>
                </span>
              )}
              {(applied.minPrice || applied.maxPrice) && (
                <span className="flex items-center gap-1 bg-[#1a3c34] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {applied.minPrice && applied.maxPrice ? `$${applied.minPrice}–$${applied.maxPrice}` : applied.minPrice ? `Min $${applied.minPrice}` : `Max $${applied.maxPrice}`}
                  <button onClick={() => { setApplied(p => ({ ...p, minPrice: '', maxPrice: '' })); setPending(p => ({ ...p, minPrice: '', maxPrice: '' })); setCurrentPage(1); }} className="ml-1 hover:text-[#fe802f]">✕</button>
                </span>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#414846]">
              <span className="material-symbols-outlined text-6xl text-[#c1c8c4]">inventory_2</span>
              <p className="text-lg font-semibold">Tidak ada produk ditemukan</p>
              <p className="text-sm">Coba ubah filter kategori, provinsi, atau harga</p>
              <button onClick={resetFilter} className="mt-2 px-6 py-2 bg-[#fe802f] text-white font-bold rounded-lg hover:brightness-110 transition-all">
                Reset Filter
              </button>
            </div>
          )}

          {/* Product Grid */}
          {pagedProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {pagedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/marketplace/${p.id}`}
                  className="bg-white rounded-xl border border-[#c1c8c4] p-3 hover:border-[#1a3c34] hover:-translate-y-1 transition-all duration-300 relative group block"
                  style={{ boxShadow: '0 4px 20px -2px rgba(26, 60, 52, 0.05)' }}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {/* Badges — stacked vertically at top-left to avoid overlap */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                      <span className="bg-[#1a3c34]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded self-start tracking-wide">{p.category}</span>
                      {p.exportReady && (
                        <span className="bg-[#fe802f]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded self-start tracking-wide">EXPORT READY</span>
                      )}
                    </div>
                    {/* Favorite Button positioned inside the image relative container */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(p.id); }}
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:text-red-500 transition-colors z-10"
                    >
                      <span className="material-symbols-outlined text-[18px] md:text-[20px]" style={{ fontVariationSettings: favorites.has(p.id) ? "'FILL' 1" : "'FILL' 0", color: favorites.has(p.id) ? '#ef4444' : 'inherit' }}>favorite</span>
                    </button>
                  </div>
                  <div className="space-y-1 px-1">
                    <h4 className="font-bold text-[#01261f] truncate text-sm md:text-base">{p.title}</h4>
                    <div className="flex items-center gap-1 text-[#414846] text-[11px] md:text-[12px]">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {p.location}
                    </div>
                    <div className="flex justify-between items-center pt-2 flex-wrap gap-1">
                      <span className="text-[#fe802f] font-bold text-lg md:text-2xl">${p.price.toFixed(2)}</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {p.langs.slice(0, 2).map((l) => (
                          <span key={l} className="text-[8px] md:text-[9px] font-bold px-1 md:px-1.5 py-0.5 rounded bg-[#f0eded] text-[#414846] border border-[#c1c8c4]">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#c1c8c4] hover:bg-[#1a3c34] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex gap-2">
                {getPageNumbers().map((p, i) =>
                  p === '...'
                    ? <span key={`e${i}`} className="px-2 self-end pb-2 text-[#414846]">...</span>
                    : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${currentPage === p ? 'bg-[#1a3c34] text-white' : 'border border-[#c1c8c4] hover:bg-[#f0eded]'}`}
                      >{p}</button>
                    )
                )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#c1c8c4] hover:bg-[#1a3c34] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#FDF0E8] py-6 pb-12 px-6 shadow-xl border-l border-[#c1c8c4] transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#01261f]">Filter Produk</h2>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-[#01261f]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Kategori */}
              <div>
                <h3 className="font-bold text-[#01261f] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  Kategori
                </h3>
                <ul className="space-y-2 text-[#414846] text-sm">
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                    <li
                      key={cat}
                      onClick={() => setPending(prev => ({ ...prev, category: cat }))}
                      className={`flex items-center gap-2 cursor-pointer transition-colors select-none py-1 ${pending.category === cat ? 'text-[#01261f] font-semibold' : 'hover:text-[#01261f]'}`}
                    >
                      {pending.category === cat && <span className="w-1.5 h-1.5 bg-[#fe802f] rounded-full flex-shrink-0" />}
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Provinsi Asal */}
              <div>
                <h3 className="font-bold text-[#01261f] mb-3">Provinsi Asal</h3>
                <select
                  value={pending.province}
                  onChange={e => setPending(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full bg-white border border-[#c1c8c4] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#01261f] outline-none text-[#01261f]"
                >
                  {ALL_PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Bahasa Tersedia */}
              <div>
                <h3 className="font-bold text-[#01261f] mb-3">Bahasa Tersedia</h3>
                <div className="flex flex-wrap gap-2">
                  {LANG_CODES.map((code) => (
                    <button
                      key={code}
                      onClick={() => setPending(prev => ({ ...prev, lang: prev.lang === code ? null : code }))}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                        pending.lang === code
                          ? 'bg-[#01261f] text-white border-[#01261f]'
                          : 'bg-white text-[#414846] border-[#c1c8c4] hover:border-[#01261f]'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harga USD */}
              <div>
                <h3 className="font-bold text-[#01261f] mb-3">Harga (USD)</h3>
                <div className="flex items-center gap-2">
                  <input
                    className="w-1/2 bg-white border border-[#c1c8c4] rounded px-2 py-1.5 text-sm outline-none"
                    placeholder="Min"
                    type="number"
                    min="0"
                    value={pending.minPrice}
                    onChange={e => setPending(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <span className="text-[#414846] text-sm">–</span>
                  <input
                    className="w-1/2 bg-white border border-[#c1c8c4] rounded px-2 py-1.5 text-sm outline-none"
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
                <h3 className="font-bold text-[#01261f] mb-3">Export Readiness</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="rounded border-[#c1c8c4] accent-[#1a3c34]"
                      type="checkbox"
                      checked={pending.exportReady}
                      onChange={e => setPending(prev => ({ ...prev, exportReady: e.target.checked }))}
                    />
                    <span>Ready to Export</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="rounded border-[#c1c8c4] accent-[#1a3c34]"
                      type="checkbox"
                      checked={pending.inProgress}
                      onChange={e => setPending(prev => ({ ...prev, inProgress: e.target.checked }))}
                    />
                    <span>In Progress</span>
                  </label>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => { applyFilter(); setMobileFilterOpen(false); }}
                className="w-full font-bold py-3 bg-[#fe802f] text-white rounded-lg transition-all shadow-md hover:brightness-110 active:scale-[0.98]"
              >
                Apply Filter
              </button>

              {isFilterActive && (
                <button 
                  onClick={() => { resetFilter(); setMobileFilterOpen(false); }} 
                  className="w-full text-sm text-[#414846] hover:text-[#01261f] transition-colors underline"
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