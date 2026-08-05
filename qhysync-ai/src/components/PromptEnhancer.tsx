import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';

interface PromptEnhancerProps {
  currentPrompt: string;
  onEnhanced: (enhancedText: string) => void;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  currentPrompt,
  onEnhanced
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!currentPrompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const result = await aiService.enhancePrompt(currentPrompt);
      onEnhanced(result);
    } catch (e) {
      console.error('Enhance prompt failed:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnhance}
      disabled={!currentPrompt.trim() || isEnhancing}
      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium ${
        !currentPrompt.trim() || isEnhancing
          ? 'text-slate-600 cursor-not-allowed'
          : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40 border border-purple-500/20'
      }`}
      title="Enhance Prompt with AI Prompt Engineering"
    >
      {isEnhancing ? (
        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
      ) : (
        <Wand2 className="w-4 h-4 text-purple-400" />
      )}
      <span className="hidden sm:inline">Enhance</span>
    </button>
  );
};
