"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface PostProps {
  post: {
    id: string;
    text: string;
    media: string[];
    userId: string;
    createdAt: any;
    likes: string[];
    comments: string[];
    user?: {
      displayName: string;
      username: string;
      photoURL: string;
    };
  };
}

export default function PostCard({ post }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.displayName || "User")}`}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-white">{post.user?.displayName || "User"}</p>
            <p className="text-sm text-gray-400">@{post.user?.username || "user"} · {formatTime(post.createdAt)}</p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {post.text && <p className="text-white mb-3">{post.text}</p>}

      {post.media && post.media.length > 0 && (
        <img
          src={post.media[0]}
          alt="Post media"
          className="rounded-xl mb-3 w-full object-cover max-h-96"
        />
      )}

      <div className="flex items-center gap-6 pt-2 border-t border-white/10">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 ${liked ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}