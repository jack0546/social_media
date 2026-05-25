"use client";

import { useState, useRef, useEffect } from "react";
import { collection, query, where, orderBy, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Send, Paperclip, Smile, Phone, Video as VideoIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  type?: string;
}

export default function ChatWindow({ chatId }: { chatId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { userProfile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    await addDoc(collection(db, "messages"), {
      chatId,
      text: newMessage.trim(),
      senderId: userProfile?.uid,
      type: "text",
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Select a chat</h3>
          <p className="text-gray-400">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/user-avatar.png"
            alt="Chat partner"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-white">Chat Partner</p>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white">
            <VideoIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isOwn = msg.senderId === userProfile?.uid;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isOwn
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-gray-400 hover:text-white">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}