import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { eq, avg, count, and } from "drizzle-orm";
import { getSession } from "@/src/lib/auth";
import { addToWatchlist } from "@/src/lib/actions/watchlist";
import type { Metadata } from "next";

async function getMovie(slug: string) {
  const [movie] = await db.select().from(movies).where(eq(movies.slug, slug)).limit(1);
  return movie ?? null;
}

async function getMovieStats(movieId: number) {
  const [stats] = await db
    .select({ avgRating: avg(userMovies.rating), totalRatings: count(userMovies.rating), totalWatched: count() })
    .from(userMovies)
    .where(eq(userMovies.movieId, movieId));
  return stats;
}

export async function generateStaticParams() {
  const all = await db.select({ slug: movies.slug }).from(movies);
  return all.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return {};
  return { title: movie.title, description: movie.description.slice(0, 155) };
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [movie, session] = await Promise.all([getMovie(slug), getSession()]);
  if (!movie) notFound();

  // Thin wrapper: form action only allows void return; addToWatchlist may redirect on success.
  async function addMovieAction(formData: FormData) {
    "use server";
    await addToWatchlist({}, formData);
  }

  const stats = await getMovieStats(movie.id);
  const avgRating = stats.avgRating ? parseFloat(String(stats.avgRating)).toFixed(1) : null;

  // Check if this movie is already on the logged-in user's watchlist
  let alreadyAdded = false;
  if (session) {
    const [existing] = await db
      .select({ id: userMovies.id })
      .from(userMovies)
      .where(and(eq(userMovies.userId, session.userId), eq(userMovies.movieId, movie.id)))
      .limit(1);
    alreadyAdded = Boolean(existing);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/movies" prefetch className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
        ← Back to Movies
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        {/* Poster */}
        <div className="w-full sm:w-64 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl shadow-black/60">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 90vw, 256px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-zinc-600">🎬</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-indigo-900/50 border border-indigo-700/40 px-3 py-1 text-xs font-medium text-indigo-300">{movie.genre}</span>
            <span className="rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400">{movie.year}</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight">{movie.title}</h1>
          <p className="mt-2 text-zinc-500 text-sm">Directed by <span className="text-zinc-300">{movie.director}</span></p>

          {avgRating && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-white font-bold text-xl">{avgRating}</span>
              <span className="text-zinc-500 text-sm">/ 10 · {stats.totalRatings} {Number(stats.totalRatings) === 1 ? "rating" : "ratings"}</span>
            </div>
          )}

          <p className="mt-6 text-zinc-300 leading-relaxed">{movie.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.totalWatched}</p>
              <p className="mt-0.5 text-xs text-zinc-500">On watchlists</p>
            </div>
            {avgRating && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">★ {avgRating}</p>
                <p className="mt-0.5 text-xs text-zinc-500">Avg rating</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            {!session ? (
              <Link
                href={`/login?from=/movies/${slug}`}
                prefetch
                className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Add to Watchlist
              </Link>
            ) : alreadyAdded ? (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-green-900/40 border border-green-700/50 px-6 py-2.5 text-sm font-semibold text-green-300">
                  ✓ On your watchlist
                </span>
                <Link
                  href="/dashboard"
                  prefetch
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <form action={addMovieAction}>
                <input type="hidden" name="movieId" value={movie.id} />
                <input type="hidden" name="status" value="to_watch" />
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Add to Watchlist
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
