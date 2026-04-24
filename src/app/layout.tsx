import "./globals.css";
import type { Metadata } from "next";
import { VisitorBadge } from "@/components/VisitorBadge";

export const metadata: Metadata = { title: "Decidr", description: "Decision Intelligence Engine" };

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
