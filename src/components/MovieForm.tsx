"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { MovieActionState } from "@/src/lib/actions/movies";

type Movie = {
  id: number;
  title: string;
  description: string;
  year: number;
  director: string;
  genre: string;
  posterUrl: string | null;
};

type Props = {
  action: (prev: MovieActionState, formData: FormData) => Promise<MovieActionState>;
  movie?: Movie;
};

const GENRES = ["Action", "Crime", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller", "Comedy", "Animation", "Documentary", "Other"];

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create movie"}
    </button>
  );
}

export default function MovieForm({ action, movie }: Props) {
  const [state, formAction] = useActionState(action, {});
  const isEdit = Boolean(movie);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.error && (
        <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2.5 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {isEdit && <input type="hidden" name="id" value={movie!.id} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={movie?.title}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Inception"
          />
        </div>

        <div>
          <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Year <span className="text-red-400">*</span>
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min={1888}
            max={new Date().getFullYear() + 2}
            defaultValue={movie?.year}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. 2010"
          />
        </div>

        <div>
          <label htmlFor="genre" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Genre <span className="text-red-400">*</span>
          </label>
          <select
            id="genre"
            name="genre"
            required
            defaultValue={movie?.genre ?? ""}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="" disabled>Select genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="director" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Director <span className="text-red-400">*</span>
          </label>
          <input
            id="director"
            name="director"
            type="text"
            required
            defaultValue={movie?.director}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Christopher Nolan"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            defaultValue={movie?.description}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="Brief synopsis…"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="posterUrl" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Poster URL <span className="text-zinc-500">(optional)</span>
          </label>
          <input
            id="posterUrl"
            name="posterUrl"
            type="url"
            defaultValue={movie?.posterUrl ?? ""}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://image.tmdb.org/t/p/w500/…"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton isEdit={isEdit} />
        <Link
          href="/admin/movies"
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
