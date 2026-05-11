import Link from "next/link";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-4">About MovieList</h1>
      <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-10">
        Your personal movie tracker
      </p>

      <div className="space-y-8 text-zinc-300 leading-7">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What is MovieList?</h2>
          <p>
            MovieList is a community-driven movie tracking app. Create an account, add films to
            your watchlist, mark them as watched, and rate them. See what others in the community
            are watching right now — all without ads or algorithms pushing you toward paid content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-400">
            <li>Browse the public movie library — no account needed.</li>
            <li>Register for free to build your personal watchlist.</li>
            <li>Mark movies as <span className="text-yellow-400 font-medium">To Watch</span>, <span className="text-blue-400 font-medium">Watching</span>, or <span className="text-green-400 font-medium">Watched</span>.</li>
            <li>Rate films you&apos;ve finished and write short reviews.</li>
            <li>See community stats on the home page — updated every 10 minutes.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Tech stack</h2>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Next.js 16 (App Router) with React Server Components</li>
            <li>Drizzle ORM + Neon serverless Postgres</li>
            <li>Tailwind CSS v4</li>
            <li>ISR for public pages — fresh data without full rebuilds</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Roles</h2>
          <p>
            <span className="font-medium text-white">Users</span> can manage their own watchlist
            and ratings. <span className="font-medium text-white">Admins</span> can add, edit, and
            remove movies from the library.
          </p>
        </section>
      </div>

      <div className="mt-12 flex gap-4">
        <Link
          href="/register"
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/movies"
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
        >
          Browse movies
        </Link>
      </div>
    </div>
  );
}
