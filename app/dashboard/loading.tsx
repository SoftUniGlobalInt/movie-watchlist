export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded-lg bg-zinc-800" />
          <div className="mt-2 h-4 w-24 rounded bg-zinc-800" />
        </div>
        <div className="h-10 w-32 rounded-full bg-zinc-800" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="mb-6 flex gap-2">
        {[80, 72, 80, 72].map((w, i) => (
          <div key={i} className={`h-8 w-${w} rounded-full bg-zinc-800`} style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="hidden sm:block h-16 w-11 flex-shrink-0 rounded-md bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-zinc-800" />
              <div className="h-3 w-32 rounded bg-zinc-800" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-14 rounded-lg bg-zinc-800" />
              <div className="h-8 w-18 rounded-lg bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
