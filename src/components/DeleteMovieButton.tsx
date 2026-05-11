"use client";

import { useTransition } from "react";
import { deleteMovie } from "@/src/lib/actions/movies";

export default function DeleteMovieButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(() => { deleteMovie(id); });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 hover:border-red-700 hover:text-red-400 disabled:opacity-50 transition-colors"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
