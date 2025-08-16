"use client";

import { useCallback, useEffect, useState } from 'react';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export function useChatStorage(planet: string) {
  const storageKey = `chat_${planet}`;
  
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStoredMessages = useCallback((): StoredMessage[] => {
    if (!isClient || typeof window === 'undefined') return [];
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading chat history:', error);
      return [];
    }
  }, [isClient, storageKey]);

  const saveMessages = useCallback((messages: StoredMessage[]) => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [isClient, storageKey]);

  const clearMessages = useCallback(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, [isClient, storageKey]);

  const clearAllChats = useCallback(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      // Clear all chat storage keys (for all planets)
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('chat_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all chat history:', error);
    }
  }, [isClient]);

  return {
    getStoredMessages,
    saveMessages,
    clearMessages,
    clearAllChats,
    isClient
  };
}