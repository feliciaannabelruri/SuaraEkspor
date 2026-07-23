import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import fs from 'fs';

// Blip koneksi DB sesaat (mis. Supabase pooler) tidak boleh mematikan seluruh server —
// tanpa ini, satu request yang gagal konek DB bisa crash seluruh proses Node dan
// membuat SEMUA halaman gagal, bukan cuma request yang bersangkutan.
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

const app = express();

// Buat direktori audio jika belum ada
if (!fs.existsSync(env.AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(env.AUDIO_OUTPUT_DIR, { recursive: true });
}

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static audio files (untuk voice notification)
app.use('/audio', express.static(env.AUDIO_OUTPUT_DIR));

app.get('/', (_req, res) => {
  res.json({ success: true, service: 'SuaraEkspor API', health: '/api/v1/health' });
});

app.use('/api/v1', routes);

// Error handler middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Express Error]', err);
  return res.status(err.status || 400).json({
    success: false,
    error: err.message || 'Terjadi kesalahan pada server',
  });
});

app.listen(parseInt(env.PORT), () => {
  console.log(`SuaraEkspor API running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;