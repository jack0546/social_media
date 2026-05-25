"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Phone, Video, Clock, ArrowUpRight } from "lucide-react";

export default function CallsPage() {
  const calls = [
    { id: 1, name: "Alex Johnson", type: "outgoing", duration: "12:30", time: "Today, 2:30 PM" },
    { id: 2, name: "Sarah Wilson", type: "incoming", duration: "5:15", time: "Today, 11:45 AM" },
    { id: 3, name: "Mike Chen", type: "missed", duration: "-", time: "Yesterday, 8:20 PM" },
    { id: 4, name: "Emma Davis", type: "outgoing", duration: "1:45:22", time: "Yesterday, 6:15 PM" },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Call History</h1>
          <div className="space-y-4">
            {calls.map(call => (
              <div key={call.id} className="glass-dark rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full">
                    {call.type === "missed" ? (
                      <Phone className="w-6 h-6 text-red-400" />
                    ) : (
                      <Video className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{call.name}</p>
                    <p className="text-sm text-gray-400">{call.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${
                    call.type === "missed" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {call.type === "missed" ? "Missed" : call.duration}
                  </span>
                  <button className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg">
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}