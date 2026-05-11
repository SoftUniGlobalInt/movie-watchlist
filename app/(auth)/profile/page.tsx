import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { db } from "@/src/db";
import { userMovies } from "@/src/db/schema";
import { and, eq, count } from "drizzle-orm";
import UserProfile from "@/src/components/UserProfile";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [[{ total }], [{ watched }]] = await Promise.all([
    db.select({ total: count() }).from(userMovies).where(eq(userMovies.userId, session.userId)),
    db.select({ watched: count() }).from(userMovies).where(
      and(eq(userMovies.userId, session.userId), eq(userMovies.status, "watched"))
    ),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">My Profile</h1>
      <UserProfile session={session} watchlistCount={total} watchedCount={watched} />
    </div>
  );
}
