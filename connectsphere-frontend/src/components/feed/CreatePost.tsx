"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Image as ImageIcon, Send, X } from "lucide-react";
import { motion } from "framer-motion";

export default function CreatePost() {
  const { userProfile } = useAuth();
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;

    setIsPosting(true);
    try {
      let imageUrl = "";
      if (selectedImage) {
        // In production, upload to Firebase Storage
        imageUrl = imagePreview || "";
      }

      await addDoc(collection(db, "posts"), {
        userId: userProfile?.uid,
        text: text.trim(),
        media: imageUrl ? [imageUrl] : [],
        likes: [],
        comments: [],
        shares: 0,
        createdAt: serverTimestamp(),
      });

      setText("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-4 mb-6"
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none mb-4"
          rows={3}
        />

        {imagePreview && (
          <div className="relative mb-4">
            <img src={imagePreview} alt="Preview" className="rounded-xl max-h-64 object-cover" />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="submit"
            disabled={isPosting || (!text.trim() && !selectedImage)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isPosting ? "Posting..." : "Post"}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}