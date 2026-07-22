'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileProfileMenu from '@/components/layout/MobileProfileMenu';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import apiClient from '@/lib/api-client';
import { useMiddleman } from '../context/middleman-context';

export default function KelolaUmkmPage() {
  const router = useRouter();
  const { isMiddleman, activeUMKM, umkmList, activateUMKM, handleToggleMiddleman, refreshSellers } = useMiddleman();

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeManagers, setActiveManagers] = useState<any[]>([]);
  const [targetPhone, setTargetPhone] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      await refreshSellers();
      const [resReqs, resManagers] = await Promise.all([
        apiClient.get('/middleman/pending-requests'),
        apiClient.get('/middleman/my-managers'),
      ]);
      if (resReqs.data?.success) setPendingRequests(resReqs.data.data);
      if (resManagers.data?.success) setActiveManagers(resManagers.data.data);
    } catch (err) {
      console.error('Gagal memuat data kelola UMKM:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        fetchData();
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
      if (res.data?.success) fetchData();
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleRejectRequest = async (relationId: string) => {
    try {
      const res = await apiClient.patch(`/middleman/request/${relationId}/reject`);
      if (res.data?.success) fetchData();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleDisconnectRelation = async (relationId: string) => {
    if (!confirm('Apakah Anda yakin ingin memutuskan hubungan pengelolaan ini?')) return;
    try {
      const res = await apiClient.delete(`/middleman/relation/${relationId}`);
      if (res.data?.success) fetchData();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      <Sidebar />

      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Kelola UMKM Lain</h1>
            <p className="text-xs text-gray-500">Mengelola akun UMKM lain sebagai middleman</p>
          </div>
          <MobileProfileMenu />
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[900px] mx-auto w-full flex-1 space-y-8">
          <div>
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Kelola UMKM</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Kelola UMKM Lain</h1>
            <p className="text-xs md:text-sm text-gray-500">Kelola akun UMKM lain (sebagai middleman) atau kelola siapa yang boleh mengelola akun Anda.</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm font-bold">Memuat...</div>
          ) : (
            <>
              {/* Mode Kelola Aktif */}
              {isMiddleman && activeUMKM && (
                <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {(activeUMKM.businessName || activeUMKM.name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">Sedang mengelola: {activeUMKM.businessName || activeUMKM.name}</p>
                      <p className="text-xs text-gray-500">{activeUMKM.province || 'Lainnya'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleMiddleman}
                    className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    Keluar Mode Kelola
                  </button>
                </div>
              )}

              {/* Section: Daftar UMKM yang bisa diaktifkan + form kirim permintaan baru */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-container">construction</span>
                    Kelola Akun UMKM Lain
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

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">UMKM yang Anda Kelola</h4>
                  {umkmList.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada UMKM yang terhubung.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {umkmList.map((seller: any) => (
                        <div key={seller.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{seller.businessName || seller.name}</p>
                            <p className="text-xs text-gray-500">{seller.name} · {seller.province || 'Lainnya'} · {seller.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            {activeUMKM?.id === seller.id ? (
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Sedang Dikelola
                              </span>
                            ) : (
                              <button
                                onClick={() => activateUMKM(seller)}
                                className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all border border-primary/30"
                              >
                                Kelola Sekarang
                              </button>
                            )}
                            <button
                              onClick={() => handleDisconnectRelation(seller.relationId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all border border-transparent hover:border-red-100 text-xs font-bold"
                            >
                              Putus Hubungan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Permintaan masuk */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Permintaan Pengelolaan Akun (Request Masuk)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar akun yang meminta izin untuk mengelola akun UMKM Anda.
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
                            {req.middleman.businessName || req.middleman.name || 'Pengelola'}
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

              {/* Section: Pengelola aktif atas akun kita */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-container">vpn_key</span>
                    Pengelola yang Memiliki Akses ke Akun Anda
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar akun yang saat ini disetujui memiliki akses penuh untuk mengelola dan memposting produk atas nama akun Anda.
                  </p>
                </div>

                {activeManagers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Tidak ada akun pengelola yang memiliki akses ke akun Anda saat ini.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeManagers.map((mgr: any) => (
                      <div key={mgr.relationId} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {mgr.businessName || mgr.name || 'Pengelola'}
                          </p>
                          <p className="text-xs text-gray-500">Nama: {mgr.name} · HP: {mgr.phone} · Wilayah: {mgr.province || 'Indonesia'}</p>
                        </div>
                        <button
                          onClick={() => handleDisconnectRelation(mgr.relationId)}
                          className="bg-red-50 text-red-500 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-500 hover:text-white active:scale-95 transition-all shadow-sm"
                        >
                          Cabut Izin Akses
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <MobileBottomNav />
      </main>
    </div>
  );
}
