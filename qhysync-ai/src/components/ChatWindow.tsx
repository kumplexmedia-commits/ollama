import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Globe,
  Brain,
  Trash2,
  ArrowDown,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { AppSettings, Artifact, Attachment, ChatSession } from '../types';
import { MessageItem } from './MessageItem';
import { FileUpload } from './FileUpload';
import { PromptEnhancer } from './PromptEnhancer';
import { DEFAULT_PERSONAS } from '../constants/personas';

interface ChatWindowProps {
  session: ChatSession;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  onClearSession: () => void;
  onSelectArtifact: (artifact: Artifact) => void;
  onToggleFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  speechTranscript?: string;
  onSpeakText?: (text: string) => void;
  isSpeaking?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  settings,
  onUpdateSettings,
  onSendMessage,
  onStopGeneration,
  isGenerating,
  onClearSession,
  onSelectArtifact,
  onToggleFeedback,
  isListening,
  onStartListening,
  onStopListening,
  speechTranscript,
  onSpeakText,
  isSpeaking
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update input text if speech transcript changes
  useEffect(() => {
    if (speechTranscript) {
      setInputText(speechTranscript);
    }
  }, [speechTranscript]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [session.messages, isGenerating, settings.autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  const persona = DEFAULT_PERSONAS.find((p) => p.id === session.personaId) || DEFAULT_PERSONAS[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080d1a] relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            {persona.avatar || '⚡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">{session.title}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {persona.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
              Active Model: <span className="text-blue-400">{settings.selectedModel}</span>
            </p>
          </div>
        </div>

        {/* Toggles & Controls */}
        <div className="flex items-center gap-2">
          {/* Reasoning Toggle */}
          <button
            onClick={() => onUpdateSettings({ enableReasoning: !settings.enableReasoning })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              settings.enableReasoning
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Step-by-Step Deep Reasoning Mode"
          >
            <Brain className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Reasoning</span>
          </button>

          {/* Web Search Toggle */}
          <button
            onClick={() => onUpdateSettings({ enableWebSearch: !settings.enableWebSearch })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              settings.enableWebSearch
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Web Search Grounding"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Web Search</span>
          </button>

          {/* Clear Session */}
          <button
            onClick={onClearSession}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear Chat Messages"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto divide-y divide-slate-800/30"
      >
        {session.messages.length === 0 ? (
          /* Empty Session Welcome State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">
              {persona.avatar || '⚡'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                QhySync AI - {persona.name}
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {persona.description}
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              <button
                onClick={() => setInputText('Build a modern TypeScript & React dashboard component with live metrics')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all text-xs group"
              >
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1 group-hover:text-blue-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> React Component Architecture
                </div>
                <p className="text-slate-400">Build a modern React & Tailwind dashboard component with live metrics.</p>
              </button>

              <button
                onClick={() => setInputText('Explain quantum computing algorithms and step-by-step mathematical proofs')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all text-xs group"
              >
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1 group-hover:text-blue-400">
                  <Brain className="w-3.5 h-3.5 text-purple-400" /> Deep Chain of Thought
                </div>
                <p className="text-slate-400">Explain quantum computing algorithms and step-by-step mathematical proofs.</p>
              </button>
            </div>
          </div>
        ) : (
          session.messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              personaAvatar={persona.avatar}
              onSelectArtifact={onSelectArtifact}
              onToggleFeedback={onToggleFeedback}
              onSpeakText={onSpeakText}
              isSpeaking={isSpeaking}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-3 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all z-20 animate-bounce"
          title="Scroll to latest messages"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Input Console */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl z-10">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* File Attachments */}
          <FileUpload
            attachments={attachments}
            onAddAttachments={(newAtts) => setAttachments((prev) => [...prev, ...newAtts])}
            onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
          />

          {/* Textarea Box */}
          <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2 shadow-inner">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${persona.name}... (Press Shift+Enter for new line)`}
              rows={1}
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-44"
            />

            {/* Bottom Actions Bar inside Box */}
            <div className="flex items-center justify-between pt-1 px-2 border-t border-slate-800/50 mt-1">
              <div className="flex items-center gap-2">
                {/* Speech Microphone */}
                {onStartListening && (
                  <button
                    type="button"
                    onClick={isListening ? onStopListening : onStartListening}
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Stop Dictation' : 'Start Speech Dictation'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                {/* Prompt Enhancer */}
                <PromptEnhancer
                  currentPrompt={inputText}
                  onEnhanced={(enhanced) => setInputText(enhanced)}
                />
              </div>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={onStopGeneration}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() && attachments.length === 0}
                    className={`p-2.5 rounded-xl transition-all font-semibold flex items-center justify-center ${
                      !inputText.trim() && attachments.length === 0
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    }`}
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" /> Powered by QhySync Multi-Model AI Engine
            </span>
            <span className="hidden sm:inline">Ctrl+Enter to submit • Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
