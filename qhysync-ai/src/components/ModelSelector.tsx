import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Check, Brain, Eye, Sparkles } from 'lucide-react';
import { ModelOption } from '../types';
import { DEFAULT_MODELS } from '../constants/models';
import { ollamaService } from '../services/ollamaService';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  ollamaUrl: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  ollamaUrl
}) => {
  const [models, setModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchOllamaModels = async () => {
    setIsRefreshing(true);
    ollamaService.setBaseUrl(ollamaUrl);
    const installed = await ollamaService.getInstalledModels();
    if (installed.length > 0) {
      // Merge installed with default models avoiding duplicates
      const nonOllamaDefaults = DEFAULT_MODELS.filter((m) => m.provider !== 'ollama');
      setModels([...nonOllamaDefaults, ...installed]);
    } else {
      setModels(DEFAULT_MODELS);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchOllamaModels();
  }, [ollamaUrl]);

  const activeModelObj = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate">{activeModelObj.name}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>{activeModelObj.provider}</span>
              {activeModelObj.size && <span>• {activeModelObj.size}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {activeModelObj.supportsReasoning && (
            <span title="Supports Deep Reasoning">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
            </span>
          )}
          {activeModelObj.supportsVision && (
            <span title="Supports Vision">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
            </span>
          )}
        </div>
      </button>

      {/* Model Selector Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl p-2 z-50 shadow-2xl space-y-1">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Intelligence Model
            </span>
            <button
              onClick={fetchOllamaModels}
              disabled={isRefreshing}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Ollama Local Models"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {models.map((m) => {
            const isSelected = m.id === selectedModel;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelectModel(m.id);
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl transition-all text-left flex items-start justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                    : 'hover:bg-slate-900 border border-transparent text-slate-300'
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="text-xs font-semibold flex items-center gap-1.5 truncate">
                    <span>{m.name}</span>
                    {m.provider === 'qhysync-local' && (
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">{m.description}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {m.provider}
                    </span>
                    {m.size && (
                      <span className="text-[9px] font-mono text-slate-500">{m.size}</span>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
