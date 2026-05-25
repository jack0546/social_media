"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Heart, MessageCircle, UserPlus, Phone, Video } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: "like", user: "Alex Johnson", time: "2 minutes ago", icon: Heart },
    { id: 2, type: "comment", user: "Sarah Wilson", time: "15 minutes ago", icon: MessageCircle },
    { id: 3, type: "follow", user: "Mike Chen", time: "1 hour ago", icon: UserPlus },
    { id: 4, type: "call", user: "Emma Davis", time: "2 hours ago", icon: Phone },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Notifications</h1>
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className="glass-dark rounded-xl p-4 flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  notif.type === "like" ? "bg-red-500/20" :
                  notif.type === "comment" ? "bg-purple-500/20" :
                  notif.type === "follow" ? "bg-green-500/20" : "bg-blue-500/20"
                }`}>
                  <notif.icon className={`w-5 h-5 ${
                    notif.type === "like" ? "text-red-400" :
                    notif.type === "comment" ? "text-purple-400" :
                    notif.type === "follow" ? "text-green-400" : "text-blue-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-semibold">{notif.user}</span>
                    {notif.type === "like" ? " liked your post" :
                     notif.type === "comment" ? " commented on your post" :
                     notif.type === "follow" ? " started following you" : " called you"}
                  </p>
                  <p className="text-sm text-gray-400">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}