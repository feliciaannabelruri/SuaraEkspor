'use client';
import { useCallback, useState } from 'react';

export type PhotoQualityWarning = 'blurry' | 'too_dark' | 'too_bright' | 'no_subject';

export interface PhotoQualityResult {
  label: string;
  confidence: number;
  warnings: PhotoQualityWarning[];
}

const CANVAS_SIZE = 224;
const BLUR_VARIANCE_THRESHOLD = 60;
const DARK_THRESHOLD = 60;
const BRIGHT_THRESHOLD = 235;
const SUBJECT_CONFIDENCE_THRESHOLD = 0.15;

let modelPromise: Promise<import('@tensorflow-models/mobilenet').MobileNet> | null = null;

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');
      await tf.ready();
      return mobilenet.load({ version: 2, alpha: 0.5 });
    })();
  }
  return modelPromise;
}

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  bitmap.close();
  return canvas;
}

function toGrayscale(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return gray;
}

// Variance of the Laplacian — a standard sharpness measure: a blurry photo has
// few strong edges, so the second-derivative response stays close to flat.
function laplacianVariance(gray: Float32Array, width: number, height: number): number {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const value = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - width] - gray[idx + width];
      sum += value;
      sumSq += value * value;
      count++;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function averageBrightness(gray: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  return sum / gray.length;
}

/**
 * On-device (in-browser) photo quality check, run before upload so sellers get
 * instant feedback instead of waiting for the server-side vision LLM call.
 * Runs a MobileNet pass for subject confidence plus classic blur/exposure
 * heuristics on a canvas — nothing leaves the browser.
 */
export function useImageQualityCheck() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<Record<number, PhotoQualityResult>>({});

  const checkPhotos = useCallback(async (files: File[]) => {
    setChecking(true);
    try {
      const model = await loadModel();
      const next: Record<number, PhotoQualityResult> = {};

      for (let i = 0; i < files.length; i++) {
        const canvas = await fileToCanvas(files[i]);
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const gray = toGrayscale(imageData);
        const variance = laplacianVariance(gray, CANVAS_SIZE, CANVAS_SIZE);
        const brightness = averageBrightness(gray);
        const predictions = await model.classify(canvas);
        const top = predictions[0];

        const warnings: PhotoQualityWarning[] = [];
        if (variance < BLUR_VARIANCE_THRESHOLD) warnings.push('blurry');
        if (brightness < DARK_THRESHOLD) warnings.push('too_dark');
        if (brightness > BRIGHT_THRESHOLD) warnings.push('too_bright');
        if (!top || top.probability < SUBJECT_CONFIDENCE_THRESHOLD) warnings.push('no_subject');

        next[i] = {
          label: top?.className?.split(',')[0] ?? 'tidak diketahui',
          confidence: top?.probability ?? 0,
          warnings,
        };
      }

      setResults(next);
    } finally {
      setChecking(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults({}), []);

  return { checking, results, checkPhotos, clearResults };
}
