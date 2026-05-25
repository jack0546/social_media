"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}