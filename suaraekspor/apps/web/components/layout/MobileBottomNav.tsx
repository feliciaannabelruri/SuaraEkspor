'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  unreadMessagesCount?: number;
}

export default function MobileBottomNav({ unreadMessagesCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
    { label: 'Upload', href: '/upload', icon: 'upload_file' },
    { label: 'Pesan', href: '/conversations', icon: 'forum' },
    { label: 'WhatsApp', href: '/whatsapp', icon: 'chat' },
    { label: 'Panduan', href: '/panduan', icon: 'menu_book' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-primary border-t border-primary-container flex z-50 pb-safe shadow-lg">
      {navItems.map((item) => {
        // Special active logic for dashboard (also active if on product detail)
        const isActive = item.href === '/dashboard'
          ? (pathname === '/dashboard' || (pathname && pathname.startsWith('/product')))
          : (pathname === item.href || (pathname && pathname.startsWith(item.href)));
          
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2.5 transition-colors relative ${
              isActive ? 'text-secondary-container' : 'text-primary-fixed-dim opacity-80 hover:opacity-100'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            
            {item.label === 'Pesan' && unreadMessagesCount > 0 && (
              <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
            )}
            
            <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
