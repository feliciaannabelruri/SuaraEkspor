import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  timeout: 60000, // 60s — AI pipeline bisa lambat
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Add selected seller header if in middleman mode
  const activeUmkmRaw = typeof window !== 'undefined' ? localStorage.getItem('se_active_umkm') : null;
  if (activeUmkmRaw) {
    try {
      const activeUmkm = JSON.parse(activeUmkmRaw);
      if (activeUmkm?.id) {
        config.headers['x-selected-seller-id'] = activeUmkm.id;
      }
    } catch {}
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('se_token');
      localStorage.removeItem('se_active_umkm');
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      localStorage.removeItem('se_active_umkm');
      window.location.href = '/dashboard';
    }
    return Promise.reject(err);
  },
);

export default apiClient;