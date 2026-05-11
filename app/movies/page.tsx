import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/db";
import { movies } from "@/src/db/schema";
import { desc, count } from "drizzle-orm";

export const metadata = { title: "Movies" };

const PAGE_SIZE = 12;

async function getMovies(page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(movies).orderBy(desc(movies.createdAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(movies),
  ]);
  return { rows, total };
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total } = await getMovies(page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">All Movies</h1>
        <p className="mt-1 text-zinc-500">{total} movies in the library</p>
      </div>

      {rows.length === 0 ? (
        <p className="py-20 text-center text-zinc-500">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.slug}`}
              prefetch
              className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-600/60 transition-colors"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-zinc-600">🎬</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-white line-clamp-1">{movie.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{movie.year} · {movie.genre}</p>
                <p className="mt-1 text-xs text-zinc-600">{movie.director}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/movies?page=${page - 1}`} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
              ← Previous
            </Link>
          )}
          <span className="px-4 text-sm text-zinc-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/movies?page=${page + 1}`} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
