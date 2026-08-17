const VARIANTS = {
  primary: 'bg-ink-800 text-white hover:bg-ink-700 focus-visible:ring-ink-500',
  brass: 'bg-brass-500 text-ink-900 hover:bg-brass-400 font-semibold',
  outline: 'border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800',
  ghost: 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
}
