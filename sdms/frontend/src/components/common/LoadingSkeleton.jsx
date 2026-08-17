export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-ink-100 dark:bg-ink-800 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl2 shadow-card p-5 space-y-3">
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-7 w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 px-4 py-3 border-b border-ink-100 dark:border-ink-800">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-4 border-b border-ink-50 dark:border-ink-800">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
