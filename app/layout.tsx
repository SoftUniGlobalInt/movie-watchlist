import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getSession } from "@/src/lib/auth";
import NavBar from "@/src/components/NavBar";
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
  title: { default: "MovieList", template: "%s | MovieList" },
  description: "Track the movies you want to watch, are watching, and have watched.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased">
        <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
          <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link
              href="/"
              prefetch
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors"
            >
              <span className="text-indigo-400" aria-hidden>🎬</span>
              MovieList
            </Link>
            <NavBar session={session} />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} MovieList — Track what you watch.</p>
            <nav className="flex gap-5">
              <Link href="/movies" className="hover:text-zinc-300 transition-colors">Movies</Link>
              <Link href="/about" className="hover:text-zinc-300 transition-colors">About</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
