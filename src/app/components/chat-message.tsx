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
    // Use our defined planet colors instead of planetInfo.colors
    const planetColors: Record<string, string> = {
      sun: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      moon: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      mercury: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      venus: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      mars: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      jupiter: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      saturn: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      uranus: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      neptune: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
      pluto: 'bg-black/30 text-amber-50/85 font-thin border border-amber-50/30',
    };
    
    return planetColors[sender] || 'bg-gray-500/90 text-gray-100 border border-gray-600/70 shadow-md';
  };

  const getPlanetNameColor = (sender: string) => {
    // Extract border colors for planet names
    const planetNameColors: Record<string, string> = {
      sun: 'text-orange-200/90',
      moon: 'text-blue-100/90 ',
      mercury: 'text-cyan-200/90',
      venus: 'text-pink-200/80',
      mars: 'text-red-200/90',
      jupiter: 'text-green-100/90',
      saturn: 'text-slate-300/90',
      uranus: 'text-teal-200/70',
      neptune: 'text-indigo-200/80',
      pluto: 'text-amber-50/90', // Using amber since brown-900 doesn't work for text
    };
    
    return planetNameColors[sender] || 'text-amber-50/85';
  };

  const getPlanetIconColor = (sender: string) => {
    // Extract border colors for planet names
    const planetIconColors: Record<string, string> = {
      sun: 'text-orange-200/90 text-shadow',
      moon: 'text-blue-200/90',
      mercury: 'text-cyan-200/80',
      venus: 'text-pink-200/80',
      mars: 'text-red-200/90',
      jupiter: 'text-green-200/80',
      saturn: 'text-slate-300/90',
      uranus: 'text-teal-200/80',
      neptune: 'text-indigo-200/80',
      pluto: 'text-amber-100/90', // Using amber since brown-900 doesn't work for text
    };

    return planetIconColors[sender] || 'text-amber-50/85';
  };

  const getPlanetSignColor = (sender: string) => {
    // Extract border colors for planet names
    const planetSignColors: Record<string, string> = {
      sun: 'text-orange-100 font-thin',
      moon: 'text-blue-100 font-thin',
      mercury: 'text-cyan-100 font-thin',
      venus: 'text-pink-100 font-thin',
      mars: 'text-red-100 font-thin',
      jupiter: 'text-green-100 font-thin',
      saturn: 'text-slate-100 font-thin',
      uranus: 'text-teal-100 font-thin',
      neptune: 'text-indigo-100 font-thin',
      pluto: 'text-amber-50/90 font-thin', // Using amber since brown-900 doesn't work for text
    };

    return planetSignColors[sender] || 'text-amber-50/85';
  };


  // System messages are centered 
  if (isSystem) {
    // Special styling for "Get yappin!" message
    if (message.content === "Get yappin!") {
      return (
        <div className="flex justify-center mb-4">
          <div className="max-w-md text-center">
            <div className="px-3 py-2 bg-white/5 border border-amber-50/10 rounded-lg">
              <p className="text-sm font-thin text-amber-50/80 italic">{message.content}</p>
            </div>
            <div className="text-xs text-amber-50/80 font-thin opacity-80 mt-1.5">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      );
    }
    
    // Default system message styling
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Planet/User indicator */}
        <div className={`flex items-center mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            
            {!isUser && planetInfo?.icon && (
              <span className={`text-lg  ${getPlanetIconColor(message.sender)}`}>{planetInfo.icon}</span>
            )}

            <span className={`text-xs font-stretch-100% font-extralight ${isUser ? 'text-amber-50/85' : getPlanetNameColor(message.sender)} `}>
              {getPlanetDisplayName(message.sender)}
              {!isUser && planetInfo?.sign && (
                <span className={`${getPlanetSignColor(message.sender)} font-thin opacity-85`}> • {planetInfo.sign}</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-lg
            ${isUser 
            ? 'bg-white/10 text-amber-50/85 font-thin border border-white/20' 
              : `${getPlanetColors(message.sender)}`
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
          <div className={`text-xs text-amber-50/70 font-thin mt-1 ${isUser ? 'text-right mr-1.5' : 'text-left ml-1.5'}`}>
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