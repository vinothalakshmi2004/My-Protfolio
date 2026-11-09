/**
 * AchievementsSection — awards / honours with optional image, description and date.
 */
import { motion } from 'framer-motion';
import { FiCalendar, FiStar } from 'react-icons/fi';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';
import { formatMonth } from '../utils/format';

export const AchievementsSection = ({ achievements = [], content, muted }) => (
  <Section id="achievements" content={content} muted={muted}>
    {/* Mobile: 1 col, sm: 2 cols, lg: 3 cols */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {achievements.map((item, idx) => {
        const date = formatMonth(item.date);
        return (
          <motion.article
            key={item._id || `${item.title}-${idx}`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: (idx % 3) * 0.06 }}
            className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-white to-brand/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-amber-800/30 dark:from-slate-900 dark:via-slate-900 dark:to-brand/10"
          >
            {item.image?.url && (
              <SafeImage
                src={item.image.url}
                alt={item.title}
                width={800}
                height={450}
                aspect="aspect-video"
                fallbackText={item.title}
              />
            )}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {!item.image?.url && (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FiStar className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
              <h3 className="mb-1.5 break-words font-bold leading-snug text-slate-900 dark:text-white">{item.title}</h3>
              {item.description && (
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              )}
              {date && (
                <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {date}
                </p>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  </Section>
);

export default AchievementsSection;
