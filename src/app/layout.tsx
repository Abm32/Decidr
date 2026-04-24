import "./globals.css";
import type { Metadata } from "next";
import { VisitorBadge } from "@/components/VisitorBadge";

export const metadata: Metadata = {
  title: "Decidr — Decision Intelligence Engine",
  description: "See your future before you decide. AI-powered scenario generation, immersive audio narration, and conversational future selves.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Decidr — See your future before you decide",
    description: "AI-powered decision intelligence. Generate, narrate, and interact with multiple possible futures.",
    siteName: "Decidr",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {children}
        <VisitorBadge />
      </body>
    </html>
  );
}
