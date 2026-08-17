import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark text-center p-6">
      <Compass size={40} className="text-brass-500 mb-4" />
      <p className="font-mono text-sm text-ink-400 mb-2">Error 404</p>
      <h1 className="font-display text-3xl font-semibold text-ink-800 dark:text-ink-50">Page not found</h1>
      <p className="text-sm text-ink-500 dark:text-ink-400 mt-2 max-w-sm">
        This page isn't in the registrar's records. It may have moved, or the address may be wrong.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="brass">Return to dashboard</Button>
      </Link>
    </div>
  );
}
