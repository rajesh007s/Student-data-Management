import { Inbox, AlertOctagon, WifiOff } from 'lucide-react';
import Button from './Button';

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center text-ink-300 dark:text-ink-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {message && <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-danger-50 flex items-center justify-center text-danger-500 mb-4">
        <AlertOctagon size={24} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Unable to load data</h3>
      <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5 max-w-sm">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function NetworkError({ onRetry }) {
  return (
    <ErrorState message="Can't reach the server. Check your connection and try again." onRetry={onRetry} />
  );
}
