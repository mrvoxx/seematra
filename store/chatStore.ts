// store/chatStore.ts
import { create } from 'zustand';
import { IItinerary } from '@/types';

export interface ChatResult {
  title: string;
  price: number;
  duration: string;
  thumbnail: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  results?: ChatResult[];
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (v: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  setTyping: (v) => set({ isTyping: v }),
  clearChat: () => set({ messages: [] }),
}));
