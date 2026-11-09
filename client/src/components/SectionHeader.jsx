/**
 * SectionHeader — badge + title + subtitle heading shared by every section.
 * All three strings come from settings.sectionContent (editable in /admin/sections);
 * an empty badge or subtitle is simply not rendered.
 */
import { motion } from 'framer-motion';

export const SectionHeader = ({ badge, title, subtitle, center = true, id }) => (
  <div className={`mb-10 md:mb-14 ${center ? 'text-center' : 'text-left'}`}>
    {badge && (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand-light"
      >
        <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-brand" aria-hidden="true" />
        <span className="truncate">{badge}</span>
      </motion.div>
    )}

    {/* Fluid heading: ~28px on 320px phones up to 48px on desktop */}
    <motion.h2
      id={id}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="break-words text-[clamp(1.75rem,3.2vw+1rem,3rem)] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white"
    >
      {title}
      <span className="text-gradient-brand">.</span>
    </motion.h2>

    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400 md:text-lg ${center ? 'mx-auto' : ''}`}
      >
        {subtitle}
      </motion.p>
    )}

    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`bg-gradient-brand mt-4 h-1 w-20 rounded-full ${center ? 'mx-auto' : ''}`}
      aria-hidden="true"
    />
  </div>
);

export default SectionHeader;
