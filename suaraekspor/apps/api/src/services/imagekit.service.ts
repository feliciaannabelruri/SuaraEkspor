import ImageKit from 'imagekit';
import { readFileSync } from 'fs';
import { env } from '../config/env';

const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadProductPhoto(localFilePath: string): Promise<string> {
  const fileName = localFilePath.split(/[\\/]/).pop() || `photo-${Date.now()}.jpg`;
  const result = await imagekit.upload({
    file: readFileSync(localFilePath),
    fileName,
    folder: '/suaraekspor/products',
    useUniqueFileName: true,
  });
  return result.url;
}

export async function uploadAudioFile(localFilePath: string): Promise<string> {
  const fileName = localFilePath.split(/[\\/]/).pop() || `audio-${Date.now()}.wav`;
  const result = await imagekit.upload({
    file: readFileSync(localFilePath),
    fileName,
    folder: '/suaraekspor/audio',
    useUniqueFileName: true,
  });
  return result.url;
}

// PDF is rendered in-memory (pdf-lib), so this takes a Buffer directly
// instead of a local file path — no temp file to clean up.
export async function uploadDocumentPdf(buffer: Buffer, fileName: string): Promise<string> {
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder: '/suaraekspor/legal-documents',
    useUniqueFileName: true,
  });
  return result.url;
}
