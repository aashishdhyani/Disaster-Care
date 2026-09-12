import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Toaster from "@/components/Toaster";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DisasterCare — Emergency Management",
  description:
    "A rapid-response emergency management platform: send SOS alerts, manage emergency contacts, locate nearby help, and support disaster relief NGOs.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          DisasterCare — built for rapid emergency response. Not a substitute
          for official emergency services.
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
