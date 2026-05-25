"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useState } from "react";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)]">
          <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
          <ChatWindow chatId={selectedChat} />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}