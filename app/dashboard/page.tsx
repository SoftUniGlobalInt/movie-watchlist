import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { removeFromWatchlist } from "@/src/lib/actions/watchlist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

type Status = "to_watch" | "watching" | "watched";

const STATUS_LABELS: Record<Status, string> = {
  to_watch: "To Watch",
  watching: "Watching",
  watched: "Watched",
};

const STATUS_COLORS: Record<Status, string> = {
  to_watch: "bg-zinc-700/80 text-zinc-300",
  watching: "bg-blue-900/60 text-blue-300 border border-blue-800/50",
  watched: "bg-green-900/60 text-green-300 border border-green-800/50",
};

async function getWatchlist(userId: number, status?: Status) {
  const conditions = status
    ? and(eq(userMovies.userId, userId), eq(userMovies.status, status))
    : eq(userMovies.userId, userId);

  return db
    .select({
      entryId: userMovies.id,
      status: userMovies.status,
      rating: userMovies.rating,
      review: userMovies.review,
      createdAt: userMovies.createdAt,
      movieId: movies.id,
      title: movies.title,
      slug: movies.slug,
      year: movies.year,
      genre: movies.genre,
      director: movies.director,
      posterUrl: movies.posterUrl,
    })
    .from(userMovies)
    .innerJoin(movies, eq(userMovies.movieId, movies.id))
    .where(conditions)
    .orderBy(userMovies.createdAt);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status: statusParam } = await searchParams;
  const activeStatus = (["to_watch", "watching", "watched"].includes(statusParam ?? "")
    ? statusParam
    : undefined) as Status | undefined;

  const entries = await getWatchlist(session.userId, activeStatus);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {entries.length} {activeStatus ? STATUS_LABELS[activeStatus].toLowerCase() : "total"}{" "}
            {entries.length === 1 ? "movie" : "movies"}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          prefetch
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30"
        >
          + Add Movie
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {([undefined, "to_watch", "watching", "watched"] as const).map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/dashboard?status=${s}` : "/dashboard"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === s
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {s ? STATUS_LABELS[s] : "All"}
          </Link>
        ))}
        <Link
          href="/dashboard/stats"
          prefetch
          className="ml-auto rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          📊 Stats
        </Link>
      </div>

      {/* Empty state */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
          <p className="text-zinc-500 text-sm">No movies here yet.</p>
          <Link href="/dashboard/new" prefetch className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Add your first movie →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.entryId}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
            >
              {/* Poster */}
              <div className="relative isolate hidden sm:block h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                {entry.posterUrl ? (
                  <Image
                    src={entry.posterUrl}
                    alt={entry.title}
                    fill
                    sizes="44px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg text-zinc-600">🎬</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/movies/${entry.slug}`}
                    prefetch
                    className="font-semibold text-white hover:text-indigo-300 truncate transition-colors"
                  >
                    {entry.title}
                  </Link>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status as Status]}`}>
                    {STATUS_LABELS[entry.status as Status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-600">{entry.year} · {entry.genre} · {entry.director}</p>
                {entry.rating && <p className="mt-1 text-xs text-yellow-400 font-medium">★ {entry.rating}/10</p>}
                {entry.review && <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{entry.review}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/edit/${entry.entryId}`}
                  prefetch
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-indigo-600 hover:text-indigo-300 transition-colors"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await removeFromWatchlist(entry.entryId);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-700 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
