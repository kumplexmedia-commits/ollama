import React, { useRef } from 'react';
import { Paperclip, Image as ImageIcon, FileCode, FileText, X } from 'lucide-react';
import { Attachment } from '../types';

interface FileUploadProps {
  attachments: Attachment[];
  onAddAttachments: (attachments: Attachment[]) => void;
  onRemoveAttachment: (id: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      const isImage = file.type.startsWith('image/');
      let attachmentType: Attachment['type'] = 'text';

      if (isImage) attachmentType = 'image';
      else if (file.name.endsWith('.json')) attachmentType = 'json';
      else if (file.name.match(/\.(ts|tsx|js|jsx|py|go|html|css|cpp|c|rs)$/)) attachmentType = 'code';

      reader.onload = () => {
        const result = reader.result as string;
        newAttachments.push({
          id: 'att-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: attachmentType,
          content: result,
          previewUrl: isImage ? result : undefined
        });

        if (newAttachments.length === files.length) {
          onAddAttachments(newAttachments);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.go,.css,.html"
      />

      {/* Attachments Chips Bar */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 mb-2 bg-slate-900/60 rounded-xl border border-slate-800">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200"
            >
              {att.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              ) : att.type === 'code' ? (
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-medium truncate max-w-[140px]">{att.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({(att.size / 1024).toFixed(0)}KB)
              </span>
              <button
                onClick={() => onRemoveAttachment(att.id)}
                className="p-0.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        title="Attach File or Image"
      >
        <Paperclip className="w-4 h-4" />
      </button>
    </div>
  );
};
