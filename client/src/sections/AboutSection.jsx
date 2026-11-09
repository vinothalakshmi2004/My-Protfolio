/**
 * AboutSection — long "about" text (paragraphs split on blank lines), optional
 * about image, location/e-mail chips and the owner-editable stats tiles.
 */
import { motion } from 'framer-motion';
import { FiAward, FiBookOpen, FiBriefcase, FiFolder, FiMail, FiMapPin } from 'react-icons/fi';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';

// Decorative icons cycled across stat tiles (the numbers/labels themselves come from settings.stats)
const STAT_ICONS = [FiFolder, FiBriefcase, FiAward, FiBookOpen];

export const AboutSection = ({ settings, content, muted }) => {
  const { aboutLongText = '', summary = '', headline = '', contact = {}, stats = [], aboutImage = {}, fullName = '' } = settings;
  const paragraphs = (aboutLongText || summary)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasStats = stats.length > 0;

  return (
    <Section id="about" content={content} muted={muted}>
      {/* Mobile/tablet: stacked. lg+: text 7/12 + stats 5/12 (text spans full width when there are no stats) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`min-w-0 ${hasStats ? 'lg:col-span-7' : 'lg:col-span-12'}`}
        >
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 sm:p-8">
            {aboutImage?.url && (
              <SafeImage
                src={aboutImage.url}
                alt={fullName}
                width={1200}
                height={675}
                aspect="aspect-video"
                fallbackText={fullName}
                className="mb-2 rounded-2xl"
              />
            )}
            {headline && <h3 className="break-words text-xl font-bold text-slate-900 dark:text-white">{headline}</h3>}
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line break-words leading-relaxed text-slate-600 dark:text-slate-300">
                {p}
              </p>
            ))}

            {(contact.location || contact.email) && (
              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-sm font-medium dark:border-slate-800">
                {contact.location && (
                  <div className="flex min-h-11 max-w-full items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                    <FiMapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    <span className="min-w-0 break-words">{contact.location}</span>
                  </div>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex min-h-11 max-w-full items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-slate-700 transition-colors hover:text-brand dark:bg-slate-800/70 dark:text-slate-300 dark:hover:text-brand-light"
                  >
                    <FiMail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {/* break-all: long e-mail addresses must wrap on 320px screens */}
                    <span className="min-w-0 break-all">{contact.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {hasStats && (
          // Stats: always 2 columns (tiles are compact); sit beside the text on lg+
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
            {stats.map((stat, idx) => {
              const Icon = STAT_ICONS[idx % STAT_ICONS.length];
              return (
                <motion.div
                  key={stat._id || `${stat.label}-${idx}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex min-w-0 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 sm:p-5"
                >
                  <div className="bg-gradient-brand mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="break-words text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{stat.value}</div>
                    <div className="mt-1 break-words text-xs font-bold text-slate-700 dark:text-slate-300">{stat.label}</div>
                    {stat.subtext && (
                      <div className="mt-0.5 break-words text-[11px] text-slate-500 dark:text-slate-500">{stat.subtext}</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
};

export default AboutSection;
