import React, { useState } from 'react';
import { X, Check, Sparkles, Plus, Zap, Code, Microscope, Palette, TrendingUp, Calculator } from 'lucide-react';
import { Persona } from '../types';
import { DEFAULT_PERSONAS } from '../constants/personas';

interface PersonasModalProps {
  activePersonaId: string;
  onSelectPersona: (personaId: string) => void;
  onClose: () => void;
}

export const PersonasModal: React.FC<PersonasModalProps> = ({
  activePersonaId,
  onSelectPersona,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Coding', 'Research', 'Creative', 'Productivity', 'Math & Logic', 'General'];

  const filtered = selectedCategory === 'All'
    ? DEFAULT_PERSONAS
    : DEFAULT_PERSONAS.filter((p) => p.category === selectedCategory);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code className="w-4 h-4 text-emerald-400" />;
      case 'Microscope': return <Microscope className="w-4 h-4 text-blue-400" />;
      case 'Palette': return <Palette className="w-4 h-4 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'Calculator': return <Calculator className="w-4 h-4 text-cyan-400" />;
      default: return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">AI System Personas & Agents</h2>
              <p className="text-xs text-slate-400">Choose specialized expert personas to optimize prompt responses</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Personas Grid */}
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const isSelected = p.id === activePersonaId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPersona(p.id);
                  onClose();
                }}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                        {p.avatar}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">{p.category}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-blue-500 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-300 mb-2">{p.tagline}</p>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Temp: {p.temperature}</span>
                  {p.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {p.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {DEFAULT_PERSONAS.length} Expert Personas Installed
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
