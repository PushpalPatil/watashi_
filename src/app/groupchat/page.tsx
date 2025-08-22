'use client';

import { BirthChartDrawer } from '@/app/components/birth-chart-drawer';
import { BirthChartPopup } from '@/app/components/birth-chart-popup';
import ChatInput from '@/app/components/chat-input';
import ChatMessageComponent, { ChatMessage } from '@/app/components/chat-message';
import Header from '@/app/components/header';
import { StarryBackground } from '@/app/components/starry-background';
import { useGroupChatStorage } from '@/hooks/useGroupChatStorage';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { PLANET_CONFIG } from '@/lib/planet-config';
import { useStore } from '@/store/storeInfo';
import { useEffect, useRef, useState } from 'react';

export default function GroupChat() {
      const { planets, _hasHydrated } = useStore();
      const { messages, isLoaded, addMessage, addMessages, setMessages, clearMessages } = useGroupChatStorage();
      const [typingPlanets, setTypingPlanets] = useState<string[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [showPopup, setShowPopup] = useState(false);
      const [showDrawer, setShowDrawer] = useState(false);
      const [hasShownPopup, setHasShownPopup] = useState(false);
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
                        content: "Get yappin!",
                        timestamp: Date.now()
                  };
                  addMessage(welcomeMessage);
            }
      }, [_hasHydrated, isLoaded, planets, messages.length, addMessage]);

      // Show birth chart popup only on first visit after calculating chart
      useEffect(() => {
            if (_hasHydrated && isLoaded && Object.keys(planets).length > 0 && !hasShownPopup) {
                  const hasSeenPopup = localStorage.getItem('hasSeenBirthChartPopup');
                  if (!hasSeenPopup) {
                        setShowPopup(true);
                        setHasShownPopup(true);
                        localStorage.setItem('hasSeenBirthChartPopup', 'true');
                  }
            }
      }, [_hasHydrated, isLoaded, planets, hasShownPopup]);

      // Swipe gesture hook
      useSwipeGesture({
            onSwipeFromRight: () => setShowDrawer(true),
            enabled: !showDrawer && !showPopup
      });

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
                  // Show typing indicator while waiting for orchestrated response
                  setTypingPlanets(['thinking']); // Generic typing indicator

                  // Get orchestrated responses from all planets
                  const responses = await getOrchestratedPlanetResponses(content);

                  // Remove typing indicators
                  setTypingPlanets([]);

                  // Add planet responses with slight delays for natural conversation flow
                  for (let i = 0; i < responses.length; i++) {
                        setTimeout(() => {
                              addMessage(responses[i]);
                        }, i * 1200); // 1.2 second delay between each response
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

      // This function is no longer needed since the AI orchestration handles planet selection
      // Keeping it commented for reference in case we need to fall back to manual selection
      /*
      const determineRespondingPlanets = (message: string): string[] => {
        // Planet selection logic moved to AI orchestration in groupchat2 API
        return [];
      };
      */

      const getOrchestratedPlanetResponses = async (message: string): Promise<ChatMessage[]> => {
            try {
                  const response = await fetch('/api/groupchat2', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              message,
                              allPlanetsData: planets, // Send all planet data for orchestration
                              conversationHistory: messages.slice(-10) // Send last 10 messages for context
                        })
                  });

                  if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to get orchestrated responses');
                  }

                  const data = await response.json();

                  // Convert orchestrated responses to ChatMessage format
                  const chatMessages: ChatMessage[] = data.responses.map((planetResponse: { planet: string; message: string }, index: number) => ({
                        id: `${planetResponse.planet}-${Date.now()}-${index}`,
                        sender: planetResponse.planet,
                        content: planetResponse.message,
                        timestamp: Date.now() + index // Slightly offset timestamps for ordering
                  }));

                  return chatMessages;
            } catch (error) {
                  console.error('Error getting orchestrated planet responses:', error);
                  throw error; // Re-throw to be handled by the calling function
            }
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
            <div className="min-h-screen bg-black flex flex-col relative">
                  {/* Starry background */}
                  <StarryBackground />

                  <Header />

                  {/* Birth Chart Popup */}
                  {showPopup && (
                        <BirthChartPopup onClose={() => setShowPopup(false)} />
                  )}

                  {/* Birth Chart Drawer */}
                  <BirthChartDrawer
                        isOpen={showDrawer}
                        onClose={() => setShowDrawer(false)}
                  />

                  {/* Planet participants */}
                  {/* <PlanetParticipants 
        planets={planets}
        typingPlanets={typingPlanets}
      />

      
       */}
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto pt-14 px-4 space-y-4 relative">
                        {/* Fade overlay for header area */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
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
                  {/* <ChatControls
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
                  /> */}
            </div>
      );
}
