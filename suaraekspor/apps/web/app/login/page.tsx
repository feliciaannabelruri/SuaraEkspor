'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#0F4A33] px-5 pt-12 pb-8">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-4 block">← Kembali</button>
        <h1 className="text-white text-2xl font-bold">Masuk ke SuaraEkspor</h1>
        <p className="text-[#A8D5C2] text-sm mt-1">Kami kirim kode OTP ke WhatsApp Anda</p>
      </div>
      <div className="px-5 pt-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP / WhatsApp</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-green-600"
        />
        <button
          onClick={() => router.push(`/verify?phone=${phone}`)}
          className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl mt-4 text-base">
          Kirim Kode OTP
        </button>
        <p className="text-center text-gray-400 text-xs mt-6">
          Mode prototype — gunakan kode <strong>123456</strong>
        </p>
      </div>
    </div>
  );
}