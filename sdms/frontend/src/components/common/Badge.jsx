const COLOR_MAP = {
  active: 'bg-success-50 text-success-600 border-success-500/30',
  inactive: 'bg-ink-100 text-ink-500 border-ink-300',
  graduated: 'bg-ink-50 text-ink-600 border-ink-300',
  suspended: 'bg-danger-50 text-danger-600 border-danger-500/30',
  present: 'bg-success-50 text-success-600 border-success-500/30',
  absent: 'bg-danger-50 text-danger-600 border-danger-500/30',
  late: 'bg-warning-50 text-warning-600 border-warning-500/30',
  paid: 'bg-success-50 text-success-600 border-success-500/30',
  partial: 'bg-warning-50 text-warning-600 border-warning-500/30',
  pending: 'bg-warning-50 text-warning-600 border-warning-500/30',
  overdue: 'bg-danger-50 text-danger-600 border-danger-500/30',
  excellent: 'bg-success-50 text-success-600 border-success-500/30',
  good: 'bg-ink-50 text-ink-600 border-ink-300',
  warning: 'bg-warning-50 text-warning-600 border-warning-500/30',
  critical: 'bg-danger-50 text-danger-600 border-danger-500/30',
  average: 'bg-warning-50 text-warning-600 border-warning-500/30',
  'needs attention': 'bg-danger-50 text-danger-600 border-danger-500/30',
};

export default function Badge({ children, tone }) {
  const key = (tone || String(children)).toLowerCase();
  const cls = COLOR_MAP[key] || 'bg-ink-50 text-ink-600 border-ink-300';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cls}`}>
      {children}
    </span>
  );
}
