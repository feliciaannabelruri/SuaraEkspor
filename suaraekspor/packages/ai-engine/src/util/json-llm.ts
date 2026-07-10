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

  for (let attempt = 0; attempt < 2; attempt++) {
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
      throw new Error(`${stageName} gagal: ${err instanceof Error ? err.message : String(err)}`);
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
