import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/src/lib/auth";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import AddMovieForm from "@/src/components/AddMovieForm";

export const dynamic = "force-dynamic";

export default async function NewWatchlistPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Exclude movies already on the user's watchlist
  const alreadyAdded = await db
    .select({ movieId: userMovies.movieId })
    .from(userMovies)
    .where(eq(userMovies.userId, session.userId));

  const addedIds = new Set(alreadyAdded.map((e) => e.movieId));

  const allMovies = await db
    .select({
      id: movies.id,
      title: movies.title,
      year: movies.year,
      genre: movies.genre,
      director: movies.director,
      posterUrl: movies.posterUrl,
    })
    .from(movies)
    .orderBy(movies.title);

  const available = allMovies.filter((m) => !addedIds.has(m.id));

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to watchlist
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Add a Movie</h1>
        <p className="mt-1 text-sm text-zinc-400">Search the library and pick a status.</p>
      </div>

      {available.length === 0 ? (
        <p className="text-zinc-500 text-sm">You&apos;ve added all available movies to your watchlist.</p>
      ) : (
        <AddMovieForm movies={available} />
      )}
    </div>
  );
}
