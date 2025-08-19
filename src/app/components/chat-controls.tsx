'use client';

import React from 'react';

interface ChatControlsProps {
  onClearChat: () => void;
  onSuggestedPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const suggestedPrompts = [
  "Hello everyone! How are you all doing today?",
  "What should I focus on this week?",
  "I'm feeling stressed about work. Any advice?",
  "Tell me about my relationship patterns",
  "How can I be more confident?",
  "What are my biggest strengths?",
  "I need help making a big decision",
  "How do you all work together in my chart?"
];

export default function ChatControls({ 
  onClearChat, 
  onSuggestedPrompt, 
  disabled = false 
}: ChatControlsProps) {
  return (
    <div className="border-t border-white/20 p-4 bg-black/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">Suggested Prompts</h4>
        <button
          onClick={onClearChat}
          disabled={disabled}
          className="
            text-xs px-3 py-1 
            bg-red-500/20 hover:bg-red-500/30 
            border border-red-500/30 rounded-md
            text-red-300 hover:text-red-200
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          Clear Chat
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestedPrompts.slice(0, 6).map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSuggestedPrompt(prompt)}
            disabled={disabled}
            className="
              text-left text-xs p-2 
              bg-white/5 hover:bg-white/10 
              border border-white/10 hover:border-white/20 rounded-md
              text-gray-300 hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              truncate
            "
            title={prompt}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}