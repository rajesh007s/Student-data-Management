const SIZES = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-2xl' };

const COLORS = ['bg-ink-700', 'bg-brass-600', 'bg-success-600', 'bg-ink-500', 'bg-warning-600'];

function hashColor(str = '') {
  const sum = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

export default function Avatar({ name = '', src, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`${SIZES[size]} rounded-full object-cover shrink-0`} />;
  }

  return (
    <div
      className={`${SIZES[size]} ${hashColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 font-display`}
    >
      {initials || '?'}
    </div>
  );
}
