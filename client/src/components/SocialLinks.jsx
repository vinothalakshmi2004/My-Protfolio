/**
 * SocialLinks — renders the owner's social profiles from settings.socialLinks
 * (already filtered to visible links). Icons come from utils/icons.js.
 *
 * Variants:
 *   'icon'  -> round 44px icon buttons (hero, footer)
 *   'pill'  -> icon + label chips (contact section)
 *   'list'  -> full-width rows (mobile navbar drawer)
 *
 * External http(s) links open in a new tab with rel="noopener noreferrer";
 * mailto:/tel: links open in the same tab.
 */
import { getSocialIcon, getSocialLabel } from '../utils/icons';

const VARIANT_CLASSES = {
  icon:
    'inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:text-white hover:bg-brand hover:border-brand dark:hover:bg-brand shadow-sm transition-colors',
  pill:
    'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand/10 hover:text-brand dark:hover:text-brand-light transition-colors',
  list:
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
};

export const SocialLinks = ({ links = [], variant = 'icon', className = '' }) => {
  if (!links?.length) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${variant === 'list' ? 'flex-col items-stretch' : ''} ${className}`}>
      {links.map((link) => {
        const Icon = getSocialIcon(link);
        const label = getSocialLabel(link);
        const isWeb = /^https?:\/\//i.test(link.url || '');
        return (
          <li key={link._id || `${link.platform}-${link.url}`}>
            <a
              href={link.url}
              {...(isWeb && { target: '_blank', rel: 'noopener noreferrer' })}
              aria-label={label}
              title={label}
              className={VARIANT_CLASSES[variant] || VARIANT_CLASSES.icon}
            >
              <Icon className={variant === 'icon' ? 'h-5 w-5' : 'h-4 w-4 shrink-0'} aria-hidden="true" />
              {variant !== 'icon' && <span className="truncate">{label}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks;
