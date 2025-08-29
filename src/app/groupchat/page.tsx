'use client';

import { BirthChartPopup } from '@/app/components/birth-chart-popup';
import ChatInput from '@/app/components/chat-input';
import ChatMessageComponent, { ChatMessage } from '@/app/components/chat-message';
import Header from '@/app/components/header';
import { OnboardingQuestions } from '@/app/components/onboarding-questions';
import { StarryBackground } from '@/app/components/starry-background';
import { useGroupChatStorage } from '@/hooks/useGroupChatStorage';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { PLANET_CONFIG } from '@/lib/planet-config';
import { useStore } from '@/store/storeInfo';
import { useEffect, useState } from 'react';

export default function GroupChat() {
      const { planets, _hasHydrated } = useStore();
      const { messages, isLoaded, addMessage, addMessages, setMessages, clearMessages } = useGroupChatStorage();
      const [typingPlanets, setTypingPlanets] = useState<string[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [showPopup, setShowPopup] = useState(false);
      const [showDrawer, setShowDrawer] = useState(false);
      const [hasShownPopup, setHasShownPopup] = useState(false);
      const [showOnboardingQuestions, setShowOnboardingQuestions] = useState(false);
      const [showMenuOptions, setShowMenuOptions] = useState(false);
      // Removed auto-scroll behavior - let users control their scroll position

      useEffect(() => {
            function setViewportHeight() {
                  const vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--vh', `${vh}px`);
            }

            setViewportHeight();

            // Update on resize and orientation
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', setViewportHeight);

            // iOS keyboard-aware fix
            if (window.visualViewport) {
                  window.visualViewport.addEventListener('resize', setViewportHeight);
                  window.visualViewport.addEventListener('scroll', setViewportHeight);
            }

            return () => {
                  window.removeEventListener('resize', setViewportHeight);
                  window.removeEventListener('orientationchange', setViewportHeight);
                  if (window.visualViewport) {
                        window.visualViewport.removeEventListener('resize', setViewportHeight);
                        window.visualViewport.removeEventListener('scroll', setViewportHeight);
                  }
            };
      }, []);


      useEffect(() => {
            // Add "Get yappin!" message when component loads and planets are available
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

      // Check if we should show Next button (new users who haven't seen onboarding)
      const shouldShowNext = () => {
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            const hasMessages = messages.length > 1; // More than just the welcome message
            return !hasSeenOnboarding && !hasMessages;
      };

      const handleNext = () => {
            setShowPopup(false);
            setShowOnboardingQuestions(true);
      };

      const handleMenuClick = () => {
            setShowDrawer(true);
      };

      // Swipe gesture hook
      useSwipeGesture({
            onSwipeFromRight: () => setShowDrawer(true),
            enabled: !showDrawer && !showPopup
      });

      const handleQuestionSelect = (question: string) => {
            setShowOnboardingQuestions(false);
            setShowDrawer(false); // Close drawer when question is selected
            localStorage.setItem('hasSeenOnboarding', 'true');
            handleSendMessage(question);
      };

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

                  // Add planet responses immediately for faster UX
                  // responses.forEach(response => {
                  //       addMessage(response);
                  // });
                  for (let i = 0; i < responses.length; i++) {
                        setTimeout(() => {
                              addMessage(responses[i]);
                        }, i * 1000); // 1 second delay between each response
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
                  console.log('DEBUG: Planet data being sent:', Object.keys(planets));
                  console.log('DEBUG: Full planet data:', planets);

                  const response = await fetch('/api/groupchat5', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              message,
                              allPlanetsData: planets, // Send all planet data for orchestration
                              conversationHistory: messages.slice(-20) // Send last 20 messages for context
                        })
                  });

                  if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to get orchestrated responses');
                  }

                  const data = await response.json();
                  console.log('DEBUG: API response:', data);

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
            // h- setting height, calc - computing dynamic value, 
            // var(--vh, 1vh)- using custom variable --vh fallback to 1vh if undefined,
            // vh = window.innerHeight * 0.01;
            // 100 to simulate full screen height
            // h-[calc(var(--vh,1vh)*100)] md:
            <div className="h-[calc(var(--vh,1vh)*100)] md:h-screen bg-black flex flex-col relative overflow-hidden">
                  {/* Starry background */}
                  <StarryBackground />

                  {/* Floating astrology symbols background */}
                  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                        {/* Floating zodiac symbols evenly dispersed across screen */}
                        <div className="absolute left-[10%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '0s' }}>
                              <img src="/symbols/aries-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[85%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '4s' }}>
                              <img src="/symbols/taurus-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[25%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '8s' }}>
                              <img src="/symbols/gemini-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[65%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '12s' }}>
                              <img src="/symbols/cancer-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[40%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '16s' }}>
                              <img src="/symbols/leo-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[75%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '20s' }}>
                              <img src="/symbols/virgo-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[15%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '24s' }}>
                              <img src="/symbols/libra-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[90%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '28s' }}>
                              <img src="/symbols/scorpio-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[50%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '32s' }}>
                              <img src="/symbols/sagittarius-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[30%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '36s' }}>
                              <img src="/symbols/capricorn-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[5%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '40s' }}>
                              <img src="/symbols/aquarius-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>
                        <div className="absolute left-[70%] animate-float-up-continuous opacity-50 glow-svg-bright" style={{ animationDelay: '44s' }}>
                              <img src="/symbols/pisces-sign.svg" alt="" className="w-5 h-5 filter invert" />
                        </div>


                  </div>

                  <Header
                        showMenuIcon={true}
                        onMenuClick={handleMenuClick}
                  />


                  {/* Birth Chart Popup */}
                  {showPopup && (
                        <BirthChartPopup
                              onClose={() => setShowPopup(false)}
                              showNext={shouldShowNext()}
                              onNext={handleNext}
                        />
                  )}

                  {/* Onboarding Questions Popup */}
                  {showOnboardingQuestions && (
                        <OnboardingQuestions
                              mode="overlay"
                              onQuestionSelect={handleQuestionSelect}
                              onClose={() => {
                                    setShowOnboardingQuestions(false);
                                    localStorage.setItem('hasSeenOnboarding', 'true');
                              }}
                        />
                  )}


                  {/* Birth Chart Drawer */}
                  <BirthChartPopup
                        mode="drawer"
                        isOpen={showDrawer}
                        onClose={() => setShowDrawer(false)}
                        onQuestionSelect={handleQuestionSelect}
                  />


                  {/* Planet participants */}
                  {/* <PlanetParticipants 
        planets={planets}
        typingPlanets={typingPlanets}
      />

      
       */}

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto pt-16 px-4 space-y-4 relative text-amber-50/85 flex flex-col-reverse pb-10 md:pb-1 overscroll-contain">
                        {/* Fade overlay for header area
                        <div className="absolute top-0 left-0 right-0 h-16 bg-transparent pointer-events-none" /> */}

                        {/* Typing indicators - show at bottom (top of reversed container) */}
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



                        {[...messages].reverse().map((message) => (
                              <ChatMessageComponent
                                    key={message.id}
                                    message={message}
                                    planetInfo={message.sender !== 'user' && message.sender !== 'system' ? getPlanetInfo(message.sender) : undefined}
                              />
                        ))}

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

                  {/* CSS Animations for floating symbols */}
                  <style jsx>{`
                        /* Bright glow effect for symbols */
                        .glow-svg-bright {
                              filter: invert(1) drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)) 
                                      drop-shadow(0 0 12px rgba(255, 255, 255, 0.6)) 
                                      drop-shadow(0 0 18px rgba(255, 255, 255, 0.4))
                                      drop-shadow(0 0 24px rgba(255, 255, 255, 0.2));
                        }
                        
                        @keyframes float-up-continuous {
                              0% { 
                                    transform: translateY(110vh) translateX(0px) rotate(0deg);
                                    opacity: 0;
                              }
                              10% {
                                    opacity: 0.5;
                              }
                              90% {
                                    opacity: 0.5;
                              }
                              100% { 
                                    transform: translateY(-20vh) translateX(0px) rotate(360deg);
                                    opacity: 0;
                              }
                        }
                        
                        .animate-float-up-continuous { 
                              animation: float-up-continuous 48s linear infinite; 
                        }
                  `}</style>
            </div>
      );
}
