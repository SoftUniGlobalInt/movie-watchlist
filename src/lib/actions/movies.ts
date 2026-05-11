"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { movies } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";

export type MovieActionState = { error?: string };

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  if (session.role !== "admin") throw new Error("Forbidden.");
  return session;
}

function parseMovieFields(formData: FormData): {
  title: string;
  description: string;
  year: number;
  director: string;
  genre: string;
  posterUrl: string | null;
} | { error: string } {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const yearRaw = formData.get("year") as string | null;
  const director = (formData.get("director") as string | null)?.trim() ?? "";
  const genre = (formData.get("genre") as string | null)?.trim() ?? "";
  const posterUrl = (formData.get("posterUrl") as string | null)?.trim() || null;

  if (!title || !description || !yearRaw || !director || !genre) {
    return { error: "All fields except poster URL are required." };
  }

  const year = parseInt(yearRaw, 10);
  if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 2) {
    return { error: "Enter a valid year." };
  }

  return { title, description, year, director, genre, posterUrl };
}

export async function createMovie(
  _prev: MovieActionState,
  formData: FormData,
): Promise<MovieActionState> {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Forbidden." };
  }

  const fields = parseMovieFields(formData);
  if ("error" in fields) return fields;

  const slug = toSlug(fields.title);

  const [existing] = await db
    .select({ id: movies.id })
    .from(movies)
    .where(eq(movies.slug, slug))
    .limit(1);

  if (existing) return { error: "A movie with this title already exists." };

  await db.insert(movies).values({ ...fields, slug });

  revalidatePath("/movies");
  revalidatePath("/");
  revalidatePath("/admin/movies");

  redirect("/admin/movies");
}

export async function updateMovie(
  _prev: MovieActionState,
  formData: FormData,
): Promise<MovieActionState> {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Forbidden." };
  }

  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) return { error: "Invalid movie ID." };

  const fields = parseMovieFields(formData);
  if ("error" in fields) return fields;

  const [existing] = await db
    .select({ id: movies.id, slug: movies.slug })
    .from(movies)
    .where(eq(movies.id, id))
    .limit(1);

  if (!existing) return { error: "Movie not found." };

  const newSlug = toSlug(fields.title);

  // Check slug collision only if title changed
  if (newSlug !== existing.slug) {
    const [conflict] = await db
      .select({ id: movies.id })
      .from(movies)
      .where(eq(movies.slug, newSlug))
      .limit(1);
    if (conflict) return { error: "Another movie with this title already exists." };
  }

  await db.update(movies).set({ ...fields, slug: newSlug }).where(eq(movies.id, id));

  revalidatePath("/movies");
  revalidatePath(`/movies/${existing.slug}`);
  if (newSlug !== existing.slug) revalidatePath(`/movies/${newSlug}`);
  revalidatePath("/");
  revalidatePath("/admin/movies");

  redirect("/admin/movies");
}

export async function deleteMovie(id: number): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  const [movie] = await db
    .select({ slug: movies.slug })
    .from(movies)
    .where(eq(movies.id, id))
    .limit(1);

  if (!movie) return;

  await db.delete(movies).where(eq(movies.id, id));

  revalidatePath("/movies");
  revalidatePath(`/movies/${movie.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/movies");
}
