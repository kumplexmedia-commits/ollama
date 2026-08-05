import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Settings,
  Sparkles,
  BarChart3,
  Search,
  Download,
  Zap,
  ChevronLeft,
  ChevronRight,
  Code2
} from 'lucide-react';
import { AppSettings, Artifact, ChatSession } from '../types';
import { ModelSelector } from './ModelSelector';
import { DEFAULT_PERSONAS } from '../constants/personas';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onOpenPersonas: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  artifactsList: Artifact[];
  onSelectArtifact: (art: Artifact) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  settings,
  onUpdateSettings,
  onOpenPersonas,
  onOpenSettings,
  onOpenAnalytics,
  artifactsList,
  onSelectArtifact
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const recentSessions = filteredSessions.filter((s) => !s.pinned);

  const activePersona = DEFAULT_PERSONAS.find((p) => p.id === settings.personaId) || DEFAULT_PERSONAS[0];

  const handleExportChat = (session: ChatSession) => {
    const markdown = session.messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'QhySync AI'}\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qhysync-chat-${session.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-[#050811] border-r border-slate-800/80 flex flex-col items-center py-4 space-y-6 z-30 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-xl bg-slate-900 text-blue-400 hover:bg-slate-800 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onNewSession}
          className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
          title="New Chat Session"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenPersonas}
          className="p-3 rounded-2xl bg-slate-900 text-purple-400 border border-slate-800 hover:bg-slate-800 transition-all"
          title="AI Personas"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenAnalytics}
          className="p-3 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800 hover:bg-slate-800 transition-all"
          title="Telemetry Analytics"
        >
          <BarChart3 className="w-5 h-5" />
        </button>

        <div className="mt-auto">
          <button
            onClick={onOpenSettings}
            className="p-3 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 md:w-80 h-full bg-[#050811] border-r border-slate-800/80 flex flex-col z-30 shrink-0 transition-all">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/20">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1">
              QhySync <span className="text-blue-400 font-mono text-xs">AI</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400">v2.4 Ultra Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace Chat</span>
        </button>
      </div>

      {/* Model Selector */}
      <div className="px-3 py-1">
        <ModelSelector
          selectedModel={settings.selectedModel}
          onSelectModel={(m) => onUpdateSettings({ selectedModel: m })}
          ollamaUrl={settings.ollamaUrl}
        />
      </div>

      {/* Persona Switcher Card */}
      <div className="px-3 py-2">
        <button
          onClick={onOpenPersonas}
          className="w-full p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{activePersona.avatar}</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-purple-200 group-hover:text-purple-100 truncate">
                {activePersona.name}
              </div>
              <p className="text-[10px] text-purple-400/80 truncate">{activePersona.tagline}</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chat history..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80"
          />
        </div>
      </div>

      {/* Sessions History List */}
      <div className="flex-1 overflow-auto px-3 space-y-4 py-2">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-1">
              <Pin className="w-3 h-3 text-amber-400" /> Pinned
            </div>
            {pinnedSessions.map((s) => (
              <SidebarSessionItem
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onSelect={() => onSelectSession(s.id)}
                onDelete={() => onDeleteSession(s.id)}
                onTogglePin={() => onTogglePinSession(s.id)}
                onExport={() => handleExportChat(s)}
              />
            ))}
          </div>
        )}

        {/* Recent Sessions */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
            Recent Chats
          </div>
          {recentSessions.length === 0 ? (
            <div className="text-xs text-slate-500 px-2 py-4 text-center">
              No conversations found.
            </div>
          ) : (
            recentSessions.map((s) => (
              <SidebarSessionItem
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onSelect={() => onSelectSession(s.id)}
                onDelete={() => onDeleteSession(s.id)}
                onTogglePin={() => onTogglePinSession(s.id)}
                onExport={() => handleExportChat(s)}
              />
            ))
          )}
        </div>

        {/* Active Artifacts List */}
        {artifactsList.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-1">
              <Code2 className="w-3 h-3 text-blue-400" /> Session Artifacts
            </div>
            {artifactsList.slice(0, 5).map((art) => (
              <button
                key={art.id}
                onClick={() => onSelectArtifact(art)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-left flex items-center justify-between text-blue-300 hover:bg-slate-900 transition-colors truncate"
              >
                <span className="truncate">{art.title}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-blue-950 text-blue-400 font-bold">
                  {art.language || art.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <button
          onClick={onOpenAnalytics}
          className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
          title="Telemetry Analytics"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface SidebarSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onExport: () => void;
}

const SidebarSessionItem: React.FC<SidebarSessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onExport
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
        isActive
          ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-sm'
          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        <span className="text-xs font-semibold truncate">{session.title}</span>
      </div>

      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="p-1 rounded hover:text-amber-400 transition-colors"
          title="Pin Chat"
        >
          <Pin className={`w-3 h-3 ${session.pinned ? 'text-amber-400 fill-amber-400' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="p-1 rounded hover:text-blue-400 transition-colors"
          title="Export Markdown"
        >
          <Download className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:text-rose-400 transition-colors"
          title="Delete Session"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
