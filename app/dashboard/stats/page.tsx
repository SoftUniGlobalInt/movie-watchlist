import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, count, avg, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const uid = session.userId;

  // Counts by status
  const [toWatchCount, watchingCount, watchedCount] = await Promise.all([
    db.select({ n: count() }).from(userMovies).where(and(eq(userMovies.userId, uid), eq(userMovies.status, "to_watch"))),
    db.select({ n: count() }).from(userMovies).where(and(eq(userMovies.userId, uid), eq(userMovies.status, "watching"))),
    db.select({ n: count() }).from(userMovies).where(and(eq(userMovies.userId, uid), eq(userMovies.status, "watched"))),
  ]);

  // Average rating (only rated entries)
  const [ratingResult] = await db
    .select({ avgRating: avg(userMovies.rating) })
    .from(userMovies)
    .where(and(eq(userMovies.userId, uid), sql`${userMovies.rating} is not null`));

  // Top genres
  const genreRows = await db
    .select({ genre: movies.genre, total: count() })
    .from(userMovies)
    .innerJoin(movies, eq(userMovies.movieId, movies.id))
    .where(eq(userMovies.userId, uid))
    .groupBy(movies.genre)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  const total = toWatchCount[0].n + watchingCount[0].n + watchedCount[0].n;
  const avgRating = ratingResult.avgRating
    ? parseFloat(String(ratingResult.avgRating)).toFixed(1)
    : null;

  const statuses = [
    { label: "To Watch", value: toWatchCount[0].n, color: "text-zinc-300", bg: "bg-zinc-700" },
    { label: "Watching", value: watchingCount[0].n, color: "text-blue-300", bg: "bg-blue-700" },
    { label: "Watched", value: watchedCount[0].n, color: "text-green-300", bg: "bg-green-700" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Watchlist
        </Link>
        <h1 className="text-2xl font-bold text-white">My Stats</h1>
      </div>

      {/* Overview */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
          <p className="text-3xl font-bold text-white">{total}</p>
          <p className="mt-1 text-xs text-zinc-400">Total movies</p>
        </div>
        {statuses.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-zinc-400">Watchlist breakdown</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-800">
            {statuses.map((s) => (
              <div
                key={s.label}
                className={`${s.bg} transition-all`}
                style={{ width: `${(s.value / total) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-zinc-500">
            {statuses.map((s) => (
              <span key={s.label} className={s.color}>
                {s.label}: {total > 0 ? Math.round((s.value / total) * 100) : 0}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Avg rating */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-zinc-400 mb-1">Average Rating</p>
        {avgRating ? (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-yellow-400">★ {avgRating}</span>
            <span className="text-sm text-zinc-500">/ 10</span>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No ratings yet.</p>
        )}
      </div>

      {/* Top genres */}
      {genreRows.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-medium text-zinc-400 mb-4">Top Genres</p>
          <div className="space-y-3">
            {genreRows.map((row, i) => (
              <div key={row.genre} className="flex items-center gap-3">
                <span className="w-5 text-xs text-zinc-600 font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">{row.genre}</span>
                    <span className="text-xs text-zinc-400">{row.total} {row.total === 1 ? "film" : "films"}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(row.total / (genreRows[0].total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
