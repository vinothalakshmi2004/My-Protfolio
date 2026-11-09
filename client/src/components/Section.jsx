/**
 * Section — common wrapper for every landing-page section:
 * anchor id (navbar target), alternating background, container width and the
 * SectionHeader built from settings.sectionContent[key].
 *
 * `muted` alternates the background so stripes stay consistent whatever order
 * the owner chooses in /admin/sections.
 */
import SectionHeader from './SectionHeader';

export const Section = ({ id, content = {}, muted = false, narrow = false, children }) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    // Vertical rhythm: 64px on phones, 80px on md, 96px on lg+
    className={`relative py-16 md:py-20 lg:py-24 ${muted ? 'bg-slate-100/60 dark:bg-slate-900/40' : ''}`}
  >
    {/* Side padding grows with the screen: 16px → 24px (sm) → 32px (lg) */}
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-5xl' : 'max-w-7xl'}`}>
      <SectionHeader id={`${id}-title`} badge={content.badge} title={content.title} subtitle={content.subtitle} />
      {children}
    </div>
  </section>
);

export default Section;
