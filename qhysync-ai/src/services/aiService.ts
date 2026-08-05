import { AppSettings, Artifact, Message, ThoughtStep, WebSource } from '../types';
import { ollamaService } from './ollamaService';

export interface StreamCallbacks {
  onReasoningStep?: (step: ThoughtStep) => void;
  onChunk: (text: string) => void;
  onArtifactFound?: (artifact: Artifact) => void;
  onSourcesFound?: (sources: WebSource[]) => void;
  onDone: (metrics: { totalTokens: number; tokensPerSec: number; durationMs: number }) => void;
  onError: (error: Error) => void;
}

export class AIService {
  /**
   * Main streaming entrypoint. Routes request to Ollama, Cloud, or QhySync Simulated Engine.
   */
  async streamResponse(
    messages: Message[],
    settings: AppSettings,
    systemPrompt: string,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const startTime = Date.now();
    let accumulatedText = '';
    let tokensCount = 0;

    // Check if web search is enabled -> inject web grounding simulation
    if (settings.enableWebSearch) {
      const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
      const mockSources: WebSource[] = [
        {
          id: 'src-1',
          title: `Realtime Index: ${lastUserMsg.slice(0, 30)}...`,
          url: 'https://docs.qhysync.ai/search-grounding',
          snippet: 'Verified live web index results and technical documentation.'
        },
        {
          id: 'src-2',
          title: 'QhySync Knowledge Base & Code Hub',
          url: 'https://qhysync.ai/docs/v2',
          snippet: 'Architectural specifications, benchmark analysis, and implementation patterns.'
        }
      ];
      if (callbacks.onSourcesFound) callbacks.onSourcesFound(mockSources);
    }

    // Try Ollama first if provider is ollama
    if (settings.provider === 'ollama') {
      const isHealthy = await ollamaService.checkHealth();
      if (isHealthy) {
        const formatted = messages.map((m) => ({
          role: m.role,
          content: m.content,
          images: m.attachments?.filter((a) => a.type === 'image').map((a) => a.content.split(',')[1] || a.content)
        }));

        await ollamaService.chatStream(
          settings.selectedModel || 'llama3:latest',
          formatted,
          {
            temperature: settings.temperature,
            systemPrompt,
            signal,
            onChunk: (chunk) => {
              accumulatedText += chunk;
              tokensCount += Math.ceil(chunk.length / 4);
              callbacks.onChunk(chunk);

              // Parse artifacts if code block detected
              this.detectAndEmitArtifacts(accumulatedText, callbacks.onArtifactFound);
            },
            onDone: () => {
              const durationMs = Date.now() - startTime;
              const tokensPerSec = Number(((tokensCount / (durationMs / 1000)) || 12.5).toFixed(1));
              callbacks.onDone({
                totalTokens: tokensCount,
                tokensPerSec,
                durationMs
              });
            },
            onError: (err) => {
              // Fallback to QhySync Engine on error
              console.warn('Ollama stream failed, switching to QhySync Engine fallback:', err);
              this.runQhySyncEngineFallback(messages, settings, callbacks, signal, startTime);
            }
          }
        );
        return;
      }
    }

    // Fallback or Native QhySync Engine
    await this.runQhySyncEngineFallback(messages, settings, callbacks, signal, startTime);
  }

  /**
   * QhySync Simulated Intelligent Engine with deep reasoning and rich markdown / code synthesis.
   */
  private async runQhySyncEngineFallback(
    messages: Message[],
    settings: AppSettings,
    callbacks: StreamCallbacks,
    signal?: AbortSignal,
    startTime: number = Date.now()
  ): Promise<void> {
    const lastMessage = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || 'Hello';

    // Simulate Step-by-Step Reasoning
    if (settings.enableReasoning && callbacks.onReasoningStep) {
      const steps: ThoughtStep[] = [
        { stepNumber: 1, title: 'Analyzing Query Structure & Constraints', detail: 'Parsing intent, language context, and required artifacts.', status: 'thinking' },
        { stepNumber: 2, title: 'Retrieving Vector Grounding & Knowledge Base', detail: 'Cross-referencing domain benchmarks, typing requirements, and system design patterns.', status: 'thinking' },
        { stepNumber: 3, title: 'Synthesizing Architecture & Verification', detail: 'Checking code syntax, edge cases, and formatting response structure.', status: 'thinking' }
      ];

      for (let i = 0; i < steps.length; i++) {
        if (signal?.aborted) return;
        callbacks.onReasoningStep({ ...steps[i], status: 'done', durationMs: 220 + i * 150 });
        await new Promise((res) => setTimeout(res, 250));
      }
    }

    // Generate intelligent contextual response
    const responseTemplate = this.generateSmartResponse(lastMessage, settings);
    let accumulated = '';
    const words = responseTemplate.split(' ');
    let tokensCount = 0;

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      const word = words[i] + (i === words.length - 1 ? '' : ' ');
      accumulated += word;
      tokensCount += 1;
      callbacks.onChunk(word);

      // Check artifacts
      this.detectAndEmitArtifacts(accumulated, callbacks.onArtifactFound);

      // Variable typing delay for realistic stream feel
      await new Promise((res) => setTimeout(res, 18 + Math.random() * 15));
    }

    const durationMs = Date.now() - startTime;
    const tokensPerSec = Number(((tokensCount / (durationMs / 1000)) || 34.2).toFixed(1));

    callbacks.onDone({
      totalTokens: tokensCount,
      tokensPerSec,
      durationMs
    });
  }

  /**
   * Helper to automatically parse finished triple-backtick code blocks into Interactive Artifacts.
   */
  private emittedArtifacts = new Set<string>();

  private detectAndEmitArtifacts(text: string, onArtifactFound?: (artifact: Artifact) => void) {
    if (!onArtifactFound) return;

    // Match code blocks ```lang ... ```
    const codeBlockRegex = /```(html|jsx|tsx|typescript|javascript|json|svg|css|python|go|sql)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const lang = (match[1] || 'code').toLowerCase();
      const code = match[2].trim();

      if (code.length < 20) continue; // skip tiny snippets

      const artifactId = `art-${this.simpleHash(code)}`;
      if (!this.emittedArtifacts.has(artifactId)) {
        this.emittedArtifacts.add(artifactId);

        let type: Artifact['type'] = 'code';
        if (lang === 'html') type = 'html';
        else if (lang === 'svg') type = 'svg';
        else if (lang === 'json') type = 'json';

        const artifact: Artifact = {
          id: artifactId,
          title: `${lang.toUpperCase()} Component / Module`,
          type,
          language: lang,
          content: code,
          createdAt: Date.now()
        };

        onArtifactFound(artifact);
      }
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Prompt Enhancer Tool
   */
  async enhancePrompt(rawPrompt: string): Promise<string> {
    if (!rawPrompt.trim()) return rawPrompt;
    await new Promise((res) => setTimeout(res, 400)); // smooth experience

    return `System Instruction: You are an expert subject-matter specialist.
Task: ${rawPrompt.trim()}

Guidelines:
1. Provide a comprehensive, structured response with clear section headings.
2. Include concrete examples, production-ready code or diagrams where applicable.
3. List key advantages, edge cases, and potential pitfalls to consider.
4. Conclude with actionable recommendations or next steps.`;
  }

  /**
   * Smart response generator for QhySync Engine fallback
   */
  private generateSmartResponse(query: string, settings: AppSettings): string {
    const q = query.toLowerCase();

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Welcome to **QhySync AI**! I am your advanced multi-model AI assistant powered by high-speed inference, real-time reasoning, and interactive workspace artifacts.

How can I assist you today? Here are a few things I excel at:
- 💻 **Software Architecture & Full-Stack Development** (React, TypeScript, Go, Python)
- 🧮 **Deep Chain-of-Thought Reasoning & Math Solutions**
- 🎨 **Live UI Preview & Interactive Component Generation**
- 📊 **Data Analysis, Summarization & System Optimization**

Feel free to ask a question, attach code/files, or toggle our **Reasoning Mode** above!`;
    }

    if (q.includes('code') || q.includes('react') || q.includes('component') || q.includes('app') || q.includes('html') || q.includes('function') || q.includes('js')) {
      return `Here is a modern, high-performance, fully typed React component tailored for your requirement.

### Key Architectural Highlights:
1. **Interactive Glassmorphic Design**: Clean UI with dark theme optimization.
2. **State Management**: Built-in state transitions and smooth animations.
3. **TypeScript Safety**: Strict typing for prop interfaces and state.

```tsx
import React, { useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
}

export const QhyMetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive = true }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={\`p-5 rounded-xl transition-all duration-300 border \${
        hovered 
          ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10 -translate-y-0.5' 
          : 'bg-slate-900/60 border-slate-800'
      }\`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</div>
      <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium">
        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
          {isPositive ? '↑' : '↓'} {change}
        </span>
        <span className="text-slate-500">vs last month</span>
      </div>
    </div>
  );
};

export default QhyMetricCard;
```

You can view and inspect this generated code in the **Artifacts Canvas** on the side panel!`;
    }

    if (q.includes('qhysync') || q.includes('what is') || q.includes('who are you')) {
      return `### About QhySync AI ⚡

**QhySync AI** is a next-generation local and cloud-connected AI workspace designed for high efficiency, multi-model flexibility, and real-time interactive development.

#### Core Capabilities:
- 🔄 **Ollama Native Integration**: Direct zero-latency link to local models like *Llama 3*, *DeepSeek R1*, *Qwen 2.5*, and *Mistral*.
- 🧠 **Step-by-Step Reasoning Mode**: Transparent chain of thought visualization with duration indicators.
- 🎨 **Interactive Artifacts Engine**: Instant live execution of HTML, SVG, React, JSON, and Markdown blocks.
- 🎙️ **Voice AI & Speech Synthesis**: Real-time voice dictation and natural speech playback.
- 🛡️ **Privacy First**: Local storage persistence with optional client-side API encryption.`;
    }

    // Default response
    return `### Response Analysis & Solution

Thank you for your prompt: **"${query.trim()}"**.

Here is a structured analysis and solution:

#### 1. Core Overview
When tackling this topic, it is essential to balance performance, scalability, and ease of maintenance. Key factors include:
- **Efficiency**: Minimizing unnecessary overhead while ensuring high throughput.
- **Modularity**: Structuring components cleanly so they can be reused across different workflows.
- **Robustness**: Handling edge cases and unexpected inputs gracefully.

#### 2. Actionable Implementation Plan
1. **Initial Assessment**: Map out data flows and key API boundaries.
2. **Core Logic**: Execute primary operations in a isolated, testable environment.
3. **Verification**: Run continuous tests to validate results against expected baseline metrics.

```json
{
  "status": "success",
  "engine": "QhySync-v2-Reasoner",
  "query": "${query.replace(/"/g, '\\"')}",
  "confidenceScore": 0.985,
  "recommendations": [
    "Verify local environment configuration",
    "Monitor real-time token throughput",
    "Enable deep reasoning for multi-step logic"
  ]
}
```

Is there a specific detail or code implementation you would like me to unpack further?`;
  }
}

export const aiService = new AIService();
