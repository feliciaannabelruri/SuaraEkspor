'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export type UMKM = {
  id: string;
  name: string;
  businessName: string | null;
  province: string | null;
  localLanguage: string | null;
  address: string | null;
  phone: string;
  relationId?: string;
  productCount?: number;
  chatCount?: number;
};

type MiddlemanContextType = {
  isMiddleman: boolean;
  setIsMiddleman: (v: boolean) => void;
  activeUMKM: UMKM | null;
  setActiveUMKM: (u: UMKM | null) => void;
  umkmList: UMKM[];
  handleToggleMiddleman: () => void;
  refreshSellers: () => Promise<void>;
};

const MiddlemanContext = createContext<MiddlemanContextType | null>(null);

export function MiddlemanProvider({ children }: { children: ReactNode }) {
  const [isMiddleman, setIsMiddleman] = useState(false);
  const [activeUMKM, setActiveUMKM] = useState<UMKM | null>(null);
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch approved sellers managed by this middleman
  async function refreshSellers() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('se_user') : null;
    if (!token || !userRaw) return;

    try {
      const user = JSON.parse(userRaw);
      if (user.role !== 'seller') return; // Only sellers can be middlemen

      setLoading(true);
      const res = await apiClient.get('/middleman/my-sellers');
      if (res.data?.success) {
        setUmkmList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar UMKM managed:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load list and active UMKM from localStorage on mount
  useEffect(() => {
    refreshSellers();
    
    const saved = typeof window !== 'undefined' ? localStorage.getItem('se_active_umkm') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          setActiveUMKM(parsed);
          setIsMiddleman(true);
        }
      } catch {}
    }
  }, []);

  function handleToggleMiddleman() {
    if (isMiddleman) {
      setIsMiddleman(false);
      setActiveUMKM(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('se_active_umkm');
      }
    } else {
      setIsMiddleman(true);
      setShowModal(true);
      refreshSellers(); // Refresh whenever opening the manager
    }
  }

  function handleSelectUMKM(umkm: UMKM) {
    setActiveUMKM(umkm);
    setShowModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_active_umkm', JSON.stringify(umkm));
    }
  }

  function handleCloseModal() {
    if (!activeUMKM) {
      setIsMiddleman(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('se_active_umkm');
      }
    }
    setShowModal(false);
  }

  return (
    <MiddlemanContext.Provider value={{
      isMiddleman,
      setIsMiddleman,
      activeUMKM,
      setActiveUMKM,
      umkmList,
      handleToggleMiddleman,
      refreshSellers,
    }}>
      {children}
      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[430px] rounded-2xl px-6 pt-6 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                Pilih UMKM yang Dikelola
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {umkmList.length === 0 ? (
              <div className="text-center py-8 px-4 text-left">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <span className="material-symbols-outlined text-[32px]">group</span>
                </div>
                <p className="font-bold text-gray-800 text-sm">Belum ada UMKM terhubung</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Anda harus mengirimkan permintaan pengelolaan dan disetujui oleh UMKM terkait agar bisa mengelola akun mereka.
                </p>
                <Link
                  href="/profile"
                  onClick={handleCloseModal}
                  className="mt-5 w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                >
                  Hubungkan UMKM Sekarang
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {umkmList.map((umkm) => (
                  <button
                    key={umkm.id}
                    onClick={() => handleSelectUMKM(umkm)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${activeUMKM?.id === umkm.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base">
                        {(umkm.businessName || umkm.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary text-base truncate">
                        {umkm.businessName || umkm.name || 'UMKM Tanpa Nama'}
                      </p>
                      <p className="text-gray-500 text-xs truncate mb-1">
                        {umkm.name || 'Pemilik'} · {umkm.province || 'Lainnya'}
                      </p>
                      <div className="flex gap-3">
                        <span className="text-[11px] font-semibold text-white px-2 py-0.5 bg-gray-500 rounded">
                          {umkm.productCount || 0} produk
                        </span>
                        <span className="text-[11px] font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded">
                          {umkm.chatCount || 0} chat baru
                        </span>
                      </div>
                    </div>
                    {activeUMKM?.id === umkm.id && (
                      <span className="material-symbols-outlined text-primary flex-shrink-0">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </MiddlemanContext.Provider>
  );
}

export function useMiddleman() {
  const ctx = useContext(MiddlemanContext);
  if (!ctx) throw new Error('useMiddleman must be used within MiddlemanProvider');
  return ctx;
}