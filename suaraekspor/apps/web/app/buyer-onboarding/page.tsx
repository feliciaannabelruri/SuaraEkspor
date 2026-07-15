'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';

const languages = [
  { code: 'en', label: 'English (Inggris)', native: 'English' },
  { code: 'zh', label: 'Chinese (Mandarin)', native: '中文 (Zhōngwén)' },
  { code: 'ja', label: 'Japanese (Jepang)', native: '日本語 (Nihongo)' },
  { code: 'ar', label: 'Arabic (Arab)', native: 'العربية (Al-ʿarabiyyah)' },
  { code: 'de', label: 'German (Jerman)', native: 'Deutsch' },
  { code: 'id', label: 'Bahasa Indonesia', native: 'Bahasa Indonesia' },
];

export default function BuyerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', company: '', language: 'en', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('se_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name && u.role === 'buyer') {
          router.replace('/');
        }
      } catch (_) {}
    }
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const resPatch = await apiClient.patch('/users/me', {
        name: form.name || 'Global Buyer',
        businessName: form.company || 'Global Import Co.',
        localLanguage: form.language,
        address: form.address || 'Global Port Destination',
      });
      localStorage.setItem('se_user', JSON.stringify(resPatch.data?.data));
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white md:bg-transparent">
      {/* Left Column: Brand Identity & Trust */}
      <section className="w-full md:w-1/2 bg-primary-container relative flex flex-col px-6 pt-10 pb-16 md:p-16 overflow-hidden md:min-h-screen">
        <div
          className="absolute inset-0 batik-overlay mix-blend-soft-light opacity-30 pointer-events-none"
          title="Batik Pattern"
        ></div>

        {/* Logo */}
        <div className="relative z-10 flex justify-center md:justify-start">
          <Link href="/">
            <img
              src="/images/SuaraEksporLogo.png"
              alt="SuaraEkspor"
              className="w-36 md:w-48 h-auto brightness-0 invert object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-6 md:mt-0 mb-2 md:mb-0 text-center md:text-left">
          <h1 className="text-[26px] sm:text-4xl md:text-[60px] leading-[1.2] md:leading-[1.1] tracking-tight font-bold text-white mb-3 md:mb-6">
            Export Easier, <br className="hidden md:inline" />
            Starts Right Here.
          </h1>
          <p className="font-body-md md:font-body-lg text-[13px] md:text-lg text-on-primary-container max-w-lg mx-auto md:mx-0">
            Connect directly with verified Indonesian UMKM and purchase high-quality goods safely.
          </p>
        </div>

        {/* Trust Points */}
        <div className="relative z-10 space-y-4 hidden md:block">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-body-md text-white">Verified Local Sellers</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-body-md text-white">Multilingual AI Chat Translation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-body-md text-white">Secure Escrow Protection</span>
          </div>
        </div>
      </section>

      {/* Right Column: Onboarding Step Form */}
      <section className="w-full md:w-1/2 bg-white md:bg-background flex flex-col items-center justify-start md:justify-center p-6 md:p-16 -mt-8 md:mt-0 relative z-20 rounded-t-3xl md:rounded-none min-h-[60vh] md:min-h-0">
        <div className="w-full max-w-md bg-white md:p-8 rounded-none md:rounded-xl border-none md:border md:border-outline-variant/30 shadow-none md:shadow-sm">
          
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Step {step} of 3</p>
            <h2 className="text-xl md:text-2xl font-bold text-primary">
              {step === 1 && 'Who are you?'}
              {step === 2 && 'Which language do you prefer?'}
              {step === 3 && 'Shipping Destination Address'}
            </h2>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">Company Name</label>
                  <input
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="Global Import Co."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-gray-800"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                <p className="text-xs text-gray-400 mb-2">AI will automatically translate messages from Indonesian sellers into this language.</p>
                {languages.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setForm({ ...form, language: l.code })}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all
                      ${form.language === l.code ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div>
                      <p className={`font-bold text-xs ${form.language === l.code ? 'text-primary font-bold' : 'text-gray-800'}`}>{l.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{l.native}</p>
                    </div>
                    {form.language === l.code && <CheckCircle size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Destination Port / Delivery Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g., 120 Port Road, Port of Los Angeles, California, USA"
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-gray-800 resize-none"
                />
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl text-xs hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                disabled={loading}
                className="flex-1 bg-primary hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-xs disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {loading ? 'Saving...' : step === 3 ? 'Start Buying' : 'Next'}
              </button>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
