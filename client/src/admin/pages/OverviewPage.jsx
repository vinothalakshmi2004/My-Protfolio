/**
 * /admin — dashboard home: stat cards (projects, certifications, unread messages,
 * last updated), content counts, storage usage, recent messages and quick actions.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiFolder,
  FiGlobe,
  FiHardDrive,
  FiLayout,
  FiMail,
  FiPlus,
  FiUser,
} from 'react-icons/fi';
import { statsApi } from '../../services/adminApi';
import { getErrorMessage } from '../../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useAdminShell } from '../layout/AdminLayout';
import { formatBytes, formatDateTime, formatRelative } from '../../utils/format';
import { Card, EmptyState, PageHeader, Skeleton, SkeletonStats, StatusBadge } from '../components/Feedback';
import Button from '../components/Button';

const StatCard = ({ icon: Icon, label, value, sub, to, tone }) => {
  const body = (
    <Card className="h-full p-5 transition hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{value}</p>
          {sub && <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
      {body}
    </Link>
  ) : (
    body
  );
};

const QUICK_ACTIONS = [
  { to: '/admin/projects?new=1', label: 'Add project', icon: FiPlus },
  { to: '/admin/resume', label: 'Upload resume', icon: FiFileText },
  { to: '/admin/profile', label: 'Edit profile', icon: FiUser },
  { to: '/admin/contact-social', label: 'Contact & social', icon: FiGlobe },
  { to: '/admin/sections', label: 'Sections & layout', icon: FiLayout },
];

export default function OverviewPage() {
  const { admin } = useAuth();
  const { refreshUnread } = useAdminShell();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setStats(await statsApi.get());
      refreshUnread();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the overview'));
    }
  }, [refreshUnread]);

  useEffect(() => {
    load();
  }, [load]);

  const c = stats?.counts || {};

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back 👋"
        description={admin?.email ? `Signed in as ${admin.email}` : undefined}
        actions={
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:w-auto"
          >
            <FiExternalLink className="h-4 w-4" /> View live site
          </a>
        }
      />

      {error ? (
        <EmptyState icon={FiAlertTriangle} title="Couldn't load the overview" description={error} action={<Button variant="secondary" onClick={load}>Try again</Button>} />
      ) : !stats ? (
        <SkeletonStats />
      ) : (
        <>
          {/* Stat cards: 1 col on phones, 2 on sm, 4 on lg+ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FiFolder} label="Projects" value={c.projects?.total ?? 0} sub={`${c.projects?.visible ?? 0} visible`} to="/admin/projects" tone="bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300" />
            <StatCard icon={FiAward} label="Certifications" value={c.certifications?.total ?? 0} sub={`${c.certifications?.visible ?? 0} visible`} to="/admin/certifications" tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
            <StatCard icon={FiMail} label="Unread messages" value={stats.messages.unread} sub={`${stats.messages.total} total`} to="/admin/messages" tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" />
            <StatCard
              icon={FiClock}
              label="Last updated"
              value={stats.lastUpdated ? formatRelative(stats.lastUpdated) : '—'}
              sub={stats.lastUpdated ? formatDateTime(stats.lastUpdated) : 'No changes yet'}
              tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            />
          </div>

          {/* Secondary counts: 2 cols on phones, 3 on sm, 5 on lg */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ['Experience', c.experience, '/admin/experience'],
              ['Education', c.education, '/admin/education'],
              ['Skill groups', c.skills, '/admin/skills'],
              ['Achievements', c.achievements, '/admin/achievements'],
            ].map(([label, count, to]) => (
              <Link key={label} to={to} className="rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-primary-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{count?.total ?? 0}</p>
              </Link>
            ))}
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <FiHardDrive className="h-3 w-3" /> GridFS storage
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatBytes(stats.storage?.bytes)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stats.storage?.files ?? 0} files</p>
            </div>
          </div>
        </>
      )}

      {/* Bottom area: recent messages + quick actions stack on mobile, 3:2 split on lg+ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent messages</h2>
            <Link to="/admin/messages" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View all <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {!stats ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : stats.recentMessages?.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentMessages.map((m) => (
                <li key={m._id}>
                  <Link to={`/admin/messages?open=${m._id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.isRead ? 'bg-transparent' : 'bg-primary-500'}`} aria-label={m.isRead ? undefined : 'Unread'} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm ${m.isRead ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>{m.name}</p>
                        <span className="shrink-0 text-xs text-slate-400">{formatRelative(m.createdAt)}</span>
                      </div>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{m.subject}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Quick actions</h2>
          </div>
          {/* Quick actions: 1 col on phones, 2 cols from sm, back to 1 col inside the narrow lg column */}
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-1">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-700 dark:hover:bg-primary-500/10"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
                <FiArrowRight className="ml-auto h-4 w-4 text-slate-400" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {stats && stats.messages.unread > 0 && (
            <div className="px-4 pb-4">
              <StatusBadge tone="blue">
                {stats.messages.unread} unread message{stats.messages.unread === 1 ? '' : 's'}
              </StatusBadge>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
