"use client";

import Header from "@/app/components/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/storeInfo";
import { useChat } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Moon() {
    const { planet } = useParams<{ planet: string }>();
    const data = useStore(s => s.planets[planet as keyof typeof s.planets]);
    const planets = useStore((s) => s.planets)
    const moonSign = planets.moon?.sign ?? '-';

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/moonchat',
        body: {
            planet: planet,
            sign: data?.sign,
            retrograde: data?.retrograde,
            persona: data?.persona  // Pass the planet to your API
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header />

            {/* Chat Container */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full font-normal">

                {/* Welcome Header - only show when no messages */}
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center px-4">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-normal bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                                twinkle twinkle little {moonSign.toLowerCase()}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md">
                                as your Moon sign, I&apos;m here to help you explore how you process your emotions, emotioinal and creative expression
                            </p>
                        </div>

                        {/* Suggested prompts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8 font-normal">
                            {[
                                "Tell me about my emotional tendencies",
                                "How can I express myself better emotionally?",
                                "How do I stay aware of my emotional state?",
                                "Help me build inner peace"
                            ].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleInputChange({ target: { value: prompt } } as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
                                    className="font-normal text-left p-4 rounded-xl border border-border hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group"
                                >
                                    <span className="text-sm text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 font-normal">
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
                                                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium font-normal">
                                                        Moon Agent
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
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Moon Agent
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
                                placeholder={`Ask your Moon agent anything about your ${moonSign} energy...`}
                                className="min-h-[60px] max-h-[200px] pr-12 resize-none border-2 focus:border-blue-300 dark:focus:border-blue-600 rounded-xl"
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
                                className="absolute right-2 bottom-2 h-8 w-8 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
                            >
                                ^
                            </Button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
}