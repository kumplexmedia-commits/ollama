export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'code' | 'text' | 'pdf' | 'json';
  content: string; // base64 or text content
  previewUrl?: string;
}

export interface ThoughtStep {
  stepNumber: number;
  title: string;
  detail: string;
  durationMs?: number;
  status: 'thinking' | 'done';
}

export interface WebSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'html' | 'svg' | 'markdown' | 'json' | 'chart';
  language?: string;
  content: string;
  createdAt: number;
}

export interface MessageVariant {
  content: string;
  reasoning?: {
    steps: ThoughtStep[];
    totalDurationMs: number;
  };
  artifacts?: Artifact[];
  sources?: WebSource[];
  timestamp: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  attachments?: Attachment[];
  reasoning?: {
    steps: ThoughtStep[];
    totalDurationMs: number;
    isThinking?: boolean;
  };
  artifacts?: Artifact[];
  sources?: WebSource[];
  isStreaming?: boolean;
  tokenCount?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    tokensPerSecond?: number;
  };
  variants?: MessageVariant[];
  currentVariantIndex?: number;
  feedback?: 'like' | 'dislike' | null;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  category: 'Coding' | 'Research' | 'Creative' | 'Productivity' | 'Math & Logic' | 'General';
  systemPrompt: string;
  temperature: number;
  topP: number;
  iconName: string;
  badge?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'ollama' | 'openai' | 'anthropic' | 'qhysync-local';
  size?: string;
  contextLength?: number;
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsTools: boolean;
  isAvailable: boolean;
  description?: string;
}

export interface AppSettings {
  provider: 'ollama' | 'openai' | 'anthropic' | 'qhysync-local';
  ollamaUrl: string;
  openaiKey?: string;
  anthropicKey?: string;
  selectedModel: string;
  personaId: string;
  enableReasoning: boolean;
  reasoningDepth: 'quick' | 'standard' | 'deep';
  enableWebSearch: boolean;
  enableTTS: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  theme: 'cyber' | 'dark' | 'slate' | 'oled' | 'light';
  fontSize: 'sm' | 'base' | 'lg';
  autoScroll: boolean;
  streamResponse: boolean;
  temperature: number;
  maxTokens: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
  personaId: string;
  tags: string[];
  pinned: boolean;
  archived?: boolean;
}

export interface AnalyticsData {
  totalChats: number;
  totalMessages: number;
  totalTokensUsed: number;
  avgTokensPerSec: number;
  modelUsageCount: Record<string, number>;
  favoritePersona: string;
}
