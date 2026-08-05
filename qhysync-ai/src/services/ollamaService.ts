import { ModelOption } from '../types';

export interface OllamaModelItem {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getInstalledModels(): Promise<ModelOption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      const data = await response.json();
      const models: OllamaModelItem[] = data.models || [];

      return models.map((m) => {
        const sizeGb = (m.size / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
        const isDeepSeek = m.name.toLowerCase().includes('deepseek');
        const isCode = m.name.toLowerCase().includes('code');

        return {
          id: m.name,
          name: `${m.name} (${m.details?.parameter_size || sizeGb})`,
          provider: 'ollama',
          size: m.details?.parameter_size || sizeGb,
          contextLength: 16384,
          supportsVision: m.name.toLowerCase().includes('vision') || m.name.toLowerCase().includes('llava'),
          supportsReasoning: isDeepSeek || m.name.toLowerCase().includes('llama3') || m.name.toLowerCase().includes('qwen'),
          supportsTools: true,
          isAvailable: true,
          description: `Installed Ollama local model (${m.details?.quantization_level || 'quantized'}).`
        };
      });
    } catch (e) {
      console.warn('Could not fetch Ollama local models:', e);
      return [];
    }
  }

  async chatStream(
    model: string,
    messages: { role: string; content: string; images?: string[] }[],
    options: {
      temperature?: number;
      systemPrompt?: string;
      onChunk: (chunk: string) => void;
      onDone?: () => void;
      onError?: (err: Error) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const formattedMessages = [];
    if (options.systemPrompt) {
      formattedMessages.push({ role: 'system', content: options.systemPrompt });
    }
    formattedMessages.push(...messages);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: options.signal,
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: true,
          options: {
            temperature: options.temperature ?? 0.7,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error (${response.status}): ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body stream unreadable');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              options.onChunk(parsed.message.content);
            }
          } catch {
            // Ignore partial lines
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.message?.content) {
            options.onChunk(parsed.message.content);
          }
        } catch {
          // ignore
        }
      }

      if (options.onDone) options.onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (options.onDone) options.onDone();
        return;
      }
      if (options.onError) options.onError(err);
      else throw err;
    }
  }
}

export const ollamaService = new OllamaService();
