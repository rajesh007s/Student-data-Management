import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, tone = 'ink', delta, index = 0 }) {
  const toneClasses = {
    ink: 'bg-ink-800 text-white',
    brass: 'bg-brass-500 text-ink-900',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-white',
    danger: 'bg-danger-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl2 shadow-card p-5 flex items-start justify-between hover:shadow-card-hover transition-shadow"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-400">{label}</p>
        <p className="font-mono text-2xl font-semibold text-ink-800 dark:text-ink-50 mt-1.5">{value}</p>
        {delta && <p className="text-xs text-success-600 mt-1 font-medium">{delta}</p>}
      </div>
      {Icon && (
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
          <Icon size={18} />
        </div>
      )}
    </motion.div>
  );
}
