'use client';
import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();
    // Auto-resize textarea
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-2 px-3 py-3 bg-whatsapp-header border-t border-whatsapp-border flex-shrink-0">
      {/* Text input */}
      <div className="flex-1 bg-whatsapp-input rounded-2xl px-4 py-2.5 flex items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connecting…' : 'Type a message'}
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="flex-1 bg-transparent resize-none text-sm text-whatsapp-text-primary placeholder-whatsapp-text-muted focus:outline-none max-h-[120px] leading-relaxed disabled:opacity-50"
          style={{ height: 'auto' }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={`
          w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all
          ${canSend
            ? 'bg-whatsapp-teal hover:bg-whatsapp-dark text-white shadow-md'
            : 'bg-whatsapp-input text-whatsapp-text-muted cursor-not-allowed'
          }
        `}
      >
        <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
