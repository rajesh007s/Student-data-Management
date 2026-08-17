import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Settings</h1>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-1">Appearance</h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">Choose how the registrar system looks on this device.</p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl2 border-2 transition-colors ${
              theme === 'light' ? 'border-brass-500 bg-brass-50' : 'border-ink-100 dark:border-ink-800'
            }`}
          >
            <Sun size={20} className="text-ink-600" />
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl2 border-2 transition-colors ${
              theme === 'dark' ? 'border-brass-500 bg-brass-50 dark:bg-brass-900/10' : 'border-ink-100 dark:border-ink-800'
            }`}
          >
            <Moon size={20} className="text-ink-600 dark:text-ink-300" />
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Dark</span>
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-1">Account</h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">Your account details.</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-800">
            <span className="text-ink-400">Email</span>
            <span className="text-ink-700 dark:text-ink-200">{user.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-800">
            <span className="text-ink-400">Role</span>
            <span className="text-ink-700 dark:text-ink-200 capitalize">{user.role}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
