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
};

const MiddlemanContext = createContext<MiddlemanContextType | null>(null);

export function MiddlemanProvider({ children }: { children: ReactNode }) {
  const [isMiddleman, setIsMiddleman] = useState(false);
  const [activeUMKM, setActiveUMKM] = useState<UMKM | null>(null);

  return (
    <MiddlemanContext.Provider value={{
      isMiddleman, setIsMiddleman,
      activeUMKM, setActiveUMKM,
      umkmList: dummyUMKMs,
    }}>
      {children}
    </MiddlemanContext.Provider>
  );
}

export function useMiddleman() {
  const ctx = useContext(MiddlemanContext);
  if (!ctx) throw new Error('useMiddleman must be used within MiddlemanProvider');
  return ctx;
}