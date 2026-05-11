"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/src/lib/actions/auth";
import type { SessionPayload } from "@/src/lib/auth";

type Props = { session: SessionPayload | null };

function NavLink({
  href,
  children,
  prefetch = true,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        active ? "text-white" : "text-zinc-400 hover:text-white"
      } ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export default function NavBar({ session }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        <NavLink href="/movies">Movies</NavLink>
        <NavLink href="/about">About</NavLink>

        {session ? (
          <>
            {session.role === "admin" && (
              <NavLink
                href="/admin"
                className="!text-indigo-400 hover:!text-indigo-300"
              >
                Admin Panel
              </NavLink>
            )}
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <form action={logoutUser}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <NavLink href="/login">Login</NavLink>
            <Link
              href="/register"
              prefetch
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center gap-1.5 p-2 text-zinc-400 hover:text-white"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-col gap-4 md:hidden">
          <NavLink href="/movies" onClick={close}>Movies</NavLink>
          <NavLink href="/about" onClick={close}>About</NavLink>

          {session ? (
            <>
              {session.role === "admin" && (
                <NavLink href="/admin" onClick={close} className="!text-indigo-400">
                  Admin Panel
                </NavLink>
              )}
              <NavLink href="/dashboard" onClick={close}>Dashboard</NavLink>
              <NavLink href="/profile" onClick={close}>Profile</NavLink>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <NavLink href="/login" onClick={close}>Login</NavLink>
              <Link
                href="/register"
                prefetch
                onClick={close}
                className="inline-flex w-fit rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
