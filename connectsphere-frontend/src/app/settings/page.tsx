"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Bell, Shield, Moon, Sun, Globe, Smartphone, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: Bell, label: "Notifications", desc: "Manage notification preferences" },
        { icon: Shield, label: "Privacy & Safety", desc: "Control your privacy settings" },
        { icon: Globe, label: "Language", desc: "English (US)" },
      ],
    },
    {
      title: "Appearance",
      items: [
        { 
          icon: theme === "dark" ? Moon : Sun, 
          label: "Theme", 
          desc: theme === "dark" ? "Dark Mode" : "Light Mode",
          action: () => setTheme(theme === "dark" ? "light" : "dark")
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", desc: "Get help with ConnectSphere" },
        { icon: Smartphone, label: "Download Mobile App", desc: "Get the React Native app" },
      ],
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

          {settingsSections.map(section => (
            <div key={section.title} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-300 mb-4">{section.title}</h2>
              <div className="glass-dark rounded-xl overflow-hidden">
                {section.items.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition ${
                      i !== section.items.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={logout}
            className="w-full p-4 glass-dark text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition"
          >
            Log Out
          </button>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}