import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "HealthLink UCSD",
  description: "Join the HealthLink community at UC San Diego. Explore events, build together, and connect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-4 left-3 right-3 z-50 flex justify-center">
          <nav aria-label="Main navigation" className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm font-semibold text-white bg-slate-950/90 px-4 py-2 rounded-3xl border border-white/10 backdrop-blur-md">
            <Link href="/">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/ideation">Ideation</Link>
            <Link href="/team">Team</Link>
            <Link href="/checkin">Check In</Link>
          </nav>
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
