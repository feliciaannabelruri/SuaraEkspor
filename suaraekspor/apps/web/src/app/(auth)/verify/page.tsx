'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';
  const role = params.get('role') ?? 'seller';

  async function handleVerify() {
    if (otp.length !== 6) { setError('OTP harus 6 digit'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/otp/verify', { phone, otp });
      localStorage.setItem('se_token', data.data.token);
      localStorage.setItem('se_user', JSON.stringify(data.data.user));
      router.push(role === 'seller' ? '/dashboard' : '/marketplace');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'OTP tidak valid');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-5 pt-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Masukkan Kode OTP</h1>
      <p className="text-gray-500 text-sm mb-8">Dikirim ke {phone}</p>
      <input
        type="number"
        value={otp}
        onChange={(e) => setOtp(e.target.value.slice(0, 6))}
        placeholder="6 digit kode"
        className="w-full border border-gray-300 rounded-xl px-4 py-4 text-2xl text-center tracking-widest outline-none focus:border-green-600"
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-green-800 text-white font-bold py-4 rounded-xl mt-4 text-base disabled:opacity-50">
        {loading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>
    </div>
  );
}