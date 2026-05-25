"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Users, UserPlus, Search, Check, X } from "lucide-react";
import { useState } from "react";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "suggestions">("friends");
  
  const friends = [
    { id: 1, name: "Alex Johnson", username: "alex.j", mutual: 12, online: true },
    { id: 2, name: "Sarah Wilson", username: "sarah.w", mutual: 8, online: false },
    { id: 3, name: "Mike Chen", username: "mike.c", mutual: 15, online: true },
  ];

  const requests = [
    { id: 1, name: "Emma Davis", username: "emma.d", mutual: 5 },
    { id: 2, name: "John Smith", username: "john.s", mutual: 3 },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Friends</h1>

          <div className="flex gap-2 mb-6">
            {["friends", "requests", "suggestions"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "friends" && (
            <div className="space-y-4">
              {friends.map(friend => (
                <div key={friend.id} className="glass-dark rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src="/user-avatar.png" alt={friend.name} className="w-12 h-12 rounded-full" />
                      {friend.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{friend.name}</p>
                      <p className="text-sm text-gray-400">@{friend.username} · {friend.mutual} mutual friends</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="glass-dark rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/user-avatar.png" alt={request.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-medium text-white">{request.name}</p>
                      <p className="text-sm text-gray-400">@{request.username} · {request.mutual} mutual friends</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}