"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import PostCard from "@/components/feed/PostCard";
import CreatePost from "@/components/feed/CreatePost";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  text: string;
  media: string[];
  userId: string;
  createdAt: any;
  likes: string[];
  comments: string[];
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <CreatePost />
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}