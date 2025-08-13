"use client";

import Header from "@/app/components/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildGreeting, getHouseDisplay, getPlanetConfig } from "@/lib/planet-config";
import { useStore } from "@/store/storeInfo";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DynamicPlanetChat() {
      const { planet } = useParams<{ planet: string }>();

      // Get planet data from store
      const data = useStore(s => s.planets[planet]);
      const planets = useStore((s) => s.planets);

      // Get planet configuration
      const planetConfig = getPlanetConfig(planet);

      // Build dynamic greeting and subtitle (with fallbacks)
      const greeting = planetConfig ? buildGreeting(planet, data?.sign || 'unknown', data?.retrograde || false) : `hello ${data?.sign || 'unknown'}`;
      const subtitle = planetConfig ? planetConfig.subtitle(data?.sign || 'unknown', data?.house || 0, data?.retrograde || false) : "planetary agent";
      const houseDisplay = getHouseDisplay(data?.house || 0);

      const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
            api: `/api/chat/${planet}`,
            body: {
                  planet: planet,
                  sign: data?.sign,
                  house: data?.house,
                  retrograde: data?.retrograde,
                  persona: data?.persona // Keep existing persona for compatibility
            }
      });

      const messagesEndRef = useRef<HTMLDivElement>(null);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      console.log('Planet param from URL:', planet);
      console.log('Data from store:', data);
      console.log('All planets in store:', planets);
      console.log('Store keys:', Object.keys(planets));
      console.log('Planet config:', planetConfig);

      console.log('Planet data:', {
            planet,
            sign: data?.sign,
            house: data?.house,
            retrograde: data?.retrograde,
            persona: data?.persona
      });
      console.log('Messages:', messages);

      // Fallback if planet config not found - AFTER all hooks
      if (!planetConfig) {
            return (
                  <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                              <h1 className="text-2xl mb-4">Planet not found</h1>
                              <p>The planet "{planet}" is not yet supported.</p>
                        </div>
                  </div>
            );
      }

      // Dynamic CSS variables for planet theming
      const planetTheme = {
            '--planet-primary': `rgb(var(--${planetConfig.colors.primary}))`,
            '--planet-secondary': `rgb(var(--${planetConfig.colors.secondary}))`,
      } as React.CSSProperties;

      return (
            <div className="flex flex-col h-screen bg-background" style={planetTheme}>
                  <Header />


                  {/* star animations */}
                  <style jsx>{`
                @keyframes bounce-rotate {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(-4px) rotate(3deg); 
                    }
                    50% { 
                        transform: translateY(-8px) rotate(0deg); 
                    }
                    75% { 
                        transform: translateY(-4px) rotate(-3deg); 
                    }
                }
                
                @keyframes sun-rays-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes sun-float {
                    0%, 100% { 
                        transform: translateY(0px) scale(1);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-20px) scale(1.1);
                        opacity: 0.8;
                    }
                }
                
                @keyframes sun-sparkle {
                    0%, 100% { 
                        opacity: 0;
                        transform: scale(0) rotate(0deg);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1) rotate(180deg);
                    }
                }
                
                .animate-bounce-rotate {
                    animation: bounce-rotate 3s ease-in-out infinite;
                }
                
                .sun-rays-bg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 400px;
                    height: 400px;
                    margin-left: -200px;
                    margin-top: -200px;
                    background: radial-gradient(circle, 
                        rgba(255, 165, 0, 0.1) 0%, 
                        rgba(255, 140, 0, 0.05) 30%, 
                        transparent 60%
                    );
                    animation: sun-rays-rotate 30s linear infinite;
                    border-radius: 50%;
                }
            
            `}</style>
                  {/* Add custom animations */}
                  {/* eslint-disable-next-line react/no-unknown-property */}
                  <style jsx>{`
                @keyframes bounce-rotate {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(-4px) rotate(3deg); 
                    }
                    50% { 
                        transform: translateY(-8px) rotate(0deg); 
                    }
                    75% { 
                        transform: translateY(-4px) rotate(-3deg); 
                    }
                }
                
                .animate-bounce-rotate {
                    animation: bounce-rotate 3s ease-in-out infinite;
                }
            `}</style>

                  {/* Chat Container */}
                  <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full font-normal">

                        {/* Welcome Header - only show when no messages */}
                        {messages.length === 0 && (
                              <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6 mt-20">

                                    {/* Planet Icon/GIF - positioned as background */}
                                    <div className="absolute inset-0 flex mt-35 justify-center pointer-events-none ">
                                          {planet === 'sun' && (
                                                <img
                                                      src="/FLORA-GIF-SUN.gif"
                                                      alt="Sun"
                                                      className="w-50 h-50 rounded-full opacity-60"
                                                />
                                          )}
                                          {planet === 'moon' && (
                                                <img
                                                      src="/FLORA-GIF-MOON.gif"
                                                      alt="Moon"
                                                      className="w-50 h-50 rounded-full opacity-60"
                                                />
                                          )}
                                          {planet === 'mercury' && (
                                                <img
                                                      src="/FLORA-GIF-MERCURY.gif"
                                                      alt="Mercury"
                                                      className="w-50 h-50 rounded-full opacity-60"
                                                />
                                          )}
                                          {!['sun', 'moon', 'mercury'].includes(planet) && (
                                                <div className={`w-18 h-18 bg-gradient-to-br ${planetConfig.colors.gradient} rounded-full flex items-center justify-center opacity-60`}>
                                                      <span className="text-2xl">{planetConfig.icon}</span>
                                                </div>
                                          )}
                                    </div>

                                    <div className="text-center relative">
                                          {/* Text content - original layout */}
                                          <div className="relative z-10">
                                                <h1 className={`text-3xl font-normal bg-gradient-to-r ${planetConfig.colors.gradient} bg-clip-text text-transparent`}>
                                                      {greeting}
                                                </h1>
                                                <p className="text-lg text-muted-foreground max-w-md">
                                                      {subtitle}
                                                </p>
                                                {houseDisplay && (
                                                      <p className={`text-sm text-${planetConfig.colors.primary} opacity-80`}>
                                                            {houseDisplay}
                                                      </p>
                                                )}
                                          </div>
                                    </div>

                                    {/* Suggested prompts - dynamic based on planet */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8 font-normal">
                                          {planetConfig.suggestedPrompts(data?.sign || 'unknown', data?.retrograde || false).map((prompt) => (
                                                <button
                                                      key={prompt}
                                                      onClick={() => handleInputChange({ target: { value: prompt } } as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
                                                      className={`font-normal text-left p-4 rounded-xl border border-border hover:border-${planetConfig.colors.primary} hover:bg-${planetConfig.colors.primary}/10 transition-colors group`}
                                                >
                                                      <span className={`text-sm text-muted-foreground group-hover:text-${planetConfig.colors.primary} font-normal`}>
                                                            {prompt}
                                                      </span>
                                                </button>
                                          ))}
                                    </div>
                              </div>
                        )}

                        {/* Messages */}
                        {messages.length > 0 && (
                              <div className="flex-1 overflow-y-auto px-4 py-6">
                                    <div className="space-y-6">
                                          {messages.map((message) => (
                                                <div
                                                      key={message.id}
                                                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                                            {message.role === 'assistant' && (
                                                                  <div className="flex items-center gap-2 mb-2">
                                                                        {planet === 'sun' && (
                                                                              <img
                                                                                    src="/FLORA-GIF-SUN.gif"
                                                                                    alt="Sun"
                                                                                    className="w-6 h-6 rounded-full"
                                                                              />
                                                                        )}
                                                                        {planet === 'moon' && (
                                                                              <img
                                                                                    src="/FLORA-GIF-MOON.gif"
                                                                                    alt="Moon"
                                                                                    className="w-6 h-6 rounded-full"
                                                                              />
                                                                        )}
                                                                        {planet === 'mercury' && (
                                                                              <img
                                                                                    src="/FLORA-GIF-MERCURY.gif"
                                                                                    alt="Mercury"
                                                                                    className="w-6 h-6 rounded-full"
                                                                              />
                                                                        )}
                                                                        {!['sun', 'moon', 'mercury'].includes(planet) && (
                                                                              <div className={`w-6 h-6 bg-gradient-to-br ${planetConfig.colors.gradient} rounded-full flex items-center justify-center`}>
                                                                                    <span className="text-xs">{planetConfig.icon}</span>
                                                                              </div>
                                                                        )}
                                                                        <span className="text-xs text-muted-foreground capitalize">
                                                                              {planet} Agent
                                                                        </span>
                                                                  </div>
                                                            )}

                                                            <div className={`
                                            rounded-2xl px-4 py-3
                                            ${message.role === 'user'
                                                                        ? 'bg-primary text-primary-foreground ml-auto'
                                                                        : 'bg-muted/50 text-foreground'
                                                                  }
                                        `}>
                                                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {message.content}
                                                                  </p>
                                                            </div>

                                                            {message.role === 'user' && (
                                                                  <div className="flex justify-end mt-1">
                                                                        <span className="text-xs text-muted-foreground">You</span>
                                                                  </div>
                                                            )}
                                                      </div>
                                                </div>
                                          ))}

                                          {isLoading && (
                                                <div className="flex justify-start">
                                                      <div className="max-w-[80%]">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                  {planet === 'sun' && (
                                                                        <img
                                                                              src="/FLORA-GIF-SUN.gif"
                                                                              alt="Sun"
                                                                              className="w-6 h-6 rounded-full"
                                                                        />
                                                                  )}
                                                                  {planet === 'moon' && (
                                                                        <img
                                                                              src="/FLORA-GIF-MOON.gif"
                                                                              alt="Moon"
                                                                              className="w-6 h-6 rounded-full"
                                                                        />
                                                                  )}
                                                                  {planet === 'mercury' && (
                                                                        <img
                                                                              src="/FLORA-GIF-MERCURY.gif"
                                                                              alt="Mercury"
                                                                              className="w-6 h-6 rounded-full"
                                                                        />
                                                                  )}
                                                                  {!['sun', 'moon', 'mercury'].includes(planet) && (
                                                                        <div className={`w-6 h-6 bg-gradient-to-br ${planetConfig.colors.gradient} rounded-full flex items-center justify-center`}>
                                                                              <span className="text-xs">{planetConfig.icon}</span>
                                                                        </div>
                                                                  )}
                                                                  <span className="text-xs text-muted-foreground font-medium capitalize">
                                                                        {planet} Agent
                                                                  </span>
                                                            </div>
                                                            <div className="bg-muted/50 rounded-2xl px-4 py-3">
                                                                  <div className="flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse"></div>
                                                                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse delay-75"></div>
                                                                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse delay-150"></div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </div>
                                          )}

                                          <div ref={messagesEndRef} />
                                    </div>
                              </div>
                        )}

                        {/* Input Area */}
                        <div className="border-t border-border bg-background/80 backdrop-blur-sm">
                              <div className="max-w-4xl mx-auto p-4">
                                    <form onSubmit={handleSubmit} className="relative">
                                          <Textarea
                                                value={input}
                                                onChange={handleInputChange}
                                                placeholder={`Ask your ${planet} agent anything about your ${data?.sign || 'sign'} energy...`}
                                                className={`min-h-[60px] max-h-[200px] pr-12 resize-none border-2 focus:border-${planetConfig.colors.primary} rounded-xl`}
                                                onKeyDown={(e) => {
                                                      if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSubmit(e as any);
                                                      }
                                                }}
                                          />
                                          <Button
                                                type="submit"
                                                size="sm"
                                                disabled={!input.trim() || isLoading}
                                                className={`absolute right-2 bottom-2 h-8 w-8 bg-gradient-to-r ${planetConfig.colors.gradient} hover:opacity-90`}
                                          >
                                                ↑
                                          </Button>
                                    </form>
                              </div>
                        </div>
                  </div>
            </div>
      );
}