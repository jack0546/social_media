import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ConnectSphere — Social Media & Chat",
  description:
    "ConnectSphere is a modern social media and real-time communication platform. Connect with friends, chat, make voice/video calls, and share your moments.",
  keywords: ["social media", "chat", "video calls", "ConnectSphere"],
  openGraph: {
    title: "ConnectSphere",
    description: "Connect, Chat, Call — All in One Place",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
