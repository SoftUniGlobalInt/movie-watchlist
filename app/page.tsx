import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { desc } from "drizzle-orm";

export const revalidate = 600;

async function getRecentlyAddedMovies() {
  return db
    .select({
      id: movies.id,
      title: movies.title,
      slug: movies.slug,
      genre: movies.genre,
      year: movies.year,
      director: movies.director,
      posterUrl: movies.posterUrl,
    })
    .from(movies)
    .orderBy(desc(movies.createdAt))
    .limit(8);
}

async function getPublicFeedStats() {
  const all = await db.select({ status: userMovies.status }).from(userMovies);
  return {
    watched: all.filter((e) => e.status === "watched").length,
    watching: all.filter((e) => e.status === "watching").length,
    toWatch: all.filter((e) => e.status === "to_watch").length,
  };
}

export default async function HomePage() {
  const [recentMovies, stats] = await Promise.all([
    getRecentlyAddedMovies(),
    getPublicFeedStats(),
  ]);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-indigo-950/60 to-zinc-950 py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Your personal cinema
          </p>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Track every film<br />
            <span className="text-indigo-400">you love</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-400 leading-relaxed">
            Build your watchlist, rate what you&apos;ve seen, and discover what others are watching — all in one place.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              prefetch
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-colors"
            >
              Get Started — it&apos;s free
            </Link>
            <Link
              href="/movies"
              prefetch
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              Browse Movies
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { label: "Watched", value: stats.watched, color: "text-green-400" },
              { label: "Watching", value: stats.watching, color: "text-blue-400" },
              { label: "Want to Watch", value: stats.toWatch, color: "text-yellow-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 py-5 px-3 text-center backdrop-blur">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently Added ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Recently Added</h2>
            <p className="mt-1 text-sm text-zinc-500">Latest movies in the community library</p>
          </div>
          <Link
            href="/movies"
            prefetch
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recentMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.slug}`}
              prefetch
              className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-600/60 transition-colors"
            >
              <div className="relative isolate aspect-[2/3] w-full overflow-hidden bg-zinc-800">
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
                  <div className="flex h-full items-center justify-center text-4xl text-zinc-600">🎬</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-white text-sm line-clamp-1">{movie.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{movie.year} · {movie.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-indigo-700 py-14 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to start tracking?</h2>
        <p className="text-indigo-200 mb-7 text-sm">Join and build your personal watchlist today.</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            prefetch
            className="rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            Register
          </Link>
          <Link
            href="/login"
            prefetch
            className="rounded-full border border-indigo-400/60 px-7 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
