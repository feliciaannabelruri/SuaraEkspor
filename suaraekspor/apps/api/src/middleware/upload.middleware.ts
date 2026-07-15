import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const UPLOAD_DIR = path.join(os.tmpdir(), 'suaraekspor-uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_TO_EXT: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Prefer extension from originalname, but fall back to mimetype lookup
    // (browsers often send audio/webm;codecs=opus — strip codecs part first)
    const baseMime = file.mimetype.split(';')[0].trim();
    const ext = path.extname(file.originalname) || MIME_TO_EXT[baseMime] || '.bin';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan'));
  },
});

export const uploadAudio = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (Whisper limit)
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format audio tidak didukung'));
  },
});

export const uploadProductFiles = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max limit (audio)
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'photos') {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan untuk foto produk'));
      }
    } else if (file.fieldname === 'audio') {
      const allowed = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
      // Check if mimetype starts with any of the allowed types (to handle codecs like audio/webm;codecs=opus)
      const isAllowed = allowed.some(mime => file.mimetype.startsWith(mime) || file.mimetype.includes(mime));
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error('Format audio tidak didukung: ' + file.mimetype));
      }
    } else {
      cb(null, true);
    }
  },
});