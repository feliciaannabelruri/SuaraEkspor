'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

function LoginContent() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role') ?? 'seller';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('Masukkan nomor WhatsApp yang valid');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const digits = phone.replace(/\s+/g, '');
      const formattedPhone = digits.startsWith('0')
        ? '+62' + digits.slice(1)
        : digits.startsWith('+')
        ? digits
        : '+62' + digits;
      await apiClient.post('/auth/otp/send', { phone: formattedPhone, role });
      router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}&role=${role}`);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col md:flex-row bg-white md:bg-transparent">
        {/* Left Column: Brand Identity & Trust */}
        <section className="w-full md:w-1/2 bg-primary-container relative flex flex-col px-6 pt-10 pb-16 md:p-16 overflow-hidden md:min-h-screen">
          {/* Abstract Batik Overlay */}
          <div
            className="absolute inset-0 batik-overlay mix-blend-soft-light opacity-30 pointer-events-none"
            title="A sophisticated digital artwork featuring traditional Indonesian batik patterns with intricate floral and geometric motifs. The design uses warm amber and gold tones against a deep forest green background, creating a high-contrast, premium aesthetic. Soft ambient lighting highlights the texture, blending ancient heritage with modern digital precision."
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
              Ekspor Lebih Mudah, <br className="hidden md:inline" />
              Dimulai dari Sini.
            </h1>
            <p className="font-body-md md:font-body-lg text-[13px] md:text-lg text-on-primary-container max-w-lg mx-auto md:mx-0">
              Bergabung dengan ribuan UMKM Indonesia yang sudah menjangkau pasar dunia.
            </p>
          </div>

          {/* Trust Points */}
          <div className="relative z-10 space-y-4 hidden md:block">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-body-md text-white">Gratis untuk UMKM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-body-md text-white">Tanpa perlu bisa bahasa asing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-body-md text-white">AI siap membantu 24/7</span>
            </div>
          </div>
        </section>

        {/* Right Column: Login Action */}
        <section className="w-full md:w-1/2 bg-white md:bg-[#FDF0E8] flex flex-col items-center justify-start md:justify-center p-6 md:p-16 -mt-8 md:mt-0 relative z-20 rounded-t-3xl md:rounded-none min-h-[60vh] md:min-h-0">
          <div className="w-full max-w-md bg-white md:p-8 rounded-none md:rounded-xl border-none md:border md:border-outline-variant/30 shadow-none md:shadow-sm">
            <div className="text-center md:text-left mb-6 md:mb-8 mt-2 md:mt-0">
              <h2 className="font-headline-sm md:text-headline-md text-primary mb-1 md:mb-2">Masuk ke SuaraEkspor</h2>
              <p className="font-body-md text-sm md:text-base text-on-surface-variant">Masukkan nomor WhatsApp Anda untuk melanjutkan.</p>
            </div>
            <form className="space-y-5 md:space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="font-label-caps text-xs text-on-surface-variant">NOMOR WHATSAPP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none border-r border-outline-variant/30 pr-3">
                    <span className="text-body-md font-bold text-on-surface">+62</span>
                  </div>
                  <input
                    className="w-full pl-16 pr-4 py-3.5 md:py-4 rounded-lg bg-[#F5E6DD] border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all font-body-md outline-none text-sm md:text-base"
                    placeholder="812 3456 7890"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                className="w-full py-3.5 md:py-4 bg-secondary-container text-white font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md text-sm md:text-base disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
              </button>

              <div className="text-center text-gray-400 text-xs mt-2 mb-4">
                Mode prototype — gunakan kode <strong>123456</strong>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-outline-variant/50"></div>
                <span className="text-label-caps text-on-surface-variant text-[10px] md:text-xs">— atau —</span>
                <div className="h-px flex-1 bg-outline-variant/50"></div>
              </div>
              <div className="text-center">
                <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
                  Belum punya akun?{' '}
                  <a className="text-secondary font-bold hover:underline" href="#">Daftar Sekarang</a>
                </p>
              </div>
              <div className="bg-surface-container-low p-3 md:p-4 rounded-lg flex items-start gap-3 mt-6 md:mt-8">
                <span className="material-symbols-outlined text-primary text-[18px] md:text-[20px] mt-0.5">info</span>
                <p className="text-[11px] md:text-[12px] leading-tight text-on-surface-variant">
                  Mode demo: verifikasi WhatsApp asli belum aktif. Gunakan kode <strong>123456</strong> di halaman berikutnya untuk masuk.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
