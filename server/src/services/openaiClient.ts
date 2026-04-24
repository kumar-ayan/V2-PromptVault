import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Gemini model rotation list (ordered by preference / context-window size).
// When a model hits its rate-limit the client automatically tries the next.
// ---------------------------------------------------------------------------
export const GEMINI_MODELS = [
  'gemma-3-27b-it',
  'gemma-4-31b-it',
  'gemma-3n-e4b-it',
  'gemma-4-26b-a4b-it',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];

/** Returns true when an error is a rate-limit / quota-exceeded signal. */
const isRateLimitError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as { message?: string }).message ?? '';
  const status = (error as { status?: number; statusCode?: number }).status
    ?? (error as { status?: number; statusCode?: number }).statusCode
    ?? 0;
  return (
    status === 429 ||
    /rate.?limit|quota.?exceeded|resource.?exhausted|too.?many.?requests/i.test(msg)
  );
};

// ---------------------------------------------------------------------------
// Provider factory helpers
// ---------------------------------------------------------------------------
export const getOpenRouterClient = () => {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': env.SITE_URL,
      'X-Title': env.SITE_NAME,
    },
  });
};

export const getGroqClient = () => {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};

export const getGeminiClient = () => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

// ---------------------------------------------------------------------------
// Gemini multi-model call with automatic rotation on rate-limit errors
// ---------------------------------------------------------------------------

/**
 * Calls the Gemini API, rotating through `GEMINI_MODELS` when a model hits
 * its rate limit.  Optionally accepts a preferred model to try first.
 */
export const callGeminiWithFallback = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  preferredModel?: string,
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const gemini = getGeminiClient();
  if (!gemini) throw new Error('GEMINI_API_KEY is not configured.');

  // Build a deduplicated rotation list: preferred model first, then the rest
  const normalised = (preferredModel ?? '').replace('google/', '');
  const rotation: string[] = [
    ...new Set([
      ...(normalised ? [normalised] : []),
      ...GEMINI_MODELS,
    ]),
  ];

  let lastError: unknown;

  for (const modelId of rotation) {
    try {
      console.log(`[Gemini] Trying model: ${modelId}`);
      const genModel = gemini.getGenerativeModel({ model: modelId });

      const chat = genModel.startChat({
        history: messages.slice(0, -1).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content as string }],
        })),
      });

      const lastMessage = messages[messages.length - 1].content as string;
      const result = await chat.sendMessage(lastMessage);
      const text = result.response.text();

      return {
        id: `gemini-${Date.now()}`,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: text, refusal: null },
            finish_reason: 'stop',
            logprobs: null,
          },
        ],
        created: Math.floor(Date.now() / 1000),
        model: modelId,
        object: 'chat.completion',
        // Gemini SDK does not expose token counts in this call path
        usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
      } as OpenAI.Chat.Completions.ChatCompletion;
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error)) {
        console.warn(`[Gemini] Rate-limit hit on "${modelId}", rotating to next model…`);
        continue; // try the next model
      }
      // Non-rate-limit error — surface it immediately
      throw error;
    }
  }

  throw new Error(
    `All Gemini models exhausted their rate limits. Last error: ${String(lastError)}`,
  );
};

// ---------------------------------------------------------------------------
// Unified chat completion — single entry point for all callers
// ---------------------------------------------------------------------------

/**
 * Provides a unified chat interface with automatic fallback across providers.
 *
 * Resolution order:
 *  1. Gemini direct API (with internal model rotation on rate-limit)
 *  2. OpenRouter
 *  3. Groq (model name remapping applied automatically)
 */
export const unifiedChatCompletion = async (
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  options?: { timeout?: number },
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const { model, messages } = params;

  // ── 1. Gemini ─────────────────────────────────────────────────────────────
  if (model.startsWith('gemini-') || model.startsWith('google/gemini-')) {
    try {
      return await callGeminiWithFallback(messages, model);
    } catch (error) {
      console.error('[Gemini] All models failed, attempting OpenRouter fallback:', error);
    }
  }

  // ── 2. OpenRouter ─────────────────────────────────────────────────────────
  const openRouter = getOpenRouterClient();
  if (openRouter) {
    try {
      return await openRouter.chat.completions.create(params, options);
    } catch (error) {
      console.error('[OpenRouter] Failed, falling back to Groq:', error);
    }
  }

  // ── 3. Groq ───────────────────────────────────────────────────────────────
  const groq = getGroqClient();
  if (groq) {
    let groqModel = params.model;
    if (params.model.includes('gpt-4o-mini') || params.model.includes('free')) {
      groqModel = 'llama-3.3-70b-versatile';
    }

    return await groq.chat.completions.create({ ...params, model: groqModel }, options);
  }

  throw new Error('No LLM provider is configured or available.');
};

/** @deprecated Use unifiedChatCompletion or getOpenRouterClient() instead */
export const getOpenAIClient = getOpenRouterClient;
