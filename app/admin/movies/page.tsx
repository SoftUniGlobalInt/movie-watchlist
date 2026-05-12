import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/db";
import { movies } from "@/src/db/schema";
import { ilike, or, count, asc } from "drizzle-orm";
import DeleteMovieButton from "@/src/components/DeleteMovieButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Movies" };

const PAGE_SIZE = 15;

async function getMovies(q: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  const where = q
    ? or(ilike(movies.title, `%${q}%`), ilike(movies.director, `%${q}%`), ilike(movies.genre, `%${q}%`))
    : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(movies).where(where).orderBy(asc(movies.title)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(movies).where(where),
  ]);
  return { rows, total };
}

export default async function AdminMoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total } = await getMovies(q.trim(), page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/movies?${params}`;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Movies</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total} {total === 1 ? "movie" : "movies"}{q ? ` matching "${q}"` : ""}
          </p>
        </div>
        <Link
          href="/admin/movies/new"
          prefetch
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          + Add Movie
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div className="flex gap-2 max-w-md">
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search title, director or genre…"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Search
          </button>
          {q && (
            <Link href="/admin/movies" className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              ✕
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 py-16 text-center">
          <p className="text-zinc-500 text-sm">No movies found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left">Poster</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Genre</th>
                <th className="px-4 py-3 text-left">Director</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {rows.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative isolate h-12 w-8 overflow-hidden rounded-md bg-zinc-800">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          sizes="32px"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-600">🎬</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    <Link href={`/movies/${movie.slug}`} prefetch className="hover:text-indigo-300 transition-colors" target="_blank">
                      {movie.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{movie.year}</td>
                  <td className="px-4 py-3 text-zinc-400">{movie.genre}</td>
                  <td className="px-4 py-3 text-zinc-400">{movie.director}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        prefetch
                        className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 hover:border-indigo-600 hover:text-indigo-300 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteMovieButton id={movie.id} title={movie.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
              ← Previous
            </Link>
          )}
          <span className="px-4 text-sm text-zinc-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
