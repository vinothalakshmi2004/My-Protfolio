/**
 * ExperienceSection — career timeline (company, role, dates, location, logo, bullets).
 *
 * Layout: single left-aligned column below lg (line + dots on the left);
 * on lg+ the line moves to the centre and cards alternate left/right with the
 * date shown on the opposite side.
 */
import { motion } from 'framer-motion';
import { FiBriefcase, FiCalendar, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';
import { formatMonthRange } from '../utils/format';

export const ExperienceSection = ({ experiences = [], content, muted }) => (
  <Section id="experience" content={content} muted={muted} narrow>
    <ol className="relative">
      {/* Timeline line: left edge on mobile/tablet, centre on lg+ */}
      <span
        className="absolute bottom-0 left-4 top-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-brand/40 via-brand/20 to-transparent lg:left-1/2"
        aria-hidden="true"
      />

      {experiences.map((exp, idx) => {
        const period = formatMonthRange(exp.startDate, exp.endDate, exp.isCurrent);
        const onLeft = idx % 2 === 0; // lg+ only

        return (
          // Mobile: card indented past the line (pl-12). lg+: 2-column grid, card + date in one row
          <li key={exp._id || `${exp.company}-${idx}`} className="relative pb-10 pl-12 last:pb-0 lg:grid lg:grid-cols-2 lg:gap-14 lg:pl-0">
            {/* Timeline dot */}
            <span
              className={`absolute left-4 top-6 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white dark:border-slate-950 lg:left-1/2 ${
                exp.isCurrent ? 'bg-brand text-white shadow-lg ring-4 ring-brand/20' : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
              aria-hidden="true"
            >
              <FiBriefcase className="h-3.5 w-3.5" />
            </span>

            {/* Date on the opposite side of the card (lg+ only; shown inside the card below lg) */}
            {period && (
              <div
                className={`hidden pt-7 lg:row-start-1 lg:flex lg:items-start ${
                  onLeft ? 'lg:col-start-2 lg:justify-start' : 'lg:col-start-1 lg:justify-end'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand dark:text-brand-light">
                  <FiCalendar className="h-4 w-4" aria-hidden="true" />
                  {period}
                </span>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className={`min-w-0 lg:row-start-1 ${onLeft ? 'lg:col-start-1' : 'lg:col-start-2'}`}
            >
              <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 sm:p-7">
                <header className="mb-4 flex items-start gap-3 sm:gap-4">
                  {exp.companyLogo?.url && (
                    <SafeImage
                      src={exp.companyLogo.url}
                      alt={`${exp.company} logo`}
                      width={96}
                      height={96}
                      aspect="aspect-square"
                      fit="contain"
                      fallbackText={exp.company}
                      initialsClassName="text-base"
                      className="w-12 shrink-0 rounded-xl border border-slate-100 bg-white dark:border-slate-800 sm:w-14"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">{exp.role}</h3>
                    <p className="break-words font-bold text-brand dark:text-brand-light">{exp.company}</p>
                  </div>
                </header>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  {/* Period badge inside the card below lg (lg+ shows it beside the timeline) */}
                  {period && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 font-semibold text-brand dark:text-brand-light lg:hidden">
                      <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {period}
                    </span>
                  )}
                  {exp.isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                      Present
                    </span>
                  )}
                  {exp.location && (
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <FiMapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      {exp.location}
                    </span>
                  )}
                </div>

                {exp.bullets?.length > 0 && (
                  <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                    {exp.bullets.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                        <span className="min-w-0 break-words">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </motion.div>
          </li>
        );
      })}
    </ol>
  </Section>
);

export default ExperienceSection;
