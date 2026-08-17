import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, UserPlus, CalendarCheck, Wallet, GraduationCap, Megaphone } from 'lucide-react';
import { notificationService } from '../services';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const TYPE_ICONS = {
  registration: UserPlus,
  attendance: CalendarCheck,
  fees: Wallet,
  exam: GraduationCap,
  announcement: Megaphone,
  system: Bell,
};

export default function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    notificationService
      .getAll({ limit: 50 })
      .then((res) => setNotifications(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast('All notifications marked as read.', 'success');
  };

  const remove = async (id) => {
    await notificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    toast('Notification deleted.', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Notifications</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{notifications.filter((n) => !n.isRead).length} unread</p>
        </div>
        <Button variant="outline" icon={CheckCheck} onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={2} />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" message="No notifications right now." />
        ) : (
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              return (
                <div key={n._id} className={`flex gap-3 px-5 py-4 ${!n.isRead ? 'bg-brass-50/40 dark:bg-brass-900/10' : ''}`}>
                  <div className="h-9 w-9 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center shrink-0 text-ink-500">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                      {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brass-500" />}
                      <Badge tone={n.priority === 'high' ? 'critical' : n.priority === 'low' ? 'good' : 'warning'}>{n.priority}</Badge>
                    </div>
                    <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-ink-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  <div className="flex items-start gap-1">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg text-ink-400 hover:text-success-600 hover:bg-success-50" title="Mark as read">
                        <CheckCheck size={15} />
                      </button>
                    )}
                    <button onClick={() => remove(n._id)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
