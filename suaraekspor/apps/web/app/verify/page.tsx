'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';

  function handleVerify() {
    if (otp === '123456') {
      router.push('/dashboard');
    } else {
      alert('OTP salah. Gunakan 123456 untuk prototype.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] px-5 pt-12">
      <button onClick={() => router.back()} className="text-[#0F4A33] text-sm mb-6 block">← Kembali</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Masukkan Kode OTP</h1>
      <p className="text-gray-500 text-sm mb-8">Dikirim ke {phone || 'nomor Anda'}</p>
      <input
        type="number"
        value={otp}
        onChange={(e) => setOtp(e.target.value.slice(0, 6))}
        placeholder="123456"
        className="w-full border border-gray-300 rounded-xl px-4 py-4 text-2xl text-center tracking-widest outline-none focus:border-green-600"
      />
      <button
        onClick={handleVerify}
        className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl mt-4 text-base">
        Verifikasi
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}