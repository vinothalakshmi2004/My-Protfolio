/**
 * Footer — initials badge, full name, headline, social links, footer text
 * (all from settings) plus © year and a back-to-top button.
 */
import { FiArrowUp } from 'react-icons/fi';
import SocialLinks from './SocialLinks';
import { getInitials } from '../utils/format';
import { scrollToSection } from '../hooks/useActiveSection';

export const Footer = ({ settings }) => {
  const { fullName = '', headline = '', socialLinks = [], footerText = '' } = settings || {};
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-white py-10 text-slate-600 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400 sm:py-12">
      {/* Mobile: stacked + centred; md+: brand left, socials right */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center justify-center gap-2.5 md:justify-start">
            <span className="bg-gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white">
              {getInitials(fullName)}
            </span>
            <span className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{fullName}</span>
          </div>
          {headline && <p className="mt-2 break-words text-sm">{headline}</p>}
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <SocialLinks links={socialLinks} variant="icon" />
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              aria-label="Back to top"
              title="Back to top"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
              <FiArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="break-words text-xs text-slate-500">
            {footerText && <span>{footerText} </span>}
            <span>&copy; {year}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
