export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  );
};

export const formatPercent = (val) => `${Number(val ?? 0).toFixed(1)}%`;

export const performanceTone = (label) => {
  const map = { Excellent: 'success', Good: 'ink', Average: 'warning', 'Needs Attention': 'danger' };
  return map[label] || 'ink';
};

export const attendanceTone = (pct) => {
  if (pct >= 90) return 'excellent';
  if (pct >= 75) return 'good';
  if (pct >= 60) return 'warning';
  return 'critical';
};
