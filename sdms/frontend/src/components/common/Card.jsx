export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl2 shadow-card ${
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
