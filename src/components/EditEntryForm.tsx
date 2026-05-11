"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { updateWatchlistEntry } from "@/src/lib/actions/watchlist";

type Props = {
  entry: {
    id: number;
    status: string;
    rating: number | null;
    review: string | null;
    movie: {
      title: string;
      year: number;
      genre: string;
      director: string;
      posterUrl: string | null;
    };
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function EditEntryForm({ entry }: Props) {
  const [state, action] = useActionState(updateWatchlistEntry, {});

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2.5 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <input type="hidden" name="entryId" value={entry.id} />

      {/* Movie card */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          {entry.movie.posterUrl ? (
            <Image
              src={entry.movie.posterUrl}
              alt={entry.movie.title}
              fill
              sizes="44px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xl text-zinc-600">🎬</div>
          )}
        </div>
        <div>
          <p className="font-semibold text-white">{entry.movie.title}</p>
          <p className="text-xs text-zinc-500">{entry.movie.year} · {entry.movie.genre} · {entry.movie.director}</p>
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-zinc-300">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={entry.status}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="to_watch">To Watch</option>
          <option value="watching">Watching</option>
          <option value="watched">Watched</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="rating" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Rating <span className="text-zinc-500">(1–10, optional)</span>
        </label>
        <input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={10}
          defaultValue={entry.rating ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. 8"
        />
      </div>

      {/* Review */}
      <div>
        <label htmlFor="review" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Review <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="review"
          name="review"
          rows={3}
          defaultValue={entry.review ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          placeholder="What did you think?"
        />
      </div>

      <div className="flex gap-3">
        <SubmitButton />
        <Link
          href="/dashboard"
          prefetch
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
