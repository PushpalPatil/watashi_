import { useState, useEffect } from 'react';
import { ChatMessage } from '@/app/components/chat-message';

const STORAGE_KEY = 'groupchat-messages';
const MAX_STORED_MESSAGES = 100; // Limit stored messages to prevent localStorage bloat

export function useGroupChatStorage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading chat messages from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      try {
        // Keep only the most recent messages to prevent storage bloat
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
      } catch (error) {
        console.error('Error saving chat messages to storage:', error);
        // If storage is full, try to clear old messages and retry
        try {
          const recentMessages = messages.slice(-50); // Keep only 50 most recent
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recentMessages));
        } catch (retryError) {
          console.error('Error saving reduced chat messages:', retryError);
        }
      }
    }
  }, [messages, isLoaded]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  };

  const clearMessages = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat messages from storage:', error);
    }
  };

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  };

  return {
    messages,
    isLoaded,
    addMessage,
    addMessages,
    clearMessages,
    updateMessage,
    setMessages
  };
}