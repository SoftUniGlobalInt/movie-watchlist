import Link from "next/link";
import MovieForm from "@/src/components/MovieForm";
import { createMovie } from "@/src/lib/actions/movies";

export const dynamic = "force-dynamic";

export default function NewMoviePage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <Link href="/admin/movies" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to movies
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Add Movie</h1>
      </div>
      <MovieForm action={createMovie} />
    </div>
  );
}
