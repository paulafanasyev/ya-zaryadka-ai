/**
 * Piko AI client.
 * The mobile app never contains an APINEX secret. The server-side /ai/chat
 * endpoint owns the secret and may route/fail over between configured models.
 */

import axios from 'axios';
import { checkChildSafety, SVETLANA_SYSTEM_PROMPT } from './aiPolicy';

export type AIProviderType = 'piko-proxy' | 'mock';

export interface AIConfig {
  provider: AIProviderType;
  apiUrl?: string;
  model?: string;
  models?: string[];
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: number;
  conversationId?: number;
  fromUser?: boolean;
  sentAt?: string;
}

export interface AIResponse {
  text: string;
  conversationId?: string;
  model?: string;
  fallbackUsed?: boolean;
  blocked?: boolean;
}

export const PIKO_MODELS = [
  'free/glm-5.3-flash',
  'free/gemini-3.8-flash',
  'free/muse-spark-1.3',
  'free/deepseek-v4-pro-0813',
  'free/gpt-5.6-luna',
  'free/qwen-3.8-max',
] as const;

const DEFAULT_API_URL = process.env.API_URL || 'https://api.ya-zaryadka.ru/api';

class AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      ...config,
      models: config.models?.length ? config.models : [...PIKO_MODELS],
    };
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const userMessage = [...messages].reverse().find((message) => message.role === 'user');
    const policy = checkChildSafety(userMessage?.content || '');

    if (!policy.allowed) {
      return { text: policy.response, blocked: true };
    }

    if (this.config.provider === 'mock') {
      return this.sendMock(userMessage?.content || '');
    }

    return this.sendThroughProxy(messages);
  }

  private async sendThroughProxy(messages: AIMessage[]): Promise<AIResponse> {
    const models = this.config.model ? [this.config.model] : (this.config.models || [...PIKO_MODELS]);
    let lastError: unknown;

    for (let index = 0; index < models.length; index += 1) {
      const model = models[index];
      try {
        const response = await axios.post(
          `${(this.config.apiUrl || DEFAULT_API_URL).replace(/\/$/, '')}/ai/chat`,
          {
            messages: [
              { role: 'system', content: SVETLANA_SYSTEM_PROMPT },
              ...messages.map(({ role, content }) => ({ role, content })),
            ],
            model,
            fallbackModels: models.slice(index + 1),
            ageRange: '6-14',
            assistant: 'piko',
          },
          {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const text = response.data?.text || response.data?.message?.content || response.data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('AI proxy returned an empty response');

        return {
          text,
          conversationId: response.data?.conversationId,
          model: response.data?.model || model,
          fallbackUsed: response.data?.fallbackUsed ?? index > 0,
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Piko AI proxy is unavailable');
  }

  private async sendMock(userMessage: string): Promise<AIResponse> {
    const lower = userMessage.toLowerCase();
    let text = 'Привет! Я Пико. Давай сделаем что-нибудь полезное и весёлое.';

    if (lower.includes('заряд') || lower.includes('упражнен')) {
      text = 'Отлично! Давай начнём с разминки. Делай движения спокойно и без боли.';
    } else if (lower.includes('пушкин') || lower.includes('сказк')) {
      text = 'Можем обсудить сказки Пушкина, героев и придумать безопасное творческое задание.';
    } else if (lower.includes('деньг') || lower.includes('копил')) {
      text = 'Деньги можно планировать: часть потратить, часть сохранить. Так проще достигать целей.';
    } else if (lower.includes('спасибо')) {
      text = 'Пожалуйста! Ты хорошо справляешься.';
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    return { text, model: 'mock' };
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const aiProvider = new AIProvider({ provider: 'piko-proxy' });

export default AIProvider;
