'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-primary">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-16 py-16 w-full max-w-[1280px] mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/SuaraEksporLogo.png"
              alt="SuaraEkspor Logo"
              width={320}
              height={80}
              className="h-28 w-auto object-contain my-[-28px]"
            />
          </Link>
          <p className="text-[#83a69c] opacity-70 text-base leading-relaxed">
            Platform AI yang mendemokratisasi akses pasar global untuk UMKM Indonesia.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a3c34] flex items-center justify-center text-white hover:bg-[#fe802f] transition-colors"
              aria-label="Website"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a3c34] flex items-center justify-center text-white hover:bg-[#fe802f] transition-colors"
              aria-label="Share"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a3c34] flex items-center justify-center text-white hover:bg-[#fe802f] transition-colors"
              aria-label="Email"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Produk */}
        <div className="space-y-6">
          <div className="text-white font-bold">Produk</div>
          <ul className="space-y-4">
            <li><Link href="/marketplace" className="text-[#83a69c] opacity-70 hover:text-white hover:opacity-100 transition-colors">Marketplace</Link></li>
            <li><a href="/#fitur" className="text-[#83a69c] opacity-70 hover:text-white hover:opacity-100 transition-colors">Fitur AI</a></li>
          </ul>
        </div>

        {/* Dukungan */}
        <div className="space-y-6">
          <div className="text-white font-bold">Dukungan</div>
          <ul className="space-y-4">
            <li><a href="/#cara-kerja" className="text-[#83a69c] opacity-70 hover:text-white hover:opacity-100 transition-colors">Cara Kerja</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8 border-t border-[#1a3c34] text-center md:text-left">
        <p className="text-[#83a69c] opacity-50 text-xs tracking-widest uppercase">
          © 2026 SuaraEkspor. PIDI DIGDAYA X Hackathon 2026. Platform AI Ekspor Inklusif.
        </p>
      </div>
    </footer>
  );
}
