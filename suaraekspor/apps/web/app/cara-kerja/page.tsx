'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Mic, Languages, MessageSquare, ShieldCheck, Ship, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CaraKerjaPage() {
  const { t } = useTranslation();

  const STEPS = [
    {
      icon: <div className="flex gap-2 text-primary"><Camera size={24} /><Mic size={24} /></div>,
      title: `1. ${t('ckStep1Title')}`,
      description: t('ckStep1Desc'),
      badge: t('ckBadgeEasy'),
      color: 'bg-green-50 text-green-700 border-green-100',
    },
    {
      icon: <Languages size={32} className="text-secondary-container" />,
      title: `2. ${t('ckStep2Title')}`,
      description: t('ckStep2Desc'),
      badge: t('ckBadgeAi'),
      color: 'bg-secondary-fixed text-secondary-container border-secondary-fixed-dim',
    },
    {
      icon: <MessageSquare size={32} className="text-primary" />,
      title: `3. ${t('ckStep3Title')}`,
      description: t('ckStep3Desc'),
      badge: t('ckBadgeLang'),
      color: 'bg-teal-50 text-teal-700 border-teal-100',
    },
    {
      icon: <ShieldCheck size={32} className="text-emerald-600" />,
      title: `4. ${t('ckStep4Title')}`,
      description: t('ckStep4Desc'),
      badge: t('ckBadgeSafe'),
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      icon: <Ship size={32} className="text-blue-600" />,
      title: `5. ${t('ckStep5Title')}`,
      description: t('ckStep5Desc'),
      badge: t('ckBadgeLogistics'),
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* Header Banner */}
      <section className="bg-primary text-white py-16 md:py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,128,47,0.15),transparent_40%)]" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-secondary-container text-xs font-bold tracking-[0.2em] uppercase">{t('ckEduBadge')}</span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {t('ckTitle')}
          </h1>
          <p className="text-on-primary-container text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {t('ckSubtitle')}
          </p>
        </div>
      </section>

      {/* Steps Timeline Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-16 md:py-24 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Visual Guide Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-primary">{t('ckLeftTitle')}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('ckLeftDesc')}
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 size={16} className="text-secondary-container" />
                  <span>{t('ckLeftBullet1')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 size={16} className="text-secondary-container" />
                  <span>{t('ckLeftBullet2')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 size={16} className="text-secondary-container" />
                  <span>{t('ckLeftBullet3')}</span>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full bg-secondary-container text-white font-bold py-3.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {t('ckLeftCta')}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: Steps Timeline */}
          <div className="lg:col-span-8 space-y-8">
            {STEPS.map((step, idx) => (
              <div
                key={step.title}
                className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-primary/30 shadow-sm flex flex-col md:flex-row gap-6 transition-all"
              >
                {/* Step Icon Box */}
                <div className="w-16 h-16 rounded-xl bg-[#F5E6DD]/40 border border-outline-variant/10 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-base md:text-lg">{step.title}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${step.color}`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
