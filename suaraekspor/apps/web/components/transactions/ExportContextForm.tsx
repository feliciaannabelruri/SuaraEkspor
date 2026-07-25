'use client';
import { useState } from 'react';

export interface ExportContext {
  buyerCountry?: string;
  buyerAddress?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  incoterm?: string;
  hsCode?: string;
  netWeightKg?: number;
  grossWeightKg?: number;
  dimensionsCm?: string;
  packageCount?: number;
  currency?: string;
}

const FIELDS: { key: keyof ExportContext; label: string; type?: 'number' }[] = [
  { key: 'buyerCountry', label: 'Negara Pembeli' },
  { key: 'buyerAddress', label: 'Alamat Pembeli' },
  { key: 'portOfLoading', label: 'Pelabuhan Muat' },
  { key: 'portOfDischarge', label: 'Pelabuhan Bongkar' },
  { key: 'incoterm', label: 'Incoterm (mis. FOB, CIF)' },
  { key: 'hsCode', label: 'Kode HS' },
  { key: 'netWeightKg', label: 'Berat Bersih (kg)', type: 'number' },
  { key: 'grossWeightKg', label: 'Berat Kotor (kg)', type: 'number' },
  { key: 'dimensionsCm', label: 'Dimensi (P x L x T cm)' },
  { key: 'packageCount', label: 'Jumlah Paket', type: 'number' },
];

export default function ExportContextForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: ExportContext;
  onSubmit: (ctx: ExportContext) => void;
  submitting?: boolean;
  submitLabel: string;
}) {
  const [values, setValues] = useState<ExportContext>(initial ?? {});

  function update(key: keyof ExportContext, raw: string) {
    setValues((prev) => ({
      ...prev,
      [key]: raw === '' ? undefined : (FIELDS.find((f) => f.key === key)?.type === 'number' ? Number(raw) : raw),
    }));
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Info ini opsional dan dipakai untuk ketiga dokumen sekaligus — kosongkan yang tidak Anda tahu, AI akan mengisi asumsi wajar.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">{f.label}</label>
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={values[f.key] ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors text-gray-800"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(values)}
        disabled={submitting}
        className="w-full bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
      >
        {submitting ? 'Memproses...' : submitLabel}
      </button>
    </div>
  );
}
