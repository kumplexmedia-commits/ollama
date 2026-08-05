import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { ThoughtStep } from '../types';

interface ThoughtProcessProps {
  steps: ThoughtStep[];
  totalDurationMs?: number;
  isThinking?: boolean;
}

export const ThoughtProcess: React.FC<ThoughtProcessProps> = ({
  steps,
  totalDurationMs,
  isThinking
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-3 rounded-xl border border-blue-500/20 bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-blue-950/30 hover:bg-blue-900/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Brain className={`w-4 h-4 ${isThinking ? 'animate-pulse text-blue-300' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Chain of Thought Reasoning
            </span>
            <span className="ml-2 text-xs text-slate-400">
              ({steps.length} {steps.length === 1 ? 'step' : 'steps'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalDurationMs && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400/90 bg-blue-500/10 px-2.5 py-1 rounded-md">
              <Clock className="w-3 h-3" />
              <span>{(totalDurationMs / 1000).toFixed(2)}s</span>
            </div>
          )}
          <div className="text-slate-400 hover:text-slate-200">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 space-y-2.5 border-t border-blue-500/10 bg-slate-950/40">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs"
            >
              <div className="mt-0.5 shrink-0">
                {step.status === 'thinking' ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>
                    Step {step.stepNumber}: {step.title}
                  </span>
                  {step.durationMs && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {step.durationMs}ms
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mt-1 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
