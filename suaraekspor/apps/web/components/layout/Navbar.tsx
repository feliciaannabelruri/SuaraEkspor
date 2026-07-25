'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, CreditCard, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Navbar() {
  const { t } = useTranslation();
  const navLinks = [
    { label: t('nvHome'), href: '/' },
    { label: t('nvHowItWorks'), href: '/cara-kerja' },
    { label: t('nvMarketplace'), href: '/marketplace' },
    { label: 'Harga', href: '/pricing' },
  ];
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [user, setUser] = useState<{ name?: string; phone?: string; role?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('se_token');
    let userRole = '';
    let parsedUser = null;
    try {
      const userStr = localStorage.getItem('se_user');
      parsedUser = userStr ? JSON.parse(userStr) : null;
      userRole = parsedUser?.role || '';
    } catch (_) {}

    // Auto log out seller if they return to the homepage ('/')
    if (pathname === '/' && token && (userRole === 'seller' || userRole === 'admin')) {
      localStorage.removeItem('se_token');
      localStorage.removeItem('se_user');
      setIsLoggedIn(false);
      setIsSeller(false);
      setUser(null);
    } else {
      setIsLoggedIn(!!token);
      setIsSeller(userRole === 'seller' || userRole === 'admin');
      setUser(parsedUser);
    }
  }, [pathname]);

  function isActive(href: string) {
    if (href.startsWith('/#')) return false; // anchor links can't be "active"
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-primary transition-all duration-300">
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
        <div className="hidden md:flex gap-4 lg:gap-6 items-center">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`px-1.5 text-sm font-semibold whitespace-nowrap transition-all ${
                isActive(href)
                  ? 'text-[#fe802f] font-bold'
                  : 'text-[#83a69c] opacity-80 hover:opacity-100 hover:text-[#fe802f]'
              }`}
            >
              {label}
            </Link>
          ))}
          
          {isLoggedIn && !isSeller && (
            <>
              <Link
                href="/buyer-transactions"
                className={`px-1.5 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive('/buyer-transactions')
                    ? 'text-[#fe802f] font-bold'
                    : 'text-[#83a69c] opacity-80 hover:opacity-100 hover:text-[#fe802f]'
                }`}
              >
                <CreditCard size={15} />
                {t('nvMyTransactions')}
              </Link>
              <Link
                href="/buyer-conversations"
                className={`px-1.5 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive('/buyer-conversations')
                    ? 'text-[#fe802f] font-bold'
                    : 'text-[#83a69c] opacity-80 hover:opacity-100 hover:text-[#fe802f]'
                }`}
              >
                <MessageSquare size={15} />
                {t('nvMyChats')}
              </Link>
            </>
          )}
          
          {isLoggedIn && isSeller && (
            <Link
              href="/dashboard"
              className={`px-1.5 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'text-[#fe802f] font-bold'
                  : 'text-[#83a69c] opacity-80 hover:opacity-100 hover:text-[#fe802f]'
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard Seller
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-center">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="hidden sm:inline-block bg-[#fe802f] text-white font-bold px-6 py-2 rounded-lg hover:scale-95 duration-150 transition-transform text-sm md:text-base"
            >
              Mulai Sekarang
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 hover:opacity-85 transition-opacity bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
              >
                <div className="w-7 h-7 rounded-full bg-[#fe802f] flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || user?.phone?.slice(-4) || 'U'}
                </div>
                <span className="text-white text-xs font-bold leading-none pr-1">
                  {user?.name || t('nvMyProfile')}
                </span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('se_token');
                  localStorage.removeItem('se_user');
                  window.location.href = '/';
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg hover:scale-95 duration-150 transition-transform text-xs"
              >
                {t('nvLogout')}
              </button>
            </div>
          )}
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
        <div className="md:hidden bg-primary border-t border-[#83a69c]/10 px-6 py-4 space-y-4">
          {navLinks.map(({ label, href }) => (
            <Link
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
            </Link>
          ))}

          {isLoggedIn && !isSeller && (
            <>
              <Link
                href="/buyer-transactions"
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base font-medium transition-all flex items-center gap-1.5 ${
                  isActive('/buyer-transactions') ? 'text-[#fe802f] font-bold' : 'text-[#83a69c] opacity-80 hover:text-[#fe802f]'
                }`}
              >
                 <CreditCard size={16} />
                {t('nvMyTransactions')}
              </Link>
              <Link
                href="/buyer-conversations"
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base font-medium transition-all flex items-center gap-1.5 ${
                  isActive('/buyer-conversations') ? 'text-[#fe802f] font-bold' : 'text-[#83a69c] opacity-80 hover:text-[#fe802f]'
                }`}
              >
                 <MessageSquare size={16} />
                {t('nvMyChats')}
              </Link>
            </>
          )}
          
          {isLoggedIn && isSeller && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-base font-medium transition-all flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'text-[#fe802f] font-bold' : 'text-[#83a69c] opacity-80 hover:text-[#fe802f]'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard Seller
            </Link>
          )}

          {!isLoggedIn ? (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block bg-[#fe802f] text-white font-bold px-6 py-3 rounded-lg text-center hover:scale-95 duration-150 transition-transform"
            >
              Mulai Sekarang
            </Link>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('se_token');
                localStorage.removeItem('se_user');
                window.location.href = '/';
              }}
              className="w-full block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-center hover:scale-95 duration-150 transition-transform"
            >
              {t('nvLogout')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

