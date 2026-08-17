import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Wallet,
  FileBarChart2,
  Bell,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'student'] },
  { to: '/students', label: 'Students', icon: Users, roles: ['admin', 'faculty'] },
  { to: '/faculty', label: 'Faculty', icon: GraduationCap, roles: ['admin'] },
  { to: '/courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'faculty', 'student'] },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'faculty', 'student'] },
  { to: '/marks', label: 'Marks', icon: ClipboardList, roles: ['admin', 'faculty', 'student'] },
  { to: '/fees', label: 'Fees', icon: Wallet, roles: ['admin', 'student'] },
  { to: '/reports', label: 'Reports', icon: FileBarChart2, roles: ['admin', 'faculty'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'faculty', 'student'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'faculty', 'student'] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user?.role));

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-ink-950/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-ink-800 text-ink-100 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-ink-700/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border-2 border-brass-500 flex items-center justify-center shrink-0">
              <span className="font-display text-brass-400 text-sm font-semibold">M</span>
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-white leading-tight">Meridian College</p>
              <p className="text-[11px] text-ink-400 tracking-wide uppercase">Registrar System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brass-500 text-ink-900'
                    : 'text-ink-300 hover:bg-ink-700/60 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-ink-700/60">
          <p className="text-[11px] text-ink-500">Est. 1962 · Academic Year 2025–26</p>
        </div>
      </aside>
    </>
  );
}
