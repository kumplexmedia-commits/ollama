import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Code2,
  ExternalLink,
  Bot,
  User,
  Gauge
} from 'lucide-react';
import { Artifact, Message } from '../types';
import { ThoughtProcess } from './ThoughtProcess';

interface MessageItemProps {
  message: Message;
  personaAvatar?: string;
  onSelectArtifact?: (artifact: Artifact) => void;
  onToggleFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  onSpeakText?: (text: string) => void;
  isSpeaking?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  personaAvatar = '⚡',
  onSelectArtifact,
  onToggleFeedback,
  onSpeakText,
  isSpeaking
}) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group px-4 py-5 md:px-6 transition-colors border-b border-slate-800/40 ${
        isUser ? 'bg-transparent' : 'bg-slate-900/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md border ${
            isUser
              ? 'bg-blue-600 border-blue-400/30 text-white'
              : 'bg-slate-800 border-slate-700/80 text-blue-400'
          }`}
        >
          {isUser ? <User className="w-4 h-4 text-white" /> : personaAvatar || <Bot className="w-4 h-4" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {isUser ? 'You' : 'QhySync AI'}
              </span>
              {message.model && !isUser && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {message.model}
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-200"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <Code2 className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thought Process (Reasoning Steps) */}
          {message.reasoning && (
            <ThoughtProcess
              steps={message.reasoning.steps}
              totalDurationMs={message.reasoning.totalDurationMs}
              isThinking={message.reasoning.isThinking}
            />
          )}

          {/* Sources Grounding */}
          {message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 w-full uppercase tracking-wider">
                Web Grounding Sources
              </span>
              {message.sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-blue-300 transition-colors border border-slate-700/60"
                >
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[180px] font-medium">{src.title}</span>
                </a>
              ))}
            </div>
          )}

          {/* Text Message Content */}
          <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse rounded-sm vertical-middle" />
            )}
          </div>

          {/* Artifacts Chips */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {message.artifacts.map((art) => (
                <button
                  key={art.id}
                  onClick={() => onSelectArtifact && onSelectArtifact(art)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-all shadow-sm group/art"
                >
                  <Code2 className="w-4 h-4 text-blue-400 group-hover/art:scale-110 transition-transform" />
                  <span>View Artifact: {art.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer Action Bar */}
          {!message.isStreaming && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Copy message"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {!isUser && onSpeakText && (
                  <button
                    onClick={() => onSpeakText(message.content)}
                    className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Read Aloud"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {!isUser && onToggleFeedback && (
                  <>
                    <button
                      onClick={() => onToggleFeedback(message.id, 'like')}
                      className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                        message.feedback === 'like' ? 'text-emerald-400' : 'hover:text-slate-200'
                      }`}
                      title="Good Response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleFeedback(message.id, 'dislike')}
                      className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                        message.feedback === 'dislike' ? 'text-rose-400' : 'hover:text-slate-200'
                      }`}
                      title="Bad Response"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Tokens & Inference Speed */}
              {message.tokenCount && (
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  <span>{message.tokenCount.tokensPerSecond || 0} t/s</span>
                  <span>•</span>
                  <span>{message.tokenCount.totalTokens} tokens</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
