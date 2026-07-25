'use client';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/api-client';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import ExportContextForm, { ExportContext } from './ExportContextForm';

type LegalDocType = 'commercial_invoice' | 'packing_list' | 'certificate_of_origin';

interface LegalDocument {
  id: string;
  type: LegalDocType;
  status: 'draft' | 'finalized';
  data: Record<string, unknown>;
  exportContext: ExportContext | null;
  aiNotes: string | null;
}

const DOC_META: { type: LegalDocType; label: string; icon: string }[] = [
  { type: 'commercial_invoice', label: 'Commercial Invoice', icon: 'receipt_long' },
  { type: 'packing_list', label: 'Packing List', icon: 'inventory_2' },
  { type: 'certificate_of_origin', label: 'Certificate of Origin', icon: 'verified' },
];

function fieldLabel(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function DocFieldEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <div key={key} className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                {fieldLabel(key)} (JSON)
              </label>
              <textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    onChange({ ...data, [key]: JSON.parse(e.target.value) });
                  } catch {
                    // biarkan invalid JSON diketik dulu, tidak diupdate sampai valid
                  }
                }}
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary transition-colors text-gray-800 resize-y"
              />
            </div>
          );
        }
        const isNumber = typeof value === 'number';
        return (
          <div key={key}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">{fieldLabel(key)}</label>
            <input
              type={isNumber ? 'number' : 'text'}
              value={value as string | number}
              onChange={(e) => onChange({ ...data, [key]: isNumber ? Number(e.target.value) : e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors text-gray-800"
            />
          </div>
        );
      })}
    </div>
  );
}

function DocCard({
  transactionId,
  meta,
  doc,
  hasSiblingContext,
  onGenerated,
  onUpdated,
}: {
  transactionId: string;
  meta: { type: LegalDocType; label: string; icon: string };
  doc: LegalDocument | undefined;
  hasSiblingContext: boolean;
  onGenerated: (doc: LegalDocument) => void;
  onUpdated: (doc: LegalDocument) => void;
}) {
  const [showContextForm, setShowContextForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [localData, setLocalData] = useState<Record<string, unknown> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [genError, setGenError] = useState('');

  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useVoiceRecorder();
  const [isVoiceEditing, setIsVoiceEditing] = useState(false);
  const recordingForThisCard = useRef(false);

  useEffect(() => {
    if (doc) setLocalData(doc.data);
  }, [doc]);

  useEffect(() => {
    if (!audioBlob || !recordingForThisCard.current) return;
    recordingForThisCard.current = false;
    (async () => {
      setIsVoiceEditing(true);
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'correction.webm');
        const res = await apiClient.post(`/transactions/${transactionId}/legal-documents/${meta.type}/voice-edit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          onUpdated(res.data.data);
          setLastTranscript(res.data.transcript);
        }
      } catch (err) {
        console.error('Gagal menerapkan koreksi suara:', err);
      } finally {
        setIsVoiceEditing(false);
        resetRecording();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  async function handleGenerate(exportContext?: ExportContext) {
    setGenerating(true);
    setGenError('');
    try {
      const res = await apiClient.post(`/transactions/${transactionId}/legal-documents/${meta.type}/generate`, {
        exportContext,
      });
      onGenerated(res.data.data);
      setShowContextForm(false);
    } catch (err: any) {
      setGenError(err.response?.data?.error ?? 'Gagal membuat dokumen. Coba lagi.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!localData) return;
    setSaving(true);
    try {
      const res = await apiClient.patch(`/transactions/${transactionId}/legal-documents/${meta.type}`, { data: localData });
      onUpdated(res.data.data);
      setDirty(false);
    } catch (err) {
      console.error('Gagal menyimpan perubahan:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await apiClient.get(`/transactions/${transactionId}/legal-documents/${meta.type}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.type}-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
    } finally {
      setDownloading(false);
    }
  }

  function handleMicClick() {
    if (isRecording) {
      stopRecording();
      return;
    }
    recordingForThisCard.current = true;
    startRecording().catch(() => { recordingForThisCard.current = false; });
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">{meta.icon}</span>
          <span className="font-bold text-sm text-gray-800">{meta.label}</span>
          {doc && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${doc.status === 'finalized' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {doc.status === 'finalized' ? 'Selesai' : 'Draft'}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {!doc && !showContextForm && (
          <button
            type="button"
            onClick={() => (hasSiblingContext ? handleGenerate(undefined) : setShowContextForm(true))}
            disabled={generating}
            className="w-full border border-dashed border-gray-300 rounded-lg py-4 text-xs font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {generating ? 'Membuat dengan AI...' : `+ Buat ${meta.label}`}
          </button>
        )}

        {!doc && showContextForm && (
          <ExportContextForm onSubmit={handleGenerate} submitting={generating} submitLabel={`Buat ${meta.label}`} />
        )}

        {genError && <p className="text-xs text-red-600 mt-2">{genError}</p>}

        {doc && localData && (
          <div className="space-y-4">
            <DocFieldEditor data={localData} onChange={(next) => { setLocalData(next); setDirty(true); }} />

            {lastTranscript && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 text-[11px] text-gray-600">
                <span className="font-bold text-primary">AI menerapkan koreksi:</span> &ldquo;{lastTranscript}&rdquo;
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving}
                className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>

              {isRecording ? (
                <button type="button" onClick={handleMicClick} className="flex items-center gap-1.5 text-red-500 font-bold text-xs animate-pulse">
                  <span className="material-symbols-outlined text-[16px]">stop_circle</span> Stop ({duration}s)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isVoiceEditing}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary font-bold text-xs transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">{isVoiceEditing ? 'progress_activity' : 'mic'}</span>
                  {isVoiceEditing ? 'Memproses suara...' : 'Edit dengan Suara'}
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary font-bold text-xs transition-colors disabled:opacity-50 ml-auto"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                {downloading ? 'Menyiapkan PDF...' : 'Unduh PDF'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">Ucapkan koreksi yang ingin diterapkan, mis. &ldquo;ganti nama pembeli jadi ...&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LegalDocumentsPanel({ transactionId }: { transactionId: string }) {
  const [docs, setDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/transactions/${transactionId}/legal-documents`);
        if (!cancelled) setDocs(res.data?.data ?? []);
      } catch {
        if (!cancelled) setError('Gagal memuat dokumen legal.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [transactionId]);

  function upsertDoc(doc: LegalDocument) {
    setDocs((prev) => {
      const exists = prev.some((d) => d.type === doc.type);
      return exists ? prev.map((d) => (d.type === doc.type ? doc : d)) : [...prev, doc];
    });
  }

  const hasSiblingContext = docs.some((d) => d.exportContext);

  if (loading) return <p className="text-xs text-gray-400 py-4">Memuat dokumen legal...</p>;
  if (error) return <p className="text-xs text-red-600 py-4">{error}</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Buat dokumen ekspor otomatis dari data transaksi ini. AI menyusun draft, Anda bisa mengedit langsung atau lewat suara.
      </p>
      {DOC_META.map((meta) => (
        <DocCard
          key={meta.type}
          transactionId={transactionId}
          meta={meta}
          doc={docs.find((d) => d.type === meta.type)}
          hasSiblingContext={hasSiblingContext}
          onGenerated={upsertDoc}
          onUpdated={upsertDoc}
        />
      ))}
    </div>
  );
}
