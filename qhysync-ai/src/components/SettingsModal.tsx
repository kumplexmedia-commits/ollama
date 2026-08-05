import React, { useState } from 'react';
import { X, Settings, Server, Key, Palette, Sliders, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'provider' | 'theme'>('general');

  const themes: { id: AppSettings['theme']; label: string; bg: string }[] = [
    { id: 'cyber', label: 'Cyber Dark', bg: 'bg-[#080d1a]' },
    { id: 'dark', label: 'Midnight Slate', bg: 'bg-[#0f172a]' },
    { id: 'oled', label: 'True OLED Black', bg: 'bg-[#000000]' },
    { id: 'slate', label: 'Deep Blue', bg: 'bg-[#0a192f]' },
    { id: 'light', label: 'Clean Light', bg: 'bg-[#f8fafc]' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">QhySync Workspace Settings</h2>
              <p className="text-xs text-slate-400">Configure models, endpoints, generation & UI parameters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'provider'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Ollama & Endpoints
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'theme'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Theme & UI
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6 space-y-5 text-xs text-slate-200">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Temperature Slider */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white">Temperature ({settings.temperature})</label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {settings.temperature < 0.3 ? 'Precise / Code' : settings.temperature > 0.8 ? 'Creative' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Auto Scroll */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-bold text-white">Auto Scroll Stream</div>
                  <div className="text-[11px] text-slate-400">Automatically scroll down as new tokens arrive</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) => onUpdateSettings({ autoScroll: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </div>

              {/* Reasoning Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-bold text-white">Enable Deep Reasoning Steps</div>
                  <div className="text-[11px] text-slate-400">Show step-by-step thinking breakdown before final answer</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableReasoning}
                  onChange={(e) => onUpdateSettings({ enableReasoning: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </div>
            </div>
          )}

          {activeTab === 'provider' && (
            <div className="space-y-4">
              {/* Provider Selector */}
              <div className="space-y-2">
                <label className="font-bold text-white">Active AI Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ollama', 'qhysync-local', 'openai'] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => onUpdateSettings({ provider: prov })}
                      className={`p-3 rounded-xl border text-center font-bold capitalize transition-all ${
                        settings.provider === prov
                          ? 'bg-blue-600/20 border-blue-500/80 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {prov.replace('-local', ' Local')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ollama Server Endpoint */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" /> Ollama Server URL
                </label>
                <input
                  type="text"
                  value={settings.ollamaUrl}
                  onChange={(e) => onUpdateSettings({ ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400">Default local instance running on port 11434</p>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" /> OpenAI API Key (Optional)
                </label>
                <input
                  type="password"
                  value={settings.openaiKey || ''}
                  onChange={(e) => onUpdateSettings({ openaiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <label className="font-bold text-white">Select UI Theme</label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => {
                  const isSelected = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id })}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/40 text-white shadow-lg'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg ${t.bg} border border-slate-700`} />
                        <span className="font-bold text-xs">{t.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
