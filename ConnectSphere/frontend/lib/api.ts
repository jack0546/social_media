import type { User } from '../types';

// Base URL for the backend API
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

/**
 * Makes a fetch request to the backend
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with parsed JSON response
 */
async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'An error occurred');
  }

  return res.json();
}

// Auth API
export const authAPI = {
  register: (userData: { email: string; password: string; username: string; phoneNumber?: string }) =>
    fetcher<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials: { email: string; password: string }) =>
    fetcher<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  googleAuth: (token: string) =>
    fetcher<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  phoneAuth: (phoneNumber: string) =>
    fetcher<{ message: string }>('/auth/phone-auth', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),
  verifyOtp: (phoneNumber: string, otp: string) =>
    fetcher<{ token: string; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    }),
  forgotPassword: (email: string) =>
    fetcher<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (oobCode: string, newPassword: string) =>
    fetcher<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ oobCode, newPassword }),
    }),
  verifyEmail: (oobCode: string) =>
    fetcher<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ oobCode }),
    }),
};

// User API
export const userAPI = {
  getProfile: (userId: string) => fetcher<{ user: User }>(`/users/profile/${userId}`),
  updateProfile: (userId: string, data: Partial<User>) =>
    fetcher<{ message: string }>(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getOnlineUsers: () => fetcher<{ users: User[] }>('/users/online'),
  searchUsers: (query: string) => fetcher<{ users: User[] }>(`/users/search?query=${query}`),
};

// Chat API
export const chatAPI = {
  getChats: () => fetcher<{ chats: Chat[] }>('/chats'),
  getChat: (chatId: string) => fetcher<{ chat: Chat }>(`/chats/${chatId}`),
  createChat: (userIds: string[]) =>
    fetcher<{ chat: Chat }>('/chats', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    }),
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'video' | 'file') =>
    fetcher<{ message: Message }>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    }),
  // ... more chat APIs
};

// Post API
export const postAPI = {
  getPosts: (page = 1, limit = 10) =>
    fetcher<{ posts: Post[]; totalPages: number }>(`/posts?page=${page}&limit=${limit}`),
  createPost: (data: FormData) =>
    fetcher<{ post: Post }>('/posts', {
      method: 'POST',
      body: data,
      headers: {}, // Let the browser set the content-type for FormData
    }),
  likePost: (postId: string) =>
    fetcher<{ message: string }>(`/posts/${postId}/like`, {
      method: 'POST',
    }),
  // ... more post APIs
};

// Call API
export const callAPI = {
  initiateCall: (data: { userToCall: string; type: 'audio' | 'video' }) =>
    fetcher<{ callId: string }>('/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  endCall: (callId: string) =>
    fetcher<{ message: string }>(`/calls/${callId}`, {
      method: 'DELETE',
    }),
  // ... more call APIs
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    fetcher<{ notifications: Notification[] }>('/notifications'),
  markAsRead: (notificationId: string) =>
    fetcher<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),
  // ... more notification APIs
};

// Admin API (protected)
export const adminAPI = {
  getUsers: () =>
    fetcher<{ users: User[] }>('/admin/users', {
      // This route should be protected by admin middleware in the backend
    }),
  banUser: (userId: string) =>
    fetcher<{ message: string }>(`/admin/users/${userId}/ban`, {
      method: 'POST',
    }),
  // ... more admin APIs
};

// Types (simplified, in a real app these would be in a separate types file)
export interface User {
  uid: string;
  email: string;
  username: string;
  photoURL?: string;
  bio?: string;
  online?: boolean;
  lastSeen?: Date;
  // ... other fields
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  groupName?: string;
  groupPhoto?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'voice';
  timestamp: Date;
  readBy: string[]; // userIds who have read the message
  // ... other fields like reactions, etc.
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[]; // URLs to images/videos
  likes: string[]; // userIds who liked the post
  comments: Comment[]; // embedded or reference
  createdAt: Date;
  // ... other fields
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string; // for notifications from other users
  type: 'message' | 'friendRequest' | 'like' | 'comment' | 'call' | 'system';
  content: string;
  isRead: boolean;
  createdAt: Date;
  // ... other fields like relatedId (postId, chatId, etc.)
}