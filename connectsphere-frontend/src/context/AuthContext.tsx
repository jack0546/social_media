"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  bio: string;
  phone: string;
  isOnline: boolean;
  lastSeen: unknown;
  isVerified: boolean;
  role: "user" | "admin";
  followers: string[];
  following: string[];
  blockedUsers: string[];
  createdAt: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

const createUserDoc = async (user: User, extra: Partial<UserProfile> = {}) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const username =
      extra.username ||
      (user.displayName?.toLowerCase().replace(/\s+/g, "") ?? "") +
        Math.floor(Math.random() * 999);
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || extra.displayName || "ConnectSphere User",
      email: user.email,
      photoURL:
        user.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=6366f1&color=fff&size=200`,
      username,
      bio: "",
      phone: user.phoneNumber || "",
      isOnline: true,
      lastSeen: serverTimestamp(),
      isVerified: false,
      role: "user",
      followers: [],
      following: [],
      blockedUsers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setUserProfile(snap.data() as UserProfile);
        const token = await firebaseUser.getIdToken();
        connectSocket(token);
      } else {
        setUserProfile(null);
        disconnectSocket();
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await createUserDoc(cred.user);
      toast.success("Welcome back!");
      router.push("/chat");
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.message || "Login failed";
      toast.error(message);
      throw error;
    }
  }, [router]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await createUserDoc(cred.user, { displayName: name });
        await sendEmailVerification(cred.user);
        toast.success("Account created! Check your email to verify.");
        router.push("/chat");
      } catch (error: any) {
        console.error("Register error:", error);
        const message = error.message || "Registration failed";
        toast.error(message);
        throw error;
      }
    },
    [router]
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await createUserDoc(cred.user);
      toast.success(`Welcome, ${cred.user.displayName}!`);
      router.push("/chat");
    } catch (error: any) {
      console.error("Google login error:", error);
      const message = error.message || "Google login failed";
      toast.error(message);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent!");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, login, register, loginWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
