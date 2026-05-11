"use client";

import { useTransition } from "react";
import { logoutUser } from "@/src/lib/actions/auth";
import type { SessionPayload } from "@/src/lib/auth";

type Props = {
  session: SessionPayload;
  watchlistCount: number;
  watchedCount: number;
};

export default function UserProfile({ session, watchlistCount, watchedCount }: Props) {
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutUser();
    });
  }

  return (
    <div className="space-y-8">
      {/* Avatar + name */}
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-700 text-2xl font-bold text-white">
          {session.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{session.name}</h2>
          <p className="text-sm text-zinc-400">{session.email}</p>
          <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 capitalize">
            {session.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
          <p className="text-3xl font-bold text-white">{watchlistCount}</p>
          <p className="mt-1 text-sm text-zinc-400">On watchlist</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{watchedCount}</p>
          <p className="mt-1 text-sm text-zinc-400">Watched</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleLogout}
          disabled={pending}
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-red-700 hover:text-red-400 disabled:opacity-60 transition-colors"
        >
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
