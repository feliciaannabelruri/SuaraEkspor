'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const languages = [
  { code: 'id', label: 'Bahasa Indonesia', native: 'Bahasa Indonesia' },
  { code: 'jv', label: 'Jawa', native: 'Basa Jawa' },
  { code: 'su', label: 'Sunda', native: 'Basa Sunda' },
  { code: 'btk', label: 'Batak', native: 'Hata Batak' },
];

const provinces = ['Jawa Tengah','Jawa Barat','Jawa Timur','DI Yogyakarta','Sumatera Utara','Sulawesi Selatan','Nusa Tenggara Timur','Bali','Lainnya'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', business: '', province: '', language: 'id' });

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#0F4A33] px-5 pt-10 pb-6">
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-[#7EE8BC]' : 'bg-white/20'}`} />
          ))}
        </div>
        <p className="text-[#A8D5C2] text-xs mb-1">Langkah {step} dari 3</p>
        <h1 className="text-white text-xl font-bold">
          {step === 1 && 'Siapa Anda?'}
          {step === 2 && 'Dari mana Anda?'}
          {step === 3 && 'Bahasa apa yang Anda gunakan?'}
        </h1>
      </div>

      <div className="px-5 pt-6">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Nama Lengkap</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Pak Slamet" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Nama Usaha</label>
              <input value={form.business} onChange={e => setForm({...form, business: e.target.value})}
                placeholder="Batik Slamet Pekalongan" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-600" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Provinsi Anda</label>
            {provinces.map(p => (
              <button key={p} onClick={() => setForm({...form, province: p})}
                className={`w-full text-left px-4 py-3 rounded-xl border font-medium text-sm flex items-center justify-between
                  ${form.province === p ? 'border-green-600 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-700'}`}>
                {p}
                {form.province === p && <CheckCircle size={18} className="text-green-600" />}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500 mb-2">AI akan mengirim notifikasi suara dalam bahasa ini</p>
            {languages.map(l => (
              <button key={l.code} onClick={() => setForm({...form, language: l.code})}
                className={`w-full text-left px-4 py-4 rounded-xl border flex items-center justify-between
                  ${form.language === l.code ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div>
                  <p className={`font-bold text-sm ${form.language === l.code ? 'text-green-900' : 'text-gray-800'}`}>{l.label}</p>
                  <p className="text-xs text-gray-400">{l.native}</p>
                </div>
                {form.language === l.code && <CheckCircle size={18} className="text-green-600" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step-1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-4 rounded-xl">
              Kembali
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step+1) : router.push('/dashboard')}
            className="flex-1 bg-[#0F4A33] text-white font-bold py-4 rounded-xl">
            {step === 3 ? 'Mulai Berjualan' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
}