"use client";

import React, { createContext, useContext, useState } from 'react';
import { Friend } from '@/components/features/foodies/FriendRow';

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  activeFriend: Friend | null;
  setActiveFriend: (friend: Friend | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen, activeFriend, setActiveFriend }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
