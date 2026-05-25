"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { Edit, MapPin, Link as LinkIcon, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-b-3xl"></div>
          
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <img
                src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.displayName || "User")}`}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-900"
              />
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{userProfile?.displayName || "User"}</h1>
                <p className="text-gray-400">@{userProfile?.username || "username"}</p>
              </div>
              <button className="px-4 py-2 glass-dark text-white rounded-lg hover:bg-white/20 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <p className="text-white mb-4">{userProfile?.bio || "No bio yet"}</p>

            <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> San Francisco
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> portfolio.com
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Joined Jan 2024
              </span>
            </div>

            <div className="flex gap-6 mb-6">
              <span className="text-white"><strong>156</strong> Following</span>
              <span className="text-white"><strong>2.4K</strong> Followers</span>
            </div>

            <div className="glass-dark rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Posts</h2>
              <p className="text-gray-400 text-center py-8">No posts yet</p>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}