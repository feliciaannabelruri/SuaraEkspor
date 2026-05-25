'use client';
import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VerifyContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(value.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue === '123456') {
      router.push('/dashboard');
    } else {
      alert('OTP salah. Gunakan 123456 untuk prototype.');
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white md:bg-transparent">
      {/* Left Column: Brand Identity & Trust */}
      <section className="w-full md:w-1/2 bg-primary-container relative flex flex-col px-6 pt-10 pb-16 md:p-16 overflow-hidden md:min-h-screen">
        {/* Abstract Batik Overlay */}
        <div
          className="absolute inset-0 batik-overlay mix-blend-soft-light opacity-30 pointer-events-none"
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

      {/* Right Column: OTP Form */}
      <section className="w-full md:w-1/2 bg-white md:bg-surface-bright flex flex-col items-center justify-start md:justify-center p-6 md:p-16 -mt-8 md:mt-0 relative z-20 rounded-t-3xl md:rounded-none min-h-[60vh] md:min-h-0">
        <div className="w-full max-w-md bg-white md:p-8 rounded-none md:rounded-xl border-none md:border md:border-outline-variant/30 shadow-none md:shadow-sm">
          <button 
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:underline text-sm md:text-base mt-2 md:mt-0"
          >
            <span className="material-symbols-outlined text-sm md:text-base">arrow_back</span>
            Ganti Nomor
          </button>
          
          <h2 className="font-headline-sm md:text-headline-md text-primary mb-1 md:mb-2">Verifikasi Nomor Anda</h2>
          <p className="text-sm md:text-base text-on-surface-variant mb-6 md:mb-8">
            Kode OTP telah dikirim ke <span className="font-bold text-on-surface">{phone || '+62 812-XXXX-XXXX'}</span> via WhatsApp
          </p>
          
          <form className="space-y-6 md:space-y-8" onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex justify-between gap-1 sm:gap-2 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all outline-none"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-on-surface-variant text-xs md:text-sm">
                Kirim ulang kode dalam <span className="text-primary font-bold">45 detik</span>
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-secondary-container text-white py-3.5 md:py-4 rounded-lg font-bold text-base md:text-lg shadow-lg shadow-secondary-container/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Verifikasi &amp; Masuk
            </button>
          </form>

          <div className="mt-8 md:mt-10 p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start md:items-center gap-3 md:gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white mt-0.5 md:mt-0">
              <svg className="w-4 h-4 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
              </svg>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-tight">
              Cek pesan WhatsApp Anda untuk melihat 6 digit kode verifikasi yang kami kirimkan.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}