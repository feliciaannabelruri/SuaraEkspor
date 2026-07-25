import type OpenAI from 'openai';
import type { z } from 'zod';

const REQUEST_TIMEOUT_MS = 30000;
const RETRY_SYSTEM_MESSAGE =
  'PENTING: balas HANYA dengan JSON valid sesuai schema yang diminta, tanpa teks lain.';

export async function chatJsonWithValidation<T>(
  openai: OpenAI,
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  schema: z.ZodType<T>,
  stageName: string,
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const messages =
      attempt === 0
        ? params.messages
        : [...params.messages, { role: 'system' as const, content: RETRY_SYSTEM_MESSAGE }];

    let content: string | null | undefined;
    try {
      const response = await openai.chat.completions.create(
        { ...params, messages },
        { timeout: REQUEST_TIMEOUT_MS },
      );
      content = response.choices[0]?.message?.content;
    } catch (err) {
      // Groq itself can reject a response as invalid JSON before it reaches us
      // (e.g. "400 Failed to validate JSON") — that's exactly the transient
      // failure the retry-with-stricter-prompt below exists for, so record it
      // and retry instead of throwing immediately on attempt 1.
      lastError = err;
      continue;
    }

    if (!content) {
      lastError = new Error('respons kosong dari OpenAI');
      continue;
    }

    try {
      const parsed = JSON.parse(content);
      return schema.parse(parsed);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `${stageName} gagal: respons tidak sesuai format yang diharapkan (${
      lastError instanceof Error ? lastError.message : String(lastError)
    })`,
  );
}
