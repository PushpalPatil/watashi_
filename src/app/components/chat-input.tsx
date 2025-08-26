'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask your planets anything or just say hello..."
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Refocus the textarea after sending message with a slight delay
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Refocus when transitioning from disabled to enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/20 p-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full px-3 py-2 
              bg-white/5 border border-white/20 rounded-lg
              text-amber-50/85 placeholder-gray-400
              resize-none overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-32
            "
            style={{ minHeight: '40px' }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="
            px-4 py-2 
            bg-white/10 hover:bg-white/20 
            border border-white/20 rounded-lg
            text-amber-50/85 font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-white/10
            transition-colors duration-200
            flex items-center justify-center
            min-w-[60px]
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <div className="text-xs text-amber-50/50 font-thin mt-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
}