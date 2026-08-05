import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppSettings,
  Artifact,
  Attachment,
  ChatSession,
  Message,
  MessageVariant,
  ThoughtStep,
  WebSource
} from '../types';
import { aiService } from '../services/aiService';
import { DEFAULT_PERSONAS } from '../constants/personas';

const STORAGE_KEY_SESSIONS = 'qhysync_chat_sessions_v1';
const STORAGE_KEY_SETTINGS = 'qhysync_app_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  selectedModel: 'qhysync-v2-reasoner',
  personaId: 'general-assistant',
  enableReasoning: true,
  reasoningDepth: 'standard',
  enableWebSearch: false,
  enableTTS: false,
  ttsVoice: '',
  ttsSpeed: 1,
  theme: 'cyber',
  fontSize: 'base',
  autoScroll: true,
  streamResponse: true,
  temperature: 0.7,
  maxTokens: 4096
};

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Workspace Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: DEFAULT_SETTINGS.selectedModel,
      personaId: DEFAULT_SETTINGS.personaId,
      tags: ['General'],
      pinned: false
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-initial';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [artifactsList, setArtifactsList] = useState<Artifact[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save chat sessions:', e);
    }
  }, [sessions]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save app settings:', e);
    }
  }, [settings]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const createNewSession = useCallback((personaId?: string) => {
    const selectedPersona = personaId || settings.personaId;
    const persona = DEFAULT_PERSONAS.find((p) => p.id === selectedPersona) || DEFAULT_PERSONAS[0];

    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: `${persona.name} Chat`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: settings.selectedModel,
      personaId: selectedPersona,
      tags: [persona.category],
      pinned: false
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveArtifact(null);
    setArtifactsList([]);
  }, [settings.personaId, settings.selectedModel]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const replacement: ChatSession = {
          id: 'session-' + Date.now(),
          title: 'New Workspace Session',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          model: settings.selectedModel,
          personaId: settings.personaId,
          tags: ['General'],
          pinned: false
        };
        setActiveSessionId(replacement.id);
        return [replacement];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeSessionId, settings.personaId, settings.selectedModel]);

  const clearSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, messages: [], updatedAt: Date.now() } : s))
    );
    setActiveArtifact(null);
    setArtifactsList([]);
  }, []);

  const togglePinSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, pinned: !s.pinned } : s))
    );
  }, []);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() } : s))
    );
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  /**
   * Send user message and stream response from AI Service
   */
  const sendMessage = useCallback(
    async (text: string, attachments: Attachment[] = []) => {
      if (!text.trim() && attachments.length === 0) return;
      if (isGenerating) return;

      const userMsgId = 'msg-user-' + Date.now();
      const assistantMsgId = 'msg-ast-' + (Date.now() + 1);

      const userMessage: Message = {
        id: userMsgId,
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const assistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: settings.selectedModel,
        isStreaming: true,
        reasoning: settings.enableReasoning
          ? { steps: [], totalDurationMs: 0, isThinking: true }
          : undefined,
        artifacts: [],
        sources: []
      };

      // Add user message & empty assistant placeholder to active session
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const updatedMessages = [...s.messages, userMessage, assistantMessage];
          const newTitle = s.messages.length === 0 ? text.slice(0, 36) + (text.length > 36 ? '...' : '') : s.title;
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: updatedMessages
          };
        })
      );

      setIsGenerating(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const persona = DEFAULT_PERSONAS.find((p) => p.id === activeSession.personaId) || DEFAULT_PERSONAS[0];

      // Prepare context messages
      const history = [...activeSession.messages, userMessage];

      await aiService.streamResponse(
        history,
        settings,
        persona.systemPrompt,
        {
          onReasoningStep: (step: ThoughtStep) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    const steps = m.reasoning?.steps || [];
                    const existingIndex = steps.findIndex((st) => st.stepNumber === step.stepNumber);
                    const updatedSteps = [...steps];
                    if (existingIndex >= 0) {
                      updatedSteps[existingIndex] = step;
                    } else {
                      updatedSteps.push(step);
                    }
                    return {
                      ...m,
                      reasoning: {
                        ...m.reasoning,
                        steps: updatedSteps,
                        totalDurationMs: (m.reasoning?.totalDurationMs || 0) + (step.durationMs || 200),
                        isThinking: true
                      }
                    };
                  })
                };
              })
            );
          },

          onChunk: (chunk: string) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    return {
                      ...m,
                      content: m.content + chunk,
                      reasoning: m.reasoning ? { ...m.reasoning, isThinking: false } : undefined
                    };
                  })
                };
              })
            );
          },

          onArtifactFound: (artifact: Artifact) => {
            setArtifactsList((prev) => {
              if (prev.some((a) => a.id === artifact.id)) return prev;
              return [artifact, ...prev];
            });
            setActiveArtifact(artifact);

            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    const existing = m.artifacts || [];
                    if (existing.some((a) => a.id === artifact.id)) return m;
                    return {
                      ...m,
                      artifacts: [...existing, artifact]
                    };
                  })
                };
              })
            );
          },

          onSourcesFound: (sources: WebSource[]) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    return { ...m, sources };
                  })
                };
              })
            );
          },

          onDone: (metrics) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    return {
                      ...m,
                      isStreaming: false,
                      tokenCount: {
                        promptTokens: Math.ceil(text.length / 4),
                        completionTokens: metrics.totalTokens,
                        totalTokens: Math.ceil(text.length / 4) + metrics.totalTokens,
                        tokensPerSecond: metrics.tokensPerSec
                      },
                      reasoning: m.reasoning ? { ...m.reasoning, isThinking: false } : undefined
                    };
                  })
                };
              })
            );
            setIsGenerating(false);
            abortControllerRef.current = null;
          },

          onError: (err) => {
            console.error('Chat stream error:', err);
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeSessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    return {
                      ...m,
                      content: m.content || `⚠️ Error: Could not connect to model (${err.message}). Please check server connection.`,
                      isStreaming: false
                    };
                  })
                };
              })
            );
            setIsGenerating(false);
            abortControllerRef.current = null;
          }
        },
        abortController.signal
      );
    },
    [activeSession, activeSessionId, isGenerating, settings]
  );

  const toggleFeedback = useCallback((messageId: string, feedbackType: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              feedback: m.feedback === feedbackType ? null : feedbackType
            };
          })
        };
      })
    );
  }, [activeSessionId]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    settings,
    updateSettings,
    isGenerating,
    activeArtifact,
    setActiveArtifact,
    artifactsList,
    createNewSession,
    deleteSession,
    clearSession,
    togglePinSession,
    renameSession,
    sendMessage,
    stopGeneration,
    toggleFeedback
  };
}
