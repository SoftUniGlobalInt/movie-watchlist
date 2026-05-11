"use server";

import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { movies, userMovies } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";

export type WatchlistActionState = { error?: string };

// ─── Add a movie to the current user's watchlist ────────────────────────────

export async function addToWatchlist(
  _prev: WatchlistActionState,
  formData: FormData,
): Promise<WatchlistActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const movieId = parseInt(formData.get("movieId") as string, 10);
  const status = formData.get("status") as "to_watch" | "watching" | "watched";

  if (!movieId || !["to_watch", "watching", "watched"].includes(status)) {
    return { error: "Invalid input." };
  }

  const [movie] = await db.select({ id: movies.id }).from(movies).where(eq(movies.id, movieId)).limit(1);
  if (!movie) return { error: "Movie not found." };

  const [existing] = await db
    .select({ id: userMovies.id })
    .from(userMovies)
    .where(and(eq(userMovies.userId, session.userId), eq(userMovies.movieId, movieId)))
    .limit(1);

  if (existing) return { error: "This movie is already on your watchlist." };

  await db.insert(userMovies).values({
    userId: session.userId,
    movieId,
    status,
  });

  redirect("/dashboard");
}

// ─── Update an existing watchlist entry ─────────────────────────────────────

export async function updateWatchlistEntry(
  _prev: WatchlistActionState,
  formData: FormData,
): Promise<WatchlistActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const entryId = parseInt(formData.get("entryId") as string, 10);
  const status = formData.get("status") as "to_watch" | "watching" | "watched";
  const ratingRaw = formData.get("rating") as string | null;
  const review = (formData.get("review") as string | null)?.trim() || null;

  if (!entryId || !["to_watch", "watching", "watched"].includes(status)) {
    return { error: "Invalid input." };
  }

  const rating = ratingRaw ? parseInt(ratingRaw, 10) : null;
  if (rating !== null && (rating < 1 || rating > 10)) {
    return { error: "Rating must be between 1 and 10." };
  }

  const [entry] = await db
    .select({ id: userMovies.id })
    .from(userMovies)
    .where(and(eq(userMovies.id, entryId), eq(userMovies.userId, session.userId)))
    .limit(1);

  if (!entry) return { error: "Entry not found." };

  await db
    .update(userMovies)
    .set({ status, rating, review })
    .where(eq(userMovies.id, entryId));

  redirect("/dashboard");
}

// ─── Remove a movie from watchlist ──────────────────────────────────────────

export async function removeFromWatchlist(entryId: number): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await db
    .delete(userMovies)
    .where(and(eq(userMovies.id, entryId), eq(userMovies.userId, session.userId)));

  redirect("/dashboard");
}
