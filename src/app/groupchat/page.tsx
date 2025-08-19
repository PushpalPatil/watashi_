'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/storeInfo';
import { PLANET_CONFIG } from '@/lib/planet-config';
import ChatMessageComponent, { ChatMessage } from '@/app/components/chat-message';
import ChatInput from '@/app/components/chat-input';
import PlanetParticipants from '@/app/components/planet-participants';
import ChatControls from '@/app/components/chat-controls';
import Header from '@/app/components/header';
import { useGroupChatStorage } from '@/hooks/useGroupChatStorage';

export default function GroupChat() {
  const { planets, _hasHydrated } = useStore();
  const { messages, isLoaded, addMessage, addMessages, setMessages, clearMessages } = useGroupChatStorage();
  const [typingPlanets, setTypingPlanets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component loads and planets are available
    if (_hasHydrated && isLoaded && Object.keys(planets).length > 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'system',
        content: "Welcome to your Planetary Council! Your planets are ready to chat with you. Ask them anything or just say hello!",
        timestamp: Date.now()
      };
      addMessage(welcomeMessage);
    }
  }, [_hasHydrated, isLoaded, planets, messages.length, addMessage]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };
    
    addMessage(userMessage);
    setIsLoading(true);

    try {
      // Determine which planets should respond based on the message content
      const respondingPlanets = determineRespondingPlanets(content);
      
      // Add typing indicators for responding planets
      setTypingPlanets(respondingPlanets);
      
      // Get responses from planets
      const responses = await getPlanetResponses(content, respondingPlanets);
      
      // Remove typing indicators
      setTypingPlanets([]);
      
      // Add planet responses with slight delays for natural conversation flow
      for (let i = 0; i < responses.length; i++) {
        setTimeout(() => {
          addMessage(responses[i]);
        }, i * 1500); // 1.5 second delay between each response
      }
      
    } catch (error) {
      console.error('Error getting planet responses:', error);
      setTypingPlanets([]);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'system',
        content: 'Sorry, your planets are having trouble connecting right now. Please try again in a moment.',
        timestamp: Date.now()
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const determineRespondingPlanets = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    const respondingPlanets: string[] = [];
    
    // Keywords that might trigger specific planets
    const planetKeywords = {
      sun: ['identity', 'purpose', 'ego', 'leadership', 'creativity', 'self', 'confidence'],
      moon: ['emotion', 'feeling', 'intuition', 'comfort', 'family', 'home', 'mood'],
      mercury: ['think', 'communicate', 'learn', 'study', 'talk', 'understand', 'mind'],
      venus: ['love', 'relationship', 'beauty', 'value', 'harmony', 'pleasure', 'art'],
      mars: ['action', 'energy', 'motivation', 'anger', 'drive', 'fight', 'assert'],
      jupiter: ['growth', 'expand', 'wisdom', 'philosophy', 'opportunity', 'luck', 'meaning'],
      saturn: ['discipline', 'structure', 'responsibility', 'lesson', 'limit', 'work', 'time'],
      uranus: ['change', 'innovation', 'rebel', 'unique', 'freedom', 'breakthrough', 'different'],
      neptune: ['dream', 'spiritual', 'imagination', 'compassion', 'illusion', 'intuitive'],
      pluto: ['transform', 'power', 'deep', 'intense', 'rebirth', 'hidden', 'psychology']
    };

    // Check for specific planet mentions
    Object.keys(planets).forEach(planet => {
      if (lowerMessage.includes(planet)) {
        respondingPlanets.push(planet);
      }
    });

    // Check for keyword matches
    Object.entries(planetKeywords).forEach(([planet, keywords]) => {
      if (planets[planet] && keywords.some(keyword => lowerMessage.includes(keyword))) {
        if (!respondingPlanets.includes(planet)) {
          respondingPlanets.push(planet);
        }
      }
    });

    // If no specific planets triggered, let 2-3 random planets respond
    if (respondingPlanets.length === 0) {
      const availablePlanets = Object.keys(planets);
      const numResponders = Math.min(3, Math.max(2, Math.floor(Math.random() * 4) + 1));
      
      for (let i = 0; i < numResponders; i++) {
        const randomPlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];
        if (!respondingPlanets.includes(randomPlanet)) {
          respondingPlanets.push(randomPlanet);
        }
      }
    }

    return respondingPlanets;
  };

  const getPlanetResponses = async (message: string, respondingPlanets: string[]): Promise<ChatMessage[]> => {
    const responses: ChatMessage[] = [];
    
    for (const planetName of respondingPlanets) {
      try {
        const response = await fetch('/api/groupchat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planet: planetName,
            message,
            planetData: planets[planetName],
            conversationHistory: messages.slice(-10) // Send last 10 messages for context
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from ${planetName}`);
        }

        const data = await response.json();
        
        responses.push({
          id: `${planetName}-${Date.now()}-${Math.random()}`,
          sender: planetName,
          content: data.response,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Error getting response from ${planetName}:`, error);
      }
    }
    
    return responses;
  };

  const getPlanetInfo = (planetName: string) => {
    const config = PLANET_CONFIG[planetName];
    const planetData = planets[planetName];
    
    if (!config || !planetData) return undefined;
    
    return {
      icon: config.icon,
      colors: config.colors,
      sign: planetData.sign
    };
  };

  if (!_hasHydrated || !isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading your planetary council...</div>
      </div>
    );
  }

  if (Object.keys(planets).length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-2xl font-bold mb-4">No Birth Chart Data</h2>
            <p className="text-gray-400 mb-6">
              You need to calculate your birth chart first before chatting with your planets.
            </p>
            <a 
              href="/letsyap" 
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-lg text-white transition-colors"
            >
              Calculate Birth Chart
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      
      {/* Planet participants */}
      <PlanetParticipants 
        planets={planets}
        typingPlanets={typingPlanets}
      />
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            planetInfo={message.sender !== 'user' && message.sender !== 'system' ? getPlanetInfo(message.sender) : undefined}
          />
        ))}
        
        {/* Typing indicators */}
        {typingPlanets.map((planet) => (
          <ChatMessageComponent
            key={`typing-${planet}`}
            message={{
              id: `typing-${planet}`,
              sender: planet,
              content: '',
              timestamp: Date.now(),
              isTyping: true
            }}
            planetInfo={getPlanetInfo(planet)}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
      
      {/* Chat controls */}
      <ChatControls
        onClearChat={() => {
          clearMessages();
          // Re-add welcome message
          const welcomeMessage: ChatMessage = {
            id: `welcome-${Date.now()}`,
            sender: 'system',
            content: "Welcome to your Planetary Council! Your planets are ready to chat with you. Ask them anything or just say hello!",
            timestamp: Date.now()
          };
          setTimeout(() => addMessage(welcomeMessage), 100);
        }}
        onSuggestedPrompt={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}
