import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Eye, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { Artifact } from '../types';

interface ArtifactsCanvasProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export const ArtifactsCanvas: React.FC<ArtifactsCanvasProps> = ({ artifact, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      html: 'html',
      svg: 'svg',
      typescript: 'ts',
      javascript: 'js',
      json: 'json',
      python: 'py',
      css: 'css'
    };
    const ext = extMap[artifact.language || ''] || 'txt';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qhysync-artifact-${artifact.id}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isPreviewable = artifact.type === 'html' || artifact.type === 'svg' || artifact.language === 'html';

  return (
    <div
      className={`fixed top-0 right-0 z-40 h-full border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl flex flex-col transition-all duration-300 shadow-2xl ${
        isFullscreen ? 'w-full left-0 z-50' : 'w-full md:w-[540px] lg:w-[620px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            {artifact.type === 'html' ? (
              <Eye className="w-4 h-4" />
            ) : artifact.type === 'code' ? (
              <Code className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{artifact.title}</h3>
            <span className="text-[11px] font-mono uppercase text-blue-400 font-semibold">
              {artifact.language || artifact.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isPreviewable && (
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 mr-2">
              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Preview
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
            title="Close Canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs">
        {viewMode === 'code' || !isPreviewable ? (
          <div className="relative rounded-xl border border-slate-800 bg-[#0d1117] p-4 overflow-x-auto text-slate-200 leading-relaxed shadow-inner">
            <pre className="whitespace-pre">{artifact.content}</pre>
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px] bg-white rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <iframe
              title="Artifact Live Preview"
              srcDoc={artifact.content}
              className="w-full h-full min-h-[450px] border-none"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/40 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>Artifact ID: {artifact.id}</span>
        <span>Size: {(artifact.content.length / 1024).toFixed(1)} KB</span>
      </div>
    </div>
  );
};
