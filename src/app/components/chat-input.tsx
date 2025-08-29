'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
// takes these props : onSend, disabled, placeholder
// uses useState to manage the input text value
// uses useRef to reference the textarea element

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask your planets anything or just say hello..."
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // prevent default form submission behavior
  // check if input has content, and component isn't disabled
  // 
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
    <form
      onSubmit={handleSubmit}
      className="w-full border-t border-white/20 p-3 pb-safe overscroll-contain"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Prevent automatic scrolling on mobile
              e.preventDefault();
              // Force scroll to top to prevent unwanted movement
              window.scrollTo(0, 0);
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full px-3 py-2 
              bg-white/10 border border-white/20 rounded-lg 
              text-amber-50/80  text-sm font-light leading-6 tracking-normal placeholder:text-amber-50/70 placeholder:font-thin placeholder:text-sm placeholder:opacity-70
              resize-none overflow-auto
              focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-30 
            "
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="
            px-4 py-2 
            bg-white/10 hover:bg-white/20 
            border border-white/20 rounded-lg
            text-amber-50/85 font-light
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-white/10
            transition-colors duration-200
            flex items-center justify-center
            min-w-[60px] h-10
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
      <div className="text-xs opacity-70 text-amber-50/50 font-thin mt-1 ml-0.5">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
}