"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { addToWatchlist } from "@/src/lib/actions/watchlist";

type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  director: string;
  posterUrl: string | null;
};

type Props = { movies: Movie[] };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
    >
      {pending ? "Adding…" : "Add to Watchlist"}
    </button>
  );
}

export default function AddMovieForm({ movies }: Props) {
  const [state, action] = useActionState(addToWatchlist, {});
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
  const selected = movies.find((m) => m.id === selectedId) ?? null;

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2.5 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <input type="hidden" name="movieId" value={selectedId ?? ""} />

      {/* Search */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">Search movie</label>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
          placeholder="Type a title…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Results */}
      {search.length > 0 && !selected && (
        <ul className="max-h-64 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-800/80 divide-y divide-zinc-700/60 backdrop-blur">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">No movies found.</li>
          ) : (
            filtered.map((movie) => (
              <li key={movie.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(movie.id); setSearch(movie.title); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-700/60 transition-colors"
                >
                  <div className="relative isolate h-10 w-7 flex-shrink-0 overflow-hidden rounded bg-zinc-700">
                    {movie.posterUrl ? (
                      <Image src={movie.posterUrl} alt={movie.title} fill sizes="28px" className="object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm text-zinc-500">🎬</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{movie.title}</p>
                    <p className="text-xs text-zinc-400">{movie.year} · {movie.genre}</p>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Selected card */}
      {selected && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-700/60 bg-indigo-900/20 p-3">
          <div className="relative isolate h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-zinc-700">
            {selected.posterUrl ? (
              <Image src={selected.posterUrl} alt={selected.title} fill sizes="32px" className="object-cover" loading="lazy" />
            ) : (
              <span className="flex h-full items-center justify-center text-sm text-zinc-500">🎬</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{selected.title}</p>
            <p className="text-xs text-zinc-400">{selected.year} · {selected.genre} · {selected.director}</p>
          </div>
          <button type="button" onClick={() => { setSelectedId(null); setSearch(""); }} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">✕</button>
        </div>
      )}

      {/* Status */}
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-zinc-300">Status</label>
        <select
          id="status"
          name="status"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="to_watch">To Watch</option>
          <option value="watching">Watching</option>
          <option value="watched">Watched</option>
        </select>
      </div>

      <SubmitButton />
    </form>
  );
}
