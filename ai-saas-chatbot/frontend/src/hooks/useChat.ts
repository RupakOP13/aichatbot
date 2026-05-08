import { useState, useCallback } from 'react';
import { Chat, Message } from '../types';

export const useChat = (initialChat: Chat | null = null) => {
  const [chat, setChat] = useState<Chat | null>(initialChat);
  const [loading, setLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setChat(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
        messageCount: prev.messages.length + 1
      };
    });
  }, []);

  const updateChat = useCallback((updatedChat: Chat) => {
    setChat(updatedChat);
  }, []);

  const rateMessage = useCallback((messageIndex: number, rating: 'like' | 'dislike') => {
    setChat(prev => {
      if (!prev || !prev.messages[messageIndex]) return prev;
      const updatedMessages = [...prev.messages];
      // Toggle: same rating removes it, different rating sets it
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        rating: updatedMessages[messageIndex].rating === rating ? null : rating
      };
      return { ...prev, messages: updatedMessages };
    });
  }, []);

  return { chat, loading, setLoading, addMessage, updateChat, rateMessage };
};
