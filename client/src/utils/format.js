/**
 * Display formatting helpers (dates, scores, sizes, initials).
 * Dates are stored as "YYYY-MM" and years as "YYYY" strings.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-01" -> "Jan 2026" ('' stays '') */
export const formatMonth = (value) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value || '');
  if (!match) return value || '';
  return `${MONTHS[Number(match[2]) - 1] || ''} ${match[1]}`.trim();
};

/** ("2025-07", "2025-08", false) -> "Jul 2025 – Aug 2025"; current roles end with "Present" */
export const formatMonthRange = (start, end, isCurrent) => {
  const from = formatMonth(start);
  const to = isCurrent ? 'Present' : formatMonth(end);
  if (from && to) return `${from} – ${to}`;
  return from || to || '';
};

/** ("2024", "2026") -> "2024 – 2026"; ("2024", "") -> "2024 – Present" */
export const formatYearRange = (start, end) => {
  if (start && end) return start === end ? start : `${start} – ${end}`;
  if (start) return `${start} – Present`;
  return end || '';
};

/** ("CGPA", "9.0") -> "CGPA 9.0"; ("Percentage", "90") -> "90%"; ("Grade", "A") -> "Grade A" */
export const formatScore = (type, score) => {
  if (!score) return '';
  if (type === 'Percentage') return `${String(score).replace(/%$/, '')}%`;
  if (type === 'Grade') return `Grade ${score}`;
  return `CGPA ${score}`;
};

/** "Vinothalakshmi M" -> "VM" */
export const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '•';

/** 1536 -> "1.5 KB" */
export const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

/** Date -> "12 Mar 2026, 10:30" (locale aware) */
export const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/** Date -> "5 minutes ago" / "3 days ago" / falls back to a date */
export const formatRelative = (value) => {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};
