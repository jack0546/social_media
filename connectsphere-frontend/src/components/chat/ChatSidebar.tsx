"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, setDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, MessageCircle, Video } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { userProfile } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    if (searchTerm.trim() && showUserSearch) {
      const searchQuery = query(
        collection(db, "users"),
        where("username", ">=", searchTerm.toLowerCase()),
        where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
        limit(20)
      );
      
      const unsub = onSnapshot(searchQuery, (snapshot) => {
        const usersData = snapshot.docs
          .filter(doc => doc.id !== userProfile?.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];
        setUsers(usersData);
      }, () => {});

      return () => unsub();
    }
  }, [searchTerm, showUserSearch, userProfile?.uid]);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startChat = async (userId: string) => {
    if (!userProfile?.uid) return;
    
    const existingChat = chats.find(chat => 
      chat.participants.includes(userId) && !chat.isGroup
    );
    
    if (existingChat) {
      onSelectChat(existingChat.id);
      setShowUserSearch(false);
      setSearchTerm("");
      return;
    }

    const chatRef = doc(collection(db, "chats"));
    await setDoc(chatRef, {
      participants: [userProfile.uid, userId],
      isGroup: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null
    });

    onSelectChat(chatRef.id);
    setShowUserSearch(false);
    setSearchTerm("");
  };

  const startVideoCall = (userId: string) => {
    router.push(`/video-call?calleeId=${userId}&initiator=true`);
  };

  return (
    <div className="w-full md:w-80 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chats</h2>
          <button 
            onClick={() => setShowUserSearch(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowUserSearch(true)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showUserSearch && searchTerm.trim() ? (
          users.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No users found. Try another search.
            </div>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition"
              >
                <div className="relative">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=6366f1&color=fff`}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{user.displayName || user.username}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startChat(user.id)}
                    className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg"
                    title="Send message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startVideoCall(user.id)}
                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg"
                    title="Video call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No chats yet. Search for users to start chatting!
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
          )
        )}
      </div>
    </div>
  );
}