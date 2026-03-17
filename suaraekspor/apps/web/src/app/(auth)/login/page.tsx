'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role') ?? 'seller';

  async function handleSendOTP() {
    if (!phone || phone.length < 10) {
      setError('Masukkan nomor HP yang valid');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formattedPhone = phone.startsWith('0')
        ? '+62' + phone.slice(1)
        : phone;
      await apiClient.post('/auth/otp/send', { phone: formattedPhone, role });
      router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}&role=${role}`);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-green-900 px-5 pt-12 pb-8">
        <h1 className="text-white text-2xl font-bold">Masuk ke SuaraEkspor</h1>
        <p className="text-green-300 text-sm mt-1">Kami kirim kode OTP ke WhatsApp Anda</p>
      </div>
      <div className="flex-1 px-5 pt-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP / WhatsApp</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-green-600"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          onClick={handleSendOTP}
          disabled={loading}
          className="w-full bg-green-800 text-white font-bold py-4 rounded-xl mt-4 text-base disabled:opacity-50">
          {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
        </button>
        <p className="text-center text-gray-400 text-xs mt-6">
          Mode development: gunakan OTP <strong>123456</strong>
        </p>
      </div>
    </div>
  );
}