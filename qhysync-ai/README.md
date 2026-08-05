# ⚡ QhySync AI - Advanced Multi-Model AI Assistant & Workspace

**QhySync AI** is a next-generation, high-performance, local & cloud AI chat application engineered with TypeScript, React 18, Vite, and Tailwind CSS. It features native Ollama local model integration, deep step-by-step chain of thought reasoning, interactive workspace artifacts, multimodal file attachments, web search grounding, and smart voice capabilities.

---

## ✨ Features

- 🧠 **Step-by-Step Chain-of-Thought Reasoning**: Visible internal thinking breakdown with step-by-step timing and progress indicators.
- 🔄 **Native Ollama Local Model Integration**: Direct connection to local models like `Llama 3`, `DeepSeek R1`, `Qwen 2.5`, `Mistral`, `CodeLlama`, with dynamic model discovery.
- 🎨 **Interactive Workspace Artifacts Canvas**:
  - Live HTML/SVG Sandbox Preview
  - Syntax Highlighting with Line Numbers
  - Instant Code Copying & Download
- 🎙️ **Voice Intelligence**: Hands-free Speech-to-Text dictation and Text-to-Speech natural playback.
- 🎭 **Expert Persona & AI Agents Hub**: Pre-configured system prompts for Full-Stack Architecture, Deep Research, UI/UX Design, Executive Strategy, Math & Logic.
- 🌐 **Web Search & Grounding**: Simulated live search synthesis with citations and references.
- 🪄 **Magic Prompt Enhancer**: Transforms brief user inputs into engineered, structured system prompts.
- 📊 **Real-time Telemetry & Speed Metrics**: Tokens per second (`t/s`), token usage tracking, and latency score.
- 📁 **Multimodal Attachments**: Drag & drop code files, JSON, text, and images.
- 🌗 **Custom Themes**: Cyber Dark, Midnight Slate, True OLED, Deep Blue, and Clean Light.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- (Optional) [Ollama](https://ollama.com/) running locally on `http://localhost:11434`

### Installation & Launch

```bash
# Navigate to qhysync-ai directory
cd qhysync-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🛠️ Build for Production

```bash
npm run build
```

This compiles optimized production bundle files in `qhysync-ai/dist`.

---

## ⚡ QhySync AI Architecture

```
qhysync-ai/
├── src/
│   ├── components/       # ChatWindow, ArtifactsCanvas, ThoughtProcess, Sidebar, Modals
│   ├── constants/        # Personas, Model Definitions
│   ├── hooks/            # useChat, useSpeech, useTheme
│   ├── services/         # aiService, ollamaService
│   ├── types.ts          # Core TypeScript Interfaces
│   ├── App.tsx           # Main Workspace Layout
│   └── main.tsx          # Application Entry Point
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

License: MIT
