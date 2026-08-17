export function Field({ label, error, required, children, hint }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-1.5">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
}

const baseCls =
  'w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2 text-sm text-ink-800 dark:text-ink-100 placeholder:text-ink-300 focus:border-brass-500 disabled:bg-ink-50 disabled:text-ink-400';

export function Input(props) {
  return <input className={baseCls} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={baseCls} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className={`${baseCls} min-h-[90px]`} {...props} />;
}
