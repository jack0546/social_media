"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus } from "lucide-react";

interface Chat {
  id: string;
  name?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  isGroup?: boolean;
}

interface User {
  id: string;
  displayName: string;
  photoURL: string;
  username: string;
  isOnline?: boolean;
}

export default function ChatSidebar({ 
  onSelectChat, 
  selectedChat 
}: { 
  onSelectChat: (chatId: string | null) => void;
  selectedChat: string | null;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userProfile.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatsData);
    });

    return () => unsub();
  }, [userProfile?.uid]);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chats</h2>
          <button className="p-2 text-gray-400 hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No chats yet. Start a conversation!
          </div>
        ) : (
          filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition ${
                selectedChat === chat.id ? "bg-purple-500/20" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.isGroup ? "/group-avatar.png" : "/user-avatar.png"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{chat.name || "Chat"}</p>
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}