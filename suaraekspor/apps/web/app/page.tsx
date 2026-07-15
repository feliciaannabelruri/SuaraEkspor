'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-background text-on-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* HERO */}
      <header className="bg-background overflow-hidden pt-12 md:pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-16">
          {/* Left */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
              <span className="text-primary text-[12px] font-bold tracking-[0.1em] uppercase">PIDI DIGDAYA X · PS3</span>
            </div>
            <h1 className="text-primary text-3xl sm:text-4xl md:text-[56px] font-bold leading-tight tracking-[-0.02em]">
              {t('hpTitle')}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              {t('hpSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="bg-primary text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                {t('hpStartBuying')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link href="/marketplace" className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-bold text-center hover:bg-primary/5 transition-all">
                {t('nvMarketplace')}
              </Link>
            </div>
          </motion.div>

          {/* Right — hero image + floating card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-[500px] mx-auto">
              <Image
                src="/images/hero_pottery.jpg"
                alt="Indonesian handcrafted pottery"
                width={500}
                height={625}
                className="rounded-xl shadow-2xl w-full aspect-[4/5] object-cover border-4 border-white"
                priority
              />
              {/* Floating card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="hidden sm:block absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6 6-6"/></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500">AI Preview</div>
                    <div className="text-sm font-bold text-primary">{t('hpAiPreview')}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-50 rounded" />
                  <div className="h-2 w-3/4 bg-gray-50 rounded" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* SOCIAL PROOF BAR */}
      <section className="bg-primary/90 py-12 border-b border-primary/20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {[
              { num: '65k+', labelKey: 'hpSocialStat1Label', subKey: 'hpSocialStat1Sub' },
              { num: '1.2M+', labelKey: 'hpSocialStat2Label', subKey: 'hpSocialStat2Sub' },
              { num: '45+', labelKey: 'hpSocialStat3Label', subKey: 'hpSocialStat3Sub' },
            ].map((s, i) => (
              <motion.div 
                key={s.num} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`flex flex-col md:flex-row items-center gap-4 ${i === 1 ? 'border-y md:border-y-0 md:border-x border-primary-fixed-dim/20 py-8 md:py-0 md:px-8' : ''}`}
              >
                <div className="text-[40px] font-bold text-secondary-container">{s.num}</div>
                <div className="text-primary-fixed-dim text-base">
                  {t(s.labelKey)}<br />
                  <span className="opacity-60 text-sm">{t(s.subKey)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="py-16 md:py-[120px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <span className="text-secondary-container text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t('hpHowBadge')}</span>
            <h2 className="text-primary text-[36px] font-semibold leading-tight">{t('hpHowTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', titleKey: 'hpHowStep1Title', descKey: 'hpHowStep1Desc', icon: 'camera' },
              { step: '02', titleKey: 'hpHowStep2Title', descKey: 'hpHowStep2Desc', icon: 'mic' },
              { step: '03', titleKey: 'hpHowStep3Title', descKey: 'hpHowStep3Desc', icon: 'spark' },
            ].map((s, i) => (
              <motion.div 
                key={s.step} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="group bg-white p-10 rounded-xl border border-gray-200 hover:border-secondary-container hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[48px] font-extrabold text-gray-200 group-hover:text-secondary-container/20 transition-colors leading-none">{s.step}</span>
                  <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-secondary-container transition-colors">
                    {s.icon === 'camera' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:text-white transition-colors"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    )}
                    {s.icon === 'mic' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:text-white transition-colors"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    )}
                    {s.icon === 'spark' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:text-white transition-colors"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    )}
                  </div>
                </div>
                <h3 className="text-primary text-[24px] font-semibold mb-4">{t(s.titleKey)}</h3>
                <p className="text-gray-600 text-base leading-relaxed">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-16 md:py-[120px] bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-secondary-container text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t('hpFeaturedBadge')}</span>
              <h2 className="text-primary text-[36px] font-semibold leading-tight">{t('hpFeaturedTitle')}</h2>
            </div>
            <Link href="/marketplace" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
              {t('hpFeaturedViewAll')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { id: '1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiB8MGKxrm_v_wknhfwq_eNKONy8ObGnve3tcSrbGYKdvNNAulNSDYtHA6UMulOSqr_iYwlNZjL0PojIiUEbPaq1xls_KhtWUyyRLVuShmMMQ3Nwq77Ooy8I74KebuUps5i-AIn8gWg9InHqfdcq7PDaHabUg--HnOilCjUL8ukv6btNX8GSgO2nzdTzq6aGBYPggB0Yd9NWHtvsHReE03tUk7ScAAHjgcP5Amg_B9OP25gEXgJaUjlC320KH7I9ILNIDwjFgmNmsb', region: 'BALI, INDONESIA', name: 'Handwoven Rattan Bag', badge: 'VERIFIED ARTISAN', price: '$42.00' },
              { id: '2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBprBrBBXUODnTs-brrmKPjKEIs71jWImBarFEwZAu_52Lsobc1tVIxXDbYHb0jaOgwvESRy06v-Pnh5aKTGeJsoAGM2TEJCl0bx4WdEzj2vV7AuxMJ55arUIrD__k1NCir8150urEh_d7oqOKobfcHPQJQcB44meM7Yh1iq7Lnm-GE93S8HI1oc26ojY5i7RlBzSm5oq7R5fYs7jUpFZbClDJcusHannVcPYClgZeKApJTGoxhoUiMeo5ft-uLLSPcloMefM4BWD1J', region: 'JAWA TENGAH, INDONESIA', name: 'Hand-Drawn Batik Silk', badge: 'VERIFIED ARTISAN', price: '$125.00' },
              { id: '3', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcM6oTXx3DAQ-M18BhYaSoMa9iQWDoqQW9NEzD5K2Txb9aLytHmGL88fukOpOpFpVydugE60AhhqRB8pqhNJ8pylPKvlmD6kE9auxDt8_EBeFk51hB1kjAStxhk5Imgd3H-PeaINzXfua7MrW0R33JlEjrg8yjBGGM5J_2Ufx9bzldrxUmsjC7_j0uLkJxG7mmaL6gZduovcnBMMzcmshEZXMfgYLKLkG51pRgrEI6KHKwelGUjkZpY4O8JSro26fyBXitaD5tS8Po', region: 'ACEH, INDONESIA', name: 'Single Origin Arabica', badge: 'PREMIUM GRADE', price: '$28.00' },
              { id: '4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrk74WEWxjXWfuui04KjqsBS_CGLA3dgJL4ZtOO2EbiJQyE7PRaBYsEZDggaiLcbButTKofvRO5533N8t_KF22QzNwcwWs3Ssqp5w7EgzqahK8SJW_IUzCbKqdiMQmuxUJnhBxQkgeuepuYXolxi72Q8zKVO9kG9nKvNbuYl7dfap0D2G6TbdHdcz5AJPptWJajoBHHYHI8NWJXJDsIkOWV4HYU2gHuGNdAoJYYpsyvRjbQU77cvrpAjscg-W7k5EDlPPdVbINZYn', region: 'D.I. YOGYAKARTA, INDONESIA', name: 'Bamboo Zen Lampshade', badge: 'VERIFIED ARTISAN', price: '$55.00' },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link href={`/marketplace/${p.id}`} className="bg-white rounded-lg border border-gray-200 group overflow-hidden block h-full hover:border-secondary-container hover:shadow-md transition-all">
                  <div className="relative overflow-hidden aspect-square bg-gray-100">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-widest text-primary shadow-sm uppercase">{p.region}</div>
                  </div>
                  <div className="p-4 flex flex-col justify-between h-[120px]">
                    <div>
                      <h4 className="text-primary font-bold mb-1 line-clamp-1">{p.name}</h4>
                      <div className="text-gray-600 text-[10px] font-bold tracking-widest mb-3 flex items-center gap-1 uppercase">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-secondary-container)" stroke="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        {p.badge}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-container font-bold">{p.price}</span>
                      <button className="text-primary p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={(e) => e.preventDefault()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fitur" className="py-16 md:py-[120px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="text-center mb-20">
            <span className="text-secondary-container text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t('hpFeatureBadge')}</span>
            <h2 className="text-primary text-[36px] font-semibold leading-tight">{t('hpFeatureTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Feature list */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              {[
                {
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6 6-6"/></svg>,
                  titleKey: 'hpFeature1Title',
                  descKey: 'hpFeature1Desc',
                },
                {
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                  titleKey: 'hpFeature2Title',
                  descKey: 'hpFeature2Desc',
                },
                {
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
                  titleKey: 'hpFeature3Title',
                  descKey: 'hpFeature3Desc',
                },
              ].map((f) => (
                <div key={f.titleKey} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-primary text-[24px] font-semibold mb-2">{t(f.titleKey)}</h3>
                    <p className="text-gray-600 text-base leading-relaxed">{t(f.descKey)}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Chat demo card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-primary p-8 rounded-2xl relative overflow-hidden h-[500px]"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <svg width="300" height="300" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12" stroke="var(--color-primary)" strokeWidth="0.5"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="var(--color-primary)" strokeWidth="0.5"/></svg>
              </div>
              <div className="relative z-10 flex flex-col justify-center h-full text-white">
                <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-xl mb-6 max-w-sm ml-auto">
                  <p className="text-sm italic">&quot;Your pottery has the exact texture our luxury hotel group in Dubai is looking for. Can we discuss 500 units?&quot;</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> BUYER FROM DUBAI
                  </div>
                </div>
                <div className="bg-secondary-container p-6 rounded-xl max-w-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span className="font-bold">{t('hpFeatureNotifLabel')}</span>
                  </div>
                  <p className="text-sm">&quot;Pak, wonten buyer saking Dubai kersa tumbas 500 keramikipun jenengan. Purun mboten?&quot;</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BAYANGKAN JIKA */}
      <section className="py-16 md:py-[120px] bg-background">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <p className="text-primary text-base italic mb-2 opacity-80">{t('hpImagineSubtext')}</p>
            <h2 className="text-primary text-[36px] font-semibold leading-tight">{t('hpImagineTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { roleKey: 'hpImagineRole1', cityKey: 'hpImagineCity1', quoteKey: 'hpImagineQuote1' },
              { roleKey: 'hpImagineRole2', cityKey: 'hpImagineCity2', quoteKey: 'hpImagineQuote2' },
            ].map((item, i) => (
              <motion.div 
                key={item.roleKey} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-white p-10 rounded-2xl border border-gray-200 relative shadow-sm"
              >
                <span className="text-secondary-container opacity-20 absolute top-8 right-8 text-[64px] font-serif leading-none">&ldquo;</span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{t(item.roleKey)}</div>
                    <div className="text-sm text-gray-600">{t(item.cityKey)}</div>
                  </div>
                </div>
                <p className="text-primary text-lg leading-relaxed">&ldquo;{t(item.quoteKey)}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-16 border-y border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {[
              { labelKey: 'hpTrustPayment', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { labelKey: 'hpTrustVerify', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
              { labelKey: 'hpTrustAi', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
            ].map((b) => (
              <div key={b.labelKey} className="flex items-center gap-3 opacity-60">
                {b.icon}
                <span className="text-[12px] font-bold tracking-[0.1em] text-primary uppercase">{t(b.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-[120px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-primary rounded-[32px] p-6 sm:p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, var(--color-secondary-container) 0%, transparent 20%), radial-gradient(circle at 80% 80%, var(--color-primary-fixed-dim) 0%, transparent 20%)' }} />
            <div className="relative z-10">
              <h2 className="text-white text-2xl sm:text-[32px] md:text-[56px] font-bold tracking-[-0.02em] mb-6">{t('hpCtaTitle')}</h2>
              <p className="text-primary-fixed-dim text-lg leading-relaxed max-w-2xl mx-auto mb-12">
                {t('hpCtaDesc')}
              </p>
              <Link href="/login" className="inline-block bg-secondary-container text-white px-12 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                {t('hpCtaBtn')}
              </Link>
              <p className="mt-6 text-primary-fixed-dim opacity-60 text-sm">{t('hpCtaNote')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}