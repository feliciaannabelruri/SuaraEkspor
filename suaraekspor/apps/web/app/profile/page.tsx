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
import { useMiddleman } from '../context/middleman-context';

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

  // Initialise role and form fields synchronously from localStorage so the correct
  // layout (Sidebar for sellers, Navbar for buyers) is painted on the first render
  // with no spinner flash at all. The API call below will refresh these values.
  const [role, setRole] = useState<'seller' | 'buyer' | 'admin' | null>(
    () => (readUserField('role') as 'seller' | 'buyer' | 'admin') || null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Fields — pre-filled from localStorage so they appear instantly
  const [phone, setPhone] = useState(() => readUserField('phone'));
  const [name, setName] = useState(() => readUserField('name'));
  const [businessName, setBusinessName] = useState(() => readUserField('businessName'));
  const [province, setProvince] = useState(() => readUserField('province'));
  const [localLanguage, setLocalLanguage] = useState(() => readUserField('localLanguage') || 'id');
  const [address, setAddress] = useState(() => readUserField('address'));
  const { t } = useTranslation();

  // Middleman Feature States
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [managedSellers, setManagedSellers] = useState<any[]>([]);
  const [activeManagers, setActiveManagers] = useState<any[]>([]);
  const [targetPhone, setTargetPhone] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const { refreshSellers } = useMiddleman();

  async function fetchMiddlemanData() {
    try {
      const resSellers = await apiClient.get('/middleman/my-sellers');
      if (resSellers.data?.success) {
        setManagedSellers(resSellers.data.data);
      }
      const resReqs = await apiClient.get('/middleman/pending-requests');
      if (resReqs.data?.success) {
        setPendingRequests(resReqs.data.data);
      }
      const resManagers = await apiClient.get('/middleman/my-managers');
      if (resManagers.data?.success) {
        setActiveManagers(resManagers.data.data);
      }
    } catch (err) {
      console.error('Failed to load middleman data:', err);
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }

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

          if (user.role === 'seller') {
            // Load middleman relationships in background
            apiClient.get('/middleman/my-sellers')
              .then(r => r.data?.success && setManagedSellers(r.data.data))
              .catch(() => {});
            apiClient.get('/middleman/pending-requests')
              .then(r => r.data?.success && setPendingRequests(r.data.data))
              .catch(() => {});
            apiClient.get('/middleman/my-managers')
              .then(r => r.data?.success && setActiveManagers(r.data.data))
              .catch(() => {});
          }
        }
      } catch (err) {
        setError('Gagal memuat profil Anda.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone) return;
    setSendingRequest(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      const res = await apiClient.post('/middleman/request', { phone: targetPhone });
      if (res.data?.success) {
        setRequestSuccess('Permintaan berhasil dikirim! Silakan minta penjual menyetujuinya di akun mereka.');
        setTargetPhone('');
        fetchMiddlemanData();
      }
    } catch (err: any) {
      setRequestError(err.response?.data?.error || 'Gagal mengirimkan permintaan');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleApproveRequest = async (relationId: string) => {
    try {
      const res = await apiClient.patch(`/middleman/request/${relationId}/approve`);
      if (res.data?.success) {
        fetchMiddlemanData();
        refreshSellers();
      }
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleRejectRequest = async (relationId: string) => {
    try {
      const res = await apiClient.patch(`/middleman/request/${relationId}/reject`);
      if (res.data?.success) {
        fetchMiddlemanData();
      }
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleDisconnectRelation = async (relationId: string) => {
    if (!confirm('Apakah Anda yakin ingin memutuskan hubungan pengelolaan ini?')) return;
    try {
      const res = await apiClient.delete(`/middleman/relation/${relationId}`);
      if (res.data?.success) {
        fetchMiddlemanData();
        refreshSellers();
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

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

          {/* Middleman Management Section */}
          {role === 'seller' && (
            <div className="mt-12 space-y-8 pb-12">
              <hr className="border-gray-200" />
              
              {/* Section A: Send Connection Request */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 text-left">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-container">construction</span>
                    Kelola Akun UMKM Lain (Middleman)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Kirim permintaan pengelolaan akun seller/UMKM lain dengan memasukkan nomor HP mereka.
                  </p>
                </div>

                <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="tel"
                      required
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="Contoh: +628123456789"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#F5E6DD]/30 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-medium text-sm outline-none border text-gray-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sendingRequest}
                    className="bg-secondary-container text-white font-bold px-6 py-3.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {sendingRequest ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                </form>

                {requestError && <p className="text-xs font-semibold text-red-500">{requestError}</p>}
                {requestSuccess && <p className="text-xs font-semibold text-green-600">{requestSuccess}</p>}

                {/* List of Connected Sellers */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">UMKM yang Anda Kelola</h4>
                  {managedSellers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada UMKM yang terhubung.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {managedSellers.map((seller: any) => (
                        <div key={seller.id} className="py-3 flex justify-between items-center gap-4">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{seller.businessName || seller.name}</p>
                            <p className="text-xs text-gray-500">{seller.name} · {seller.province || 'Lainnya'} · {seller.phone}</p>
                          </div>
                          <button
                            onClick={() => handleDisconnectRelation(seller.relationId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all border border-transparent hover:border-red-100 text-xs font-bold"
                          >
                            Putus Hubungan
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section B: Incoming Requests */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 text-left">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Permintaan Pengelolaan Akun (Request Masuk)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar akun middleman yang meminta izin untuk mengelola akun UMKM Anda.
                  </p>
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Tidak ada permintaan masuk saat ini.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingRequests.map((req: any) => (
                      <div key={req.relationId} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {req.middleman.businessName || req.middleman.name || 'Middleman'}
                          </p>
                          <p className="text-xs text-gray-500">Nama: {req.middleman.name} · HP: {req.middleman.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(req.relationId)}
                            className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.relationId)}
                            className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-200 active:scale-95 transition-all border border-gray-200"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section C: Active Managers (Middleman yang Memiliki Akses ke Akun Anda) */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 text-left">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-container">vpn_key</span>
                    Middleman yang Memiliki Akses (Akun Pengelola)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar akun middleman yang saat ini disetujui memiliki akses penuh untuk mengelola dan memposting produk atas nama akun Anda.
                  </p>
                </div>

                {activeManagers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Tidak ada akun middleman yang memiliki akses ke akun Anda saat ini.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeManagers.map((mgr: any) => (
                      <div key={mgr.relationId} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {mgr.businessName || mgr.name || 'Middleman'}
                          </p>
                          <p className="text-xs text-gray-500">Nama: {mgr.name} · HP: {mgr.phone} · Wilayah: {mgr.province || 'Indonesia'}</p>
                        </div>
                        <div>
                          <button
                            onClick={() => handleDisconnectRelation(mgr.relationId)}
                            className="bg-red-50 text-red-500 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-500 hover:text-white active:scale-95 transition-all shadow-sm"
                          >
                            Cabut Izin Akses
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
