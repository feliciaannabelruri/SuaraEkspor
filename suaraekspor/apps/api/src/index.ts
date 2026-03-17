import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import fs from 'fs';

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

app.use('/api/v1', routes);

app.listen(parseInt(env.PORT), () => {
  console.log(`SuaraEkspor API running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;