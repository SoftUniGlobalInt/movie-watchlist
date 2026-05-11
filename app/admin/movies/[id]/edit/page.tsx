import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { movies } from "@/src/db/schema";
import MovieForm from "@/src/components/MovieForm";
import { updateMovie } from "@/src/lib/actions/movies";

export const dynamic = "force-dynamic";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (isNaN(movieId)) notFound();

  const [movie] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1);
  if (!movie) notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <Link href="/admin/movies" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to movies
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Edit Movie</h1>
        <p className="mt-1 text-sm text-zinc-400">{movie.title}</p>
      </div>
      <MovieForm
        action={updateMovie}
        movie={{
          id: movie.id,
          title: movie.title,
          description: movie.description,
          year: movie.year,
          director: movie.director,
          genre: movie.genre,
          posterUrl: movie.posterUrl ?? null,
        }}
      />
    </div>
  );
}
