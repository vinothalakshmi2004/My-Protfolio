/**
 * EducationSection — degree cards with years, score (CGPA / % / grade),
 * institution, location and notes (e.g. awards).
 */
import { motion } from 'framer-motion';
import { FiAward, FiCalendar, FiMapPin } from 'react-icons/fi';
import Section from '../components/Section';
import { formatScore, formatYearRange } from '../utils/format';

export const EducationSection = ({ education = [], content, muted }) => (
  <Section id="education" content={content} muted={muted}>
    {/* Mobile: 1 col, md: 2 cols, lg: 3 cols */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {education.map((item, idx) => {
        const years = formatYearRange(item.startYear, item.endYear);
        const score = formatScore(item.scoreType, item.score);
        return (
          <motion.article
            key={item._id || `${item.degree}-${idx}`}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
            className="flex min-w-0 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900 sm:p-7"
          >
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                {years && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:text-brand-light">
                    <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {years}
                  </span>
                )}
                {score && (
                  <span className="bg-gradient-brand rounded-full px-3 py-1 text-xs font-extrabold text-white shadow-sm">{score}</span>
                )}
              </div>
              <h3 className="mb-2 break-words text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{item.degree}</h3>
              <p className="mb-2 break-words text-sm font-semibold text-brand dark:text-brand-light">{item.institution}</p>
              {item.location && (
                <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <FiMapPin className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                  <span className="min-w-0 break-words">{item.location}</span>
                </p>
              )}
            </div>
            {item.notes && (
              <p className="flex items-start gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
                <FiAward className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="min-w-0 whitespace-pre-line break-words">{item.notes}</span>
              </p>
            )}
          </motion.article>
        );
      })}
    </div>
  </Section>
);

export default EducationSection;
