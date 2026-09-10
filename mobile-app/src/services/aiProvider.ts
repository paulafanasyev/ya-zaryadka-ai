/**
 * AI Provider - Abstract layer for LLM integration
 * Supports OpenAI, Gemini, Anthropic, and mock provider
 */

import axios from 'axios';

export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'mock';

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  conversationId?: string;
}

class AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.sendToOpenAI(messages);
      case 'gemini':
        return this.sendToGemini(messages);
      case 'anthropic':
        return this.sendToAnthropic(messages);
      case 'mock':
      default:
        return this.sendMock(messages);
    }
  }

  private async sendToOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    const response = await axios.post(
      this.config.apiUrl || 'https://api.openai.com/v1/chat/completions',
      {
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты - Светлана, дружелюбный ИИ-помощник для детей 6-14 лет. 
Твоя задача - помогать детям с утренней зарядкой, отвечать на вопросы о здоровье и финансах.
Говори просто, понятно и весело. Не давай медицинских советов. Если ребёнку больно - скажи остановиться.
Поощряй активность и здоровые привычки.`,
          },
          ...messages,
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.choices[0].message.content,
    };
  }

  private async sendToGemini(messages: AIMessage[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const response = await axios.post(
      this.config.apiUrl || `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`,
      {
        contents: [{
          parts: [{
            text: lastMessage.content
          }]
        }],
      }
    );

    return {
      text: response.data.candidates[0].content.parts[0].text,
    };
  }

  private async sendToAnthropic(messages: AIMessage[]): Promise<AIResponse> {
    const response = await axios.post(
      this.config.apiUrl || 'https://api.anthropic.com/v1/messages',
      {
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: messages.filter(m => m.role !== 'system'),
        system: `Ты - Светлана, дружелюбный ИИ-помощник для детей. Говори просто и весело.`,
      },
      {
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.content[0].text,
    };
  }

  private async sendMock(messages: AIMessage[]): Promise<AIResponse> {
    // Mock responses for offline/testing
    const userMessage = messages[messages.length - 1]?.content || '';
    const lowerMessage = userMessage.toLowerCase();

    let responseText = 'Привет! Я Светлана, твой помощник для зарядки! ';

    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
      responseText = 'Привет! Готов сделать зарядку сегодня? 😊';
    } else if (lowerMessage.includes('как дела')) {
      responseText = 'У меня всё отлично! А ты уже сделал зарядку?';
    } else if (lowerMessage.includes('зарядк')) {
      responseText = 'Зарядка - это здорово! Давай сделаем 10 минут упражнений вместе! 💪';
    } else if (lowerMessage.includes('устал') || lowerMessage.includes('больн')) {
      responseText = 'Если тебе больно или очень устал - лучше остановись и отдохни. Здоровье важнее!';
    } else if (lowerMessage.includes('деньг') || lowerMessage.includes('копилк')) {
      responseText = 'Отлично, что думаешь о деньгах! За каждую зарядку ты получаешь монетки. Копи их и учись управлять ими разумно! 🪙';
    } else if (lowerMessage.includes('спасиб')) {
      responseText = 'Пожалуйста! Ты молодец! Так держать! 🌟';
    } else {
      responseText = 'Интересный вопрос! А давай лучше сделаем зарядку? Это полезно и весело!';
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      text: responseText,
    };
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default instance with mock provider (for offline-first)
export const aiProvider = new AIProvider({
  provider: 'mock',
});

export default AIProvider;
