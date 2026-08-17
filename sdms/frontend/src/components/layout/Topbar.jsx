import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlobalSearch from './GlobalSearch';
import Avatar from '../common/Avatar';
import { notificationService } from '../../services';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    notificationService
      .getAll({ limit: 1 })
      .then((res) => setUnread(res.data.meta?.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-ink-900/90 backdrop-blur border-b border-ink-100 dark:border-ink-800 px-4 lg:px-6 py-3 flex items-center gap-4">
      <button onClick={onMenuClick} className="lg:hidden text-ink-500 hover:text-ink-800 dark:text-ink-300">
        <Menu size={22} />
      </button>

      <div className="hidden md:block flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-ink-500 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-ink-500 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-semibold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-ink-700 dark:text-ink-200">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="text-ink-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl2 shadow-card-hover py-1.5 animate-fade-in">
              <p className="px-3 py-1.5 text-xs text-ink-400 capitalize">{user?.role} account</p>
              <button
                onClick={() => {
                  navigate('/profile');
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <UserIcon size={15} /> Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
