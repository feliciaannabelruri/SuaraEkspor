'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'Fitur', href: '/#fitur' },
  { label: 'Marketplace', href: '/marketplace' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(href: string) {
    if (href.startsWith('/#')) return false; // anchor links can't be "active"
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#01261f] transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-16 py-4 w-full max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/SuaraEksporLogo.png"
            alt="SuaraEkspor Logo"
            width={320}
            height={80}
            className="h-28 w-auto object-contain my-[-28px] ml-[-32px]"
            priority
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`px-2 text-base font-medium transition-all ${
                isActive(href)
                  ? 'text-[#fe802f] font-bold'
                  : 'text-[#83a69c] opacity-80 hover:opacity-100 hover:text-[#fe802f]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-center">
          <Link
            href="/login"
            className="hidden sm:inline-block bg-[#fe802f] text-white font-bold px-6 py-2 rounded-lg hover:scale-95 duration-150 transition-transform text-sm md:text-base"
          >
            Mulai Sekarang
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#83a69c] hover:text-white p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden bg-[#01261f] border-t border-[#83a69c]/10 px-6 py-4 space-y-4">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-base font-medium transition-all ${
                isActive(href)
                  ? 'text-[#fe802f] font-bold'
                  : 'text-[#83a69c] opacity-80 hover:text-[#fe802f]'
              }`}
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block bg-[#fe802f] text-white font-bold px-6 py-3 rounded-lg text-center hover:scale-95 duration-150 transition-transform"
          >
            Mulai Sekarang
          </Link>
        </div>
      )}
    </nav>
  );
}
