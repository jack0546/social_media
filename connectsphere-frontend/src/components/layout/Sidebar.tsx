"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageCircle, 
  Video, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/chat", icon: MessageCircle, label: "Chats" },
  { href: "/calls", icon: Video, label: "Calls" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, userProfile, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-gray-800 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">ConnectSphere</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.displayName || "User")}`}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{userProfile?.displayName || "User"}</p>
            <p className="text-sm text-gray-400 truncate">@{userProfile?.username || "user"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}