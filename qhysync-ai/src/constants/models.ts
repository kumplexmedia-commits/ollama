import { ModelOption } from '../types';

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'qhysync-v2-reasoner',
    name: 'QhySync v2 Ultra Reasoner',
    provider: 'qhysync-local',
    size: '14B',
    contextLength: 32768,
    supportsVision: true,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'High-performance built-in neural simulation engine with deep chain-of-thought reasoning & instant code synthesis.'
  },
  {
    id: 'llama3:latest',
    name: 'Llama 3 (Ollama Local)',
    provider: 'ollama',
    size: '8B',
    contextLength: 8192,
    supportsVision: false,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'Meta\'s state-of-the-art local open model served directly via Ollama instance.'
  },
  {
    id: 'deepseek-r1:latest',
    name: 'DeepSeek R1 (Ollama Local)',
    provider: 'ollama',
    size: '14B',
    contextLength: 64000,
    supportsVision: false,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'State-of-the-art reasoning model with visible internal chain of thought step-by-step.'
  },
  {
    id: 'qwen2.5:latest',
    name: 'Qwen 2.5 (Ollama Local)',
    provider: 'ollama',
    size: '7B / 14B',
    contextLength: 32768,
    supportsVision: true,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'Alibaba Cloud\'s multilingual and code-heavy open weights model family.'
  },
  {
    id: 'mistral:latest',
    name: 'Mistral 7B (Ollama Local)',
    provider: 'ollama',
    size: '7B',
    contextLength: 32768,
    supportsVision: false,
    supportsReasoning: false,
    supportsTools: true,
    isAvailable: true,
    description: 'Fast, efficient, general-purpose open source model.'
  },
  {
    id: 'codellama:latest',
    name: 'CodeLlama (Ollama Local)',
    provider: 'ollama',
    size: '7B / 13B',
    contextLength: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsTools: false,
    isAvailable: true,
    description: 'Specialized for software development, refactoring, and code debugging.'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (OpenAI API)',
    provider: 'openai',
    size: 'Cloud',
    contextLength: 128000,
    supportsVision: true,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'OpenAI\'s flagship multimodal intelligence engine.'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet (Anthropic)',
    provider: 'anthropic',
    size: 'Cloud',
    contextLength: 200000,
    supportsVision: true,
    supportsReasoning: true,
    supportsTools: true,
    isAvailable: true,
    description: 'Industry benchmark for coding, creative writing, and nuanced reasoning.'
  }
];
