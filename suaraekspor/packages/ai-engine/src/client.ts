import OpenAI from 'openai';

// Groq API is OpenAI-compatible — we reuse the official `openai` SDK
// and just point it at Groq's endpoint instead of switching SDKs.
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const GROQ_MODELS = {
  chatJson: 'llama-3.3-70b-versatile',
  vision: 'meta-llama/llama-4-scout-17b-16e-instruct',
  whisper: 'whisper-large-v3-turbo',
  tts: 'canopylabs/orpheus-v1-english',
} as const;
