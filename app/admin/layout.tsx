import Link from "next/link";
import { getSession } from "@/src/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Admin</span>
        <nav className="flex items-center gap-1 ml-4">
          <Link
            href="/admin/movies"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Movies
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
