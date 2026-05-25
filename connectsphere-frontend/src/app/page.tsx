"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Video, Users, Shield, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  const features = [
    { icon: MessageCircle, title: "Real-time Messaging", desc: "Chat instantly with friends and groups" },
    { icon: Video, title: "Video & Voice Calls", desc: "HD quality calls with WebRTC" },
    { icon: Users, title: "Social Feed", desc: "Share moments and connect with others" },
    { icon: Shield, title: "End-to-End Encrypted", desc: "Your conversations stay private" },
    { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and reliability" },
    { icon: Globe, title: "Global Community", desc: "Connect with people worldwide" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white">ConnectSphere</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-white hover:text-purple-300 transition">Login</Link>
          <Link href="/register" className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">Sign Up</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Connect, Chat, Call — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              All in One Place
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Experience the future of social communication with real-time messaging, HD video calls, and a thriving community.
          </p>
          <Link href="/register" className="inline-block px-10 py-4 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition transform hover:scale-105">
            Get Started Free
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-dark p-6 rounded-2xl"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}