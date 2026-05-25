"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Video, Users, User } from "lucide-react";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/chat", icon: MessageCircle, label: "Chats" },
  { href: "/calls", icon: Video, label: "Calls" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 py-3">
      <ul className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                  isActive ? "text-purple-400" : "text-gray-400"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}