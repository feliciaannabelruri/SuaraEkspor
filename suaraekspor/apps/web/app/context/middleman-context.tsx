'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const dummyUMKMs = [
  { id: '1', name: 'Batik Bu Sari', owner: 'Bu Sari', category: 'Tekstil', chatCount: 3, productCount: 5 },
  { id: '2', name: 'Kopi Pak Budi', owner: 'Pak Budi', category: 'Makanan & Minuman', chatCount: 1, productCount: 2 },
  { id: '3', name: 'Gerabah Mas Joko', owner: 'Mas Joko', category: 'Kerajinan', chatCount: 7, productCount: 8 },
];

type UMKM = typeof dummyUMKMs[0];

type MiddlemanContextType = {
  isMiddleman: boolean;
  setIsMiddleman: (v: boolean) => void;
  activeUMKM: UMKM | null;
  setActiveUMKM: (u: UMKM | null) => void;
  umkmList: UMKM[];
  handleToggleMiddleman: () => void;
};

const MiddlemanContext = createContext<MiddlemanContextType | null>(null);

export function MiddlemanProvider({ children }: { children: ReactNode }) {
  const [isMiddleman, setIsMiddleman] = useState(false);
  const [activeUMKM, setActiveUMKM] = useState<UMKM | null>(null);
  const [showModal, setShowModal] = useState(false);

  function handleToggleMiddleman() {
    if (isMiddleman) {
      setIsMiddleman(false);
      setActiveUMKM(null);
    } else {
      setIsMiddleman(true);
      setShowModal(true);
    }
  }

  function handleSelectUMKM(umkm: UMKM) {
    setActiveUMKM(umkm);
    setShowModal(false);
  }

  function handleCloseModal() {
    if (!activeUMKM) setIsMiddleman(false);
    setShowModal(false);
  }

  return (
    <MiddlemanContext.Provider value={{
      isMiddleman, setIsMiddleman,
      activeUMKM, setActiveUMKM,
      umkmList: dummyUMKMs,
      handleToggleMiddleman,
    }}>
      {children}
      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[430px] rounded-2xl px-6 pt-6 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0F4A33]">Pilih UMKM yang Dikelola</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {dummyUMKMs.map((umkm) => (
                <button
                  key={umkm.id}
                  onClick={() => handleSelectUMKM(umkm)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${activeUMKM?.id === umkm.id
                    ? 'border-[#0F4A33] bg-[#0F4A33]/5 ring-1 ring-[#0F4A33]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="w-12 h-12 bg-[#0F4A33] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">{umkm.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F4A33] text-base truncate">{umkm.name}</p>
                    <p className="text-gray-500 text-xs truncate mb-1">{umkm.owner} · {umkm.category}</p>
                    <div className="flex gap-3">
                      <span className="text-[11px] font-semibold text-white px-2 py-0.5 bg-gray-500 rounded">{umkm.productCount} produk</span>
                      <span className="text-[11px] font-semibold text-[#0F4A33] px-2 py-0.5 bg-[#7EE8BC]/50 rounded">{umkm.chatCount} chat baru</span>
                    </div>
                  </div>
                  {activeUMKM?.id === umkm.id && (
                    <span className="material-symbols-outlined text-[#0F4A33] flex-shrink-0">check_circle</span>
                  )}
                </button>
              ))}
            </div>
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