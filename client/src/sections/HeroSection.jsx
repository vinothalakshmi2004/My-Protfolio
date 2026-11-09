/**
 * HeroSection — first screen. Everything comes from settings:
 * greeting, full name, typing roles, summary, location, availability pill,
 * resume download, social links, profile photo (or initials) and the first stat.
 * Buttons only appear when their target exists (projects/contact section visible, resume uploaded).
 */
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { FiArrowRight, FiDownload, FiMail, FiMapPin } from 'react-icons/fi';
import SafeImage from '../components/SafeImage';
import SocialLinks from '../components/SocialLinks';
import { fileUrl } from '../lib/apiClient';
import { scrollToSection } from '../hooks/useActiveSection';

export const HeroSection = ({ settings, visibleSections = [] }) => {
  const {
    fullName = '',
    headline = '',
    typingRoles = [],
    summary = '',
    hero = {},
    contact = {},
    socialLinks = [],
    resume = {},
    profileImage = {},
    stats = [],
  } = settings;

  const showProjects = visibleSections.includes('projects');
  const showContact = visibleSections.includes('contact');
  const resumeHref = resume?.url ? fileUrl(resume.url, { download: true }) : '';
  const resumeIsStatic = resume?.url && !resume.url.startsWith('/api/'); // offline fallback copy in /public
  const badgeStat = stats[0];

  const go = (e, id) => {
    e.preventDefault();
    scrollToSection(id);
  };

  // Primary/secondary button styles. Mobile: full-width stacked; sm+: auto width, wrapping row
  const btnBase =
    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold transition-all active:scale-[0.98] sm:w-auto';

  return (
    <section id="home" className="relative flex min-h-screen min-h-dvh items-center overflow-hidden pb-16 pt-24 sm:pt-28">
      {/* Decorative glows (clipped by overflow-hidden, capped at 90vw so they never cause sideways scroll) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[34rem] w-[34rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-gradient-to-tr from-brand/20 via-accent/15 to-brand-light/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute bottom-10 left-6 -z-10 h-64 w-64 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile/tablet: single column (text, then card). lg+: 7/5 split side by side */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            // Centered text on mobile/tablet, left-aligned on lg+
            className="min-w-0 space-y-6 text-center lg:col-span-7 lg:text-left"
          >
            {hero.showAvailability && hero.availabilityText && (
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="truncate">{hero.availabilityText}</span>
              </div>
            )}

            <div className="space-y-2">
              {hero.greeting && (
                <p className="text-lg font-semibold text-brand dark:text-brand-light sm:text-xl">{hero.greeting}</p>
              )}
              {/* Fluid name size: 36px on 320px phones → 72px on wide screens */}
              <h1 className="break-words text-[clamp(2.25rem,6vw+1rem,4.5rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                {fullName}
              </h1>
            </div>

            {/* Typing roles (falls back to the static headline when no roles are set) */}
            <div className="flex min-h-[2.5em] items-center justify-center text-[clamp(1.25rem,2.5vw+0.75rem,2.25rem)] font-bold lg:justify-start">
              {typingRoles.length > 1 ? (
                <TypeAnimation
                  key={typingRoles.join('|')}
                  sequence={typingRoles.flatMap((role) => [role, 2000])}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="text-gradient-brand"
                />
              ) : (
                <span className="text-gradient-brand break-words">{typingRoles[0] || headline}</span>
              )}
            </div>

            {summary && (
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
                {summary}
              </p>
            )}

            {contact.location && (
              <p className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 lg:justify-start">
                <FiMapPin className="shrink-0 text-brand" aria-hidden="true" />
                <span>{contact.location}</span>
              </p>
            )}

            {/* Buttons. Mobile: stacked full-width; sm+: wrap in a row (centred), lg+: left-aligned */}
            <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              {showProjects && (
                <a
                  href="#projects"
                  onClick={(e) => go(e, 'projects')}
                  className={`${btnBase} bg-gradient-brand text-white shadow-lg shadow-brand/25 hover:shadow-xl`}
                >
                  View Projects
                  <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {resumeHref && (
                <a
                  href={resumeHref}
                  {...(resumeIsStatic && { download: resume.fileName || true })}
                  className={`${btnBase} border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-brand/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100`}
                >
                  <FiDownload className="h-4 w-4 text-brand" aria-hidden="true" />
                  Download Resume
                </a>
              )}
              {showContact && (
                <a
                  href="#contact"
                  onClick={(e) => go(e, 'contact')}
                  className={`${btnBase} text-slate-700 hover:text-brand dark:text-slate-200 dark:hover:text-brand-light`}
                >
                  <FiMail className="h-4 w-4" aria-hidden="true" />
                  Contact Me
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex justify-center border-t border-slate-200/60 pt-5 dark:border-slate-800/60 lg:justify-start">
                <SocialLinks links={socialLinks} variant="icon" className="justify-center lg:justify-start" />
              </div>
            )}
          </motion.div>

          {/* Profile card: centred under the text on mobile, right column on lg+ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center lg:col-span-5"
          >
            <div className="group relative w-full max-w-[17rem] sm:max-w-xs">
              <div
                className="absolute -inset-1.5 animate-pulse-slow rounded-3xl bg-gradient-to-r from-brand via-brand-light to-accent opacity-60 blur-xl transition duration-700 group-hover:opacity-90"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-2xl dark:border-slate-800/80 dark:bg-slate-900">
                <div className="relative">
                  {/* Photo: 144px on phones, 176px on sm+ */}
                  <div className="bg-gradient-brand rounded-full p-1 shadow-inner">
                    <SafeImage
                      src={profileImage?.url}
                      alt={fullName}
                      width={400}
                      height={400}
                      aspect="aspect-square"
                      fallbackText={fullName}
                      initialsClassName="text-4xl sm:text-5xl"
                      eager
                      className="w-36 rounded-full bg-slate-100 dark:bg-slate-800 sm:w-44"
                    />
                  </div>
                  {badgeStat && (
                    <div className="absolute -bottom-2 -right-3 max-w-[10rem] truncate rounded-full border border-white/20 bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-lg dark:bg-white dark:text-slate-900">
                      {badgeStat.value} {badgeStat.label}
                    </div>
                  )}
                </div>
                <div className="mt-6 w-full min-w-0">
                  <div className="break-words font-bold text-slate-800 dark:text-slate-100">{fullName}</div>
                  {headline && <div className="mt-1 break-words text-xs font-medium text-brand dark:text-brand-light">{headline}</div>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
