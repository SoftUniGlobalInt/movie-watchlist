import { notFound, redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import EditEntryForm from "@/src/components/EditEntryForm";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const entryId = parseInt(id, 10);
  if (isNaN(entryId)) notFound();

  const [entry] = await db
    .select({
      id: userMovies.id,
      status: userMovies.status,
      rating: userMovies.rating,
      review: userMovies.review,
      title: movies.title,
      year: movies.year,
      genre: movies.genre,
      director: movies.director,
      posterUrl: movies.posterUrl,
    })
    .from(userMovies)
    .innerJoin(movies, eq(userMovies.movieId, movies.id))
    .where(and(eq(userMovies.id, entryId), eq(userMovies.userId, session.userId)))
    .limit(1);

  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-white">Edit Entry</h1>
      <EditEntryForm
        entry={{
          id: entry.id,
          status: entry.status,
          rating: entry.rating,
          review: entry.review,
          movie: {
            title: entry.title,
            year: entry.year,
            genre: entry.genre,
            director: entry.director,
            posterUrl: entry.posterUrl ?? null,
          },
        }}
      />
    </div>
  );
}
