/**
 * Skeleton placeholders shown while the landing-page data loads.
 * LandingSkeleton mirrors the real layout (navbar, hero, cards) so nothing jumps.
 */
const Bar = ({ className = '' }) => <div className={`rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />;

/** One content card placeholder. */
export const CardSkeleton = () => (
  <div className="animate-pulse rounded-3xl border border-slate-200 bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
    <Bar className="mb-4 h-6 w-1/3" />
    <Bar className="mb-2 h-4 w-full" />
    <Bar className="mb-6 h-4 w-5/6" />
    <div className="flex flex-wrap gap-2">
      <Bar className="h-6 w-16 rounded-full" />
      <Bar className="h-6 w-20 rounded-full" />
      <Bar className="h-6 w-14 rounded-full" />
    </div>
  </div>
);

/** Row of stat tiles. Mobile: 2 cols, md: 4 cols */
export const StatsSkeleton = () => (
  <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Bar key={i} className="h-24 rounded-2xl" />
    ))}
  </div>
);

/** Full-page landing skeleton. */
export const LandingSkeleton = () => (
  <div className="min-h-screen min-h-dvh bg-slate-50 dark:bg-slate-950" role="status" aria-live="polite">
    <span className="sr-only">Loading portfolio…</span>
    {/* Fake navbar */}
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Bar className="h-10 w-10 rounded-xl" />
      <Bar className="h-10 w-10 rounded-xl" />
    </div>
    {/* Hero: stacked on mobile, two columns on lg */}
    <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pt-20">
      <div className="space-y-4 lg:col-span-7">
        <Bar className="h-6 w-48 rounded-full" />
        <Bar className="h-12 w-4/5" />
        <Bar className="h-8 w-3/5" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-5/6" />
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Bar className="h-12 w-full rounded-2xl sm:w-40" />
          <Bar className="h-12 w-full rounded-2xl sm:w-44" />
        </div>
      </div>
      <div className="flex justify-center lg:col-span-5">
        <Bar className="h-80 w-full max-w-xs rounded-3xl" />
      </div>
    </div>
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
      <StatsSkeleton />
      {/* Mobile: 1 col, md: 2 cols, lg: 3 cols */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

export default LandingSkeleton;
