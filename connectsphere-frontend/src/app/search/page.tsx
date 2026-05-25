"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Search, User } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    // In production, call API to search users
    setResults([]);
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Search</h1>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search users, posts, hashtags..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {loading && <p className="text-gray-400">Searching...</p>}

          {!loading && results.length === 0 && query && (
            <p className="text-gray-400">No results found</p>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}