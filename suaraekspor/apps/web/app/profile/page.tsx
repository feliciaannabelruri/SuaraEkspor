'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CheckCircle from '@/components/ui/CheckCircle';
import apiClient from '@/lib/api-client';
import { useTranslation } from '@/hooks/useTranslation';
import { User, Shield, CheckCircle2, Save, ArrowLeft } from 'lucide-react';

/** Read a single field from the se_user localStorage entry synchronously */
function readUserField(field: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('se_user');
    if (raw) return JSON.parse(raw)?.[field] || '';
  } catch {}
  return '';
}

export default function ProfilePage() {
  const router = useRouter();

  // NOTE: role/name/etc must start as SSR-safe neutral defaults (no localStorage read
  // during the initial render) — reading localStorage synchronously in a useState
  // initializer causes a hydration mismatch, since the server has no `window` but the
  // client's first (hydrating) render already does. Real values are hydrated from
  // localStorage inside the effect below instead, which only ever runs client-side.
  const [role, setRole] = useState<'seller' | 'buyer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [province, setProvince] = useState('');
  const [localLanguage, setLocalLanguage] = useState('id');
  const [address, setAddress] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }

    // Fast paint from cached localStorage data (client-only, so no hydration mismatch)
    // while the fresh /users/me request below is in flight.
    const cachedRole = readUserField('role') as 'seller' | 'buyer' | 'admin' | '';
    if (cachedRole) setRole(cachedRole);
    setPhone(readUserField('phone'));
    setName(readUserField('name'));
    setBusinessName(readUserField('businessName'));
    setProvince(readUserField('province'));
    setLocalLanguage(readUserField('localLanguage') || 'id');
    setAddress(readUserField('address'));

    async function loadProfile() {
      try {
        const res = await apiClient.get('/users/me');
        const user = res.data?.data;
        if (user) {
          setRole(user.role);
          setPhone(user.phone);
          setName(user.name || '');
          setBusinessName(user.businessName || '');
          setProvince(user.province || '');
          setLocalLanguage(user.localLanguage || 'id');
          setAddress(user.address || '');
        }
      } catch (err) {
        setError('Gagal memuat profil Anda.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await apiClient.patch('/users/me', {
        name,
        businessName: role === 'seller' ? businessName : undefined,
        province: role === 'seller' ? province : undefined,
        localLanguage,
        address,
      });
      // Update localStorage with fresh data
      localStorage.setItem('se_user', JSON.stringify(res.data?.data));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      {/* Neutral full-screen spinner while role is not yet known.
          We render NOTHING else (no Navbar, no Sidebar) to prevent any flash.
          Once role resolves, the correct layout is mounted. */}
      {role === null ? (
        <div className="flex-1 w-full min-h-screen flex items-center justify-center">
          <LoadingSpinner label="" />
        </div>
      ) : (
        <>
          {/* Sidebar — only for confirmed sellers */}
          {role === 'seller' && <Sidebar />}

          {/* Main Container */}
          <main className={`w-full ${
            role === 'seller' ? 'md:w-[calc(100%-14rem)] md:ml-56 pb-24 md:pb-12' : ''
          } min-h-screen bg-background flex flex-col relative`}>
            {/* Navbar — only for confirmed non-sellers */}
            {role !== 'seller' && <Navbar />}

        {/* Modal: Save Success */}
        {saveSuccess && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center animate-[fadeIn_0.2s_ease-out]">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{t('pfSuccessTitle')}</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {t('pfSuccessDesc')}
              </p>
              <button
                onClick={() => setSaveSuccess(false)}
                className="w-full bg-gray-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="px-4 md:px-8 max-w-[800px] w-full mx-auto pt-6 md:pt-10">
          
          {/* Back button for buyers */}
          {role !== 'seller' && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-container hover:underline mb-6 text-left"
            >
              <ArrowLeft size={14} /> {t('pfBack')}
            </Link>
          )}

          {/* Heading */}
          <div className="mb-8 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('pfAccountLabel')}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary mt-1">{t('pfTitle')}</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{t('pfSubtitle')}</p>
          </div>

          {loading ? (
            <div className="py-24">
              <LoadingSpinner label="Memuat profil Anda..." />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500 font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                Coba Lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 text-left">
              {/* Profile Badge Status */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{phone}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    {t('pfRole')}: <span className="text-secondary-container">{role === 'seller' ? 'Penjual (UMKM)' : 'Pembeli (Buyer)'}</span>
                  </p>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('pfName')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800"
                    placeholder="Masukkan nama"
                  />
                </div>

                {/* Seller Specific Fields */}
                {role === 'seller' && (
                  <>
                    {/* Business Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('pfBusinessName')}</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800"
                        placeholder="Nama Toko / UMKM Anda"
                      />
                    </div>

                    {/* Origin Province */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('pfProvince')}</label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800"
                        placeholder="Contoh: Jawa Tengah, Bali, Jawa Timur"
                      />
                    </div>
                  </>
                )}

                {/* Local Language (Region specific for seller, preference for buyer) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('pfLanguage')}
                  </label>
                  <select
                    value={localLanguage}
                    onChange={(e) => setLocalLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="jv">Bahasa Jawa</option>
                    <option value="su">Bahasa Sunda</option>
                    <option value="en">English (Inggris)</option>
                    <option value="zh">Chinese (Mandarin)</option>
                    <option value="ja">Japanese (Jepang)</option>
                    <option value="ar">Arabic (Arab)</option>
                    <option value="de">German (Jerman)</option>
                  </select>
                </div>

                {/* Address (Shippng address for buyer, warehouse address for seller) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {role === 'seller' ? t('pfAddressSeller') : t('pfAddressBuyer')}
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800 resize-none"
                    placeholder={role === 'seller' ? "Masukkan alamat penjemputan barang dagangan" : "Masukkan alamat pengiriman tujuan luar negeri"}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? t('pfSaving') : t('pfSaveBtn')}
                </button>
              </div>
            </form>
          )}

          {/* Kelola UMKM Lain — dipindah ke halaman tersendiri */}
          {role === 'seller' && (
            <div className="mt-8 pb-12 text-center">
              <Link
                href="/kelola-umkm"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Kelola UMKM Lain / Lihat Pengelola Akun Anda
              </Link>
            </div>
          )}

        </div>

          {/* Mobile bottom navigation bar */}
          {role === 'seller' && <MobileBottomNav />}
          {role !== 'seller' && <Footer />}
          </main>
        </>
      )}
    </div>
  );
}
