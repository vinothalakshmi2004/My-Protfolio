/**
 * Small presentational feedback components:
 *  - StatusBadge:   coloured pill (Visible / Hidden / Featured / Unread ...)
 *  - EmptyState:    friendly "nothing here yet" panel with an optional action
 *  - Skeleton*:     shimmering placeholders shown while data loads
 *  - Card / PageHeader / SectionCard: layout building blocks for admin pages
 */
import { FiInbox } from 'react-icons/fi';

const BADGE_TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30',
  violet: 'bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-500/30',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
};

/** StatusBadge — tone: green | gray | violet | amber | rose | blue */
export const StatusBadge = ({ tone = 'gray', children, dot = false, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]} ${className}`}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
    {children}
  </span>
);

/** Visible/Hidden badge used in every resource list. */
export const VisibilityBadge = ({ visible }) => (
  <StatusBadge tone={visible ? 'green' : 'gray'} dot>
    {visible ? 'Visible' : 'Hidden'}
  </StatusBadge>
);

/** EmptyState — icon, title, description and an optional call-to-action. */
export const EmptyState = ({ icon: Icon = FiInbox, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 py-12 text-center dark:border-slate-800 ${className}`}>
    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/** Base shimmer block. */
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} aria-hidden="true" />
);

/** Placeholder for a list/table while it loads. */
export const SkeletonList = ({ rows = 5 }) => (
  <div className="divide-y divide-slate-100 dark:divide-slate-800" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="hidden h-8 w-24 sm:block" />
      </div>
    ))}
  </div>
);

/** Placeholder for a settings form while it loads. Mobile: 1 col, md: 2 cols. */
export const SkeletonForm = ({ fields = 6 }) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2" role="status" aria-label="Loading">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className={`space-y-2 ${i % 3 === 2 ? 'md:col-span-2' : ''}`}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className={i % 3 === 2 ? 'h-24 w-full' : 'h-11 w-full'} />
      </div>
    ))}
  </div>
);

/** Placeholder stat cards. Mobile: 1 col, sm: 2 cols, lg: 4 cols. */
export const SkeletonStats = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-28 rounded-xl" />
    ))}
  </div>
);

/** Card — white panel with border. */
export const Card = ({ className = '', children, ...props }) => (
  <div className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`} {...props}>
    {children}
  </div>
);

/** SectionCard — Card with a title/description header, used to group form fields. */
export const SectionCard = ({ title, description, actions, children, className = '' }) => (
  <Card className={className}>
    {(title || actions) && (
      // Mobile: header stacks; sm+: title left, actions right
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>}
          {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    )}
    <div className="px-4 py-5 sm:px-6">{children}</div>
  </Card>
);

/** PageHeader — page title + description + actions. Mobile: stacked; sm+: actions on the right. */
export const PageHeader = ({ title, description, actions, badge }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
        {badge}
      </div>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {/* Actions wrap on narrow screens instead of overflowing */}
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);
