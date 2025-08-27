'use client';

import React from 'react';

export interface ChatMessage {
  id: string;
  sender: string; // 'user' or planet name like 'sun', 'moon', etc.
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
  planetInfo?: {
    icon: string;
    colors: {
      primary: string;
      secondary: string;
    };
    sign?: string;
  };
}

export default function ChatMessageComponent({ message, planetInfo }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isTyping = message.isTyping;

  const getPlanetDisplayName = (sender: string) => {
    if (sender === 'user') return 'You';
    if (sender === 'system') return 'System';
    return sender.charAt(0).toUpperCase() + sender.slice(1);
  };

  const getPlanetColors = (sender: string) => {
    if (planetInfo) {
      return `bg-${planetInfo.colors.primary} text-gray-900`;
    }
    
    // Fallback colors for planets
    const planetColors: Record<string, string> = {
      sun: 'bg-yellow-200 text-gray-900',
      moon: 'bg-blue-200 text-gray-900',
      mercury: 'bg-cyan-200 text-gray-900',
      venus: 'bg-pink-200 text-gray-900',
      mars: 'bg-red-200 text-gray-900',
      jupiter: 'bg-amber-200 text-gray-900',
      saturn: 'bg-gray-200 text-gray-900',
      uranus: 'bg-teal-200 text-gray-900',
      neptune: 'bg-blue-300 text-gray-900',
      pluto: 'bg-purple-200 text-gray-900',
    };
    
    return planetColors[sender] || 'bg-gray-200 text-gray-900';
  };

  // System messages are centered - but exclude "Get yappin!" since it's shown in fixed header
  if (isSystem && message.content !== "Get yappin!") {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-md text-center">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-gray-300 italic">{message.content}</p>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // If it's "Get yappin!" system message, don't render anything (handled by fixed header)
  if (isSystem && message.content === "Get yappin!") {
    return null;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Planet/User indicator */}
        <div className={`flex items-center mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center space-x-1 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!isUser && planetInfo?.icon && (
              <span className="text-lg">{planetInfo.icon}</span>
            )}
            <span className="text-xs text-amber-50/85 font-light">
              {getPlanetDisplayName(message.sender)}
              {!isUser && planetInfo?.sign && (
                <span className="text-amber-50/60"> • {planetInfo.sign}</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-lg border border-white/20 bg-gray-500
            ${isUser 
            ? 'bg-white/10 text-amber-50/85 font-thin' 
              : `${getPlanetColors(message.sender)} shadow-sm`
            }
            ${isTyping ? 'animate-pulse' : ''}
          `}
        >
          {isTyping ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap ">{message.content}</p>
          )}
        </div>
        
        {/* Timestamp */}
        {!isTyping && (
          <div className={`text-xs text-white/50 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
}