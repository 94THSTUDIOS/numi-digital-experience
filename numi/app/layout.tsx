import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./game.css"; // Moved here to avoid Tailwind v4 PostCSS resolver crash

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numi — Make Learning Math Fun",
  description: "Numi uses smart camera hand tracking to help kids ages 2–7 count, explore numbers, and solve simple math problems just by holding up their hands.",
  icons: {
    icon: "/images/logo.svg",
  },
};

import { AudioProvider } from "@/components/AudioContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
