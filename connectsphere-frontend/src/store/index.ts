import { create } from 'zustand';

interface UIState {
  isMobile: boolean;
  theme: 'light' | 'dark';
  setIsMobile: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobile: false,
  theme: 'dark',
  setIsMobile: (value) => set({ isMobile: value }),
  setTheme: (theme) => set({ theme }),
}));

interface ChatState {
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  setActiveChat: (chatId) => set({ activeChat: chatId }),
}));