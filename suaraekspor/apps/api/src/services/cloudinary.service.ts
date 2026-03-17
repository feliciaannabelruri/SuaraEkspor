import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadProductPhoto(localFilePath: string): Promise<string> {
  const result = await cloudinary.uploader.upload(localFilePath, {
    folder: 'suaraekspor/products',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}

export async function uploadAudioFile(localFilePath: string): Promise<string> {
  const result = await cloudinary.uploader.upload(localFilePath, {
    resource_type: 'video', // Cloudinary pakai 'video' untuk audio
    folder: 'suaraekspor/audio',
  });
  return result.secure_url;
}