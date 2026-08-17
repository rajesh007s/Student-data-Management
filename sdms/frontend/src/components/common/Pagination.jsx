import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (!totalPages || totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 dark:border-ink-800">
      <p className="text-xs text-ink-500 dark:text-ink-400">
        Showing <span className="font-mono">{start}</span>–<span className="font-mono">{end}</span> of{' '}
        <span className="font-mono">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40 hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-mono px-2 text-ink-600 dark:text-ink-300">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40 hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
