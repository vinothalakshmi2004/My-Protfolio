/**
 * Navbar — fixed top bar built entirely from data:
 *  - brand = initials badge + fullName from settings
 *  - links = "Home" + the VISIBLE sections in the owner's order, labelled with
 *    each section's navLabel (a section hidden in /admin/sections disappears here too)
 *  - social links, resume download, theme toggle
 *
 * Responsive: inline links on lg+, hamburger + slide-in drawer below lg.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiDownload, FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import SocialLinks from './SocialLinks';
import { fileUrl } from '../lib/apiClient';
import { getInitials } from '../utils/format';
import { scrollToSection, useActiveSection } from '../hooks/useActiveSection';

export const Navbar = ({ settings, navItems = [] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const menuButtonRef = useRef(null);

  const links = [{ key: 'home', label: 'Home' }, ...navItems];
  const active = useActiveSection(links.map((l) => l.key));
  const { fullName = '', socialLinks = [], resume = {} } = settings || {};

  // Solid background once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Drawer: lock body scroll, close on ESC, focus the close button
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, closeMenu]);

  // Close the drawer if the viewport grows to desktop size while it's open
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const go = (e, key) => {
    e.preventDefault();
    setMenuOpen(false);
    // Wait a frame so the body scroll lock is released before scrolling
    requestAnimationFrame(() => scrollToSection(key));
  };

  const resumeHref = resume?.url ? fileUrl(resume.url, { download: true }) : '';
  const resumeIsStatic = resume?.url && !resume.url.startsWith('/api/');

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'border-b border-slate-200/60 bg-white/85 py-2.5 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/85'
            : 'bg-transparent py-3 sm:py-4'
        }`}
      >
        <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand: initials always; full name on sm+, hidden on lg (room for links), back on xl+ */}
          <div className="group flex min-h-11 min-w-0 items-center gap-2.5">
            {/* Initials badge -> admin dashboard (client-side route). 44px touch area, -m-0.5 keeps the 40px visual size */}
            <Link
              to="/admin"
              aria-label="Admin dashboard"
              className="-m-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="bg-gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md shadow-brand/20 transition-transform group-hover:scale-105">
                {getInitials(fullName)}
              </span>
            </Link>
            {/* Name still scrolls back to the top */}
            <a
              href="#home"
              onClick={(e) => go(e, 'home')}
              className="hidden min-w-0 truncate rounded-lg text-lg font-extrabold tracking-tight text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-white sm:inline lg:hidden xl:inline"
            >
              {fullName}
            </a>
          </div>

          {/* Desktop links (lg+). Scrolls horizontally instead of breaking the layout if labels get long */}
          <ul className="no-scrollbar hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex xl:gap-1">
            {links.map((link) => {
              const isActive = active === link.key;
              return (
                <li key={link.key} className="shrink-0">
                  <a
                    href={`#${link.key}`}
                    onClick={(e) => go(e, link.key)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium transition-colors xl:px-3 ${
                      isActive
                        ? 'font-semibold text-brand dark:text-brand-light'
                        : 'text-slate-600 hover:text-brand dark:text-slate-300 dark:hover:text-brand-light'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-x-0 inset-y-1.5 -z-10 rounded-lg border border-brand/20 bg-brand/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            {/* Social icons only on xl+ (the drawer shows them on smaller screens) */}
            <SocialLinks links={socialLinks.slice(0, 3)} variant="icon" className="hidden xl:flex" />
            <ThemeToggle />
            {/* Hamburger: visible below lg only */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            >
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile/tablet drawer (below lg). Rendered OUTSIDE <header>: the header's
          backdrop-filter would otherwise become the containing block of this fixed panel. */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
            <motion.div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              aria-hidden="true"
            />
            {/* Panel: 85% of the screen on phones, capped at 24rem on tablets; full dynamic height */}
            <motion.aside
              className="absolute inset-y-0 right-0 flex h-full w-[85vw] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="min-w-0 truncate font-bold text-slate-900 dark:text-white">{fullName}</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <ul className="flex-1 space-y-1 px-3 py-4">
                {links.map((link) => {
                  const isActive = active === link.key;
                  return (
                    <li key={link.key}>
                      <a
                        href={`#${link.key}`}
                        onClick={(e) => go(e, link.key)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex min-h-11 items-center rounded-xl px-4 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-brand/10 font-semibold text-brand dark:text-brand-light'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-3 border-t border-slate-100 px-3 py-4 dark:border-slate-800">
                {resumeHref && (
                  <a
                    href={resumeHref}
                    {...(resumeIsStatic && { download: resume.fileName || true })}
                    className="bg-gradient-brand flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md"
                  >
                    <FiDownload className="h-4 w-4" aria-hidden="true" />
                    Download Resume
                  </a>
                )}
                <SocialLinks links={socialLinks} variant="list" />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
