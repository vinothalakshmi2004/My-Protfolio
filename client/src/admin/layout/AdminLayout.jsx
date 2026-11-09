/**
 * AdminLayout — dashboard frame: sidebar + top header + page content.
 *
 * Responsive behaviour:
 *  - lg+ (≥1024px): sidebar is FIXED on the left (w-64) and content is offset with lg:pl-64
 *  - below lg: sidebar becomes an OFF-CANVAS DRAWER (slides in from the left over a dark
 *    overlay), opened by the hamburger in the header; closes on navigation, overlay tap or Escape
 *
 * Also provides AdminShellContext ({ unread, refreshUnread }) so the Messages page and the
 * Overview can keep the sidebar's unread badge in sync.
 */
import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiExternalLink, FiLogOut, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesApi } from '../../services/adminApi';
import { useBodyScrollLock, useFocusTrap } from '../hooks/useOverlay';
import { NAV_GROUPS, NAV_ITEMS } from './navItems';
import Button from '../components/Button';
import PageSpinner from '../../components/PageSpinner';

const AdminShellContext = createContext({ unread: 0, refreshUnread: () => {} });
/** Hook: { unread, refreshUnread() } */
export const useAdminShell = () => useContext(AdminShellContext);

/** Sidebar content (shared by the fixed desktop sidebar and the mobile drawer). */
const SidebarNav = ({ unread, onNavigate }) => (
  <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
    {NAV_GROUPS.map((group, gi) => (
      <div key={group.label || gi}>
        {group.label && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{group.label}</p>}
        <ul className="space-y-0.5">
          {group.items.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  // 44px rows on touch screens, slightly denser on lg+
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors lg:min-h-10 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{label}</span>
                {badgeKey === 'unread' && unread > 0 && (
                  <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white" aria-label={`${unread} unread`}>
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </nav>
);

const Brand = () => (
  <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5 dark:border-slate-800">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-fuchsia-500 text-sm font-bold text-white">A</span>
    <span className="font-semibold text-slate-900 dark:text-white">Admin Dashboard</span>
  </div>
);

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const drawerRef = useRef(null);

  const refreshUnread = useCallback(() => {
    messagesApi
      .unreadCount()
      .then(setUnread)
      .catch(() => {});
  }, []);

  // Refresh the badge on every page change + every 60s while the dashboard is open
  useEffect(() => {
    refreshUnread();
  }, [location.pathname, refreshUnread]);
  useEffect(() => {
    const id = setInterval(refreshUnread, 60000);
    return () => clearInterval(id);
  }, [refreshUnread]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  useBodyScrollLock(drawerOpen);
  useFocusTrap(drawerRef, drawerOpen, () => setDrawerOpen(false));

  const current = [...NAV_ITEMS].sort((a, b) => b.to.length - a.to.length).find((item) => location.pathname.startsWith(item.to));

  return (
    <AdminShellContext.Provider value={{ unread, refreshUnread }}>
      <div className="min-h-screen min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>

        {/* Desktop sidebar: fixed on lg+, hidden below lg */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <Brand />
          <SidebarNav unread={unread} />
        </aside>

        {/* Mobile/tablet drawer: below lg the sidebar slides in over an overlay */}
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
                // 18rem wide but never wider than 85% of tiny screens (320px)
                className="relative flex h-dvh w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pr-2 dark:border-slate-800">
                  <Brand />
                  <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                    <FiX className="h-5 w-5" />
                  </Button>
                </div>
                <SidebarNav unread={unread} onNavigate={() => setDrawerOpen(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Content column, offset by the fixed sidebar on lg+ */}
        <div className="flex min-h-screen min-h-dvh flex-col lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200 bg-white/90 px-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:gap-3 sm:px-4 lg:px-8">
            {/* Hamburger: only below lg */}
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu" aria-expanded={drawerOpen} className="lg:hidden">
              <FiMenu className="h-5 w-5" />
            </Button>
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 dark:text-white">{current?.label || 'Admin'}</h1>

            {/* "View Live Site": icon-only on phones, labelled from sm+ */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View live site (opens in a new tab)"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto sm:px-3 lg:h-9"
            >
              <FiExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Live Site</span>
            </a>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </Button>
            {/* Admin e-mail only on md+ to save space on phones */}
            <span className="hidden max-w-[12rem] truncate text-sm text-slate-500 dark:text-slate-400 md:inline" title={admin?.email}>
              {admin?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Log out" title="Log out">
              <FiLogOut className="h-5 w-5" />
            </Button>
          </header>

          {/* Page content: comfortable gutters that grow with the screen, capped width on huge monitors */}
          <main id="admin-main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Suspense fallback={<PageSpinner fullScreen={false} />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
