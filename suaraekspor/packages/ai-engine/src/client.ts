import OpenAI from 'openai';

// Groq API is OpenAI-compatible — we reuse the official `openai` SDK
// and just point it at Groq's endpoint instead of switching SDKs.
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const GROQ_MODELS = {
  chatJson: 'llama-3.3-70b-versatile',
  // meta-llama/llama-4-scout-17b-16e-instruct was deprecated by Groq on 2026-06-17.
  // Groq's default suggested replacement (openai/gpt-oss-120b) is text-only, so it
  // can't do product photo analysis — qwen/qwen3.6-27b is their vision-capable
  // replacement, though Groq currently serves it as a preview model.
  vision: 'qwen/qwen3.6-27b',
  whisper: 'whisper-large-v3-turbo',
  tts: 'canopylabs/orpheus-v1-english',
} as const;
