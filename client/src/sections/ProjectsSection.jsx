/**
 * ProjectsSection — project cards with category filter chips and a details modal.
 * Filter chips are generated from the projects' own categories ("All" + each
 * distinct category) and only appear when there are at least two categories.
 */
import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiExternalLink, FiEye, FiGithub, FiLayers, FiStar } from 'react-icons/fi';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';
import ProjectModal from '../components/ProjectModal';

const ALL = '__all__';
const MAX_TECH_BADGES = 6;

export const ProjectsSection = ({ projects = [], content, muted }) => {
  const [filter, setFilter] = useState(ALL);
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);

  // Distinct categories, case-insensitive, in the order they first appear
  const categories = useMemo(() => {
    const seen = new Map();
    projects.forEach((p) => {
      const cat = (p.category || '').trim();
      if (cat && !seen.has(cat.toLowerCase())) seen.set(cat.toLowerCase(), cat);
    });
    return [...seen.values()];
  }, [projects]);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => (p.category || '').trim().toLowerCase() === filter.toLowerCase())),
    [projects, filter]
  );

  return (
    <Section id="projects" content={content} muted={muted}>
      {categories.length >= 2 && (
        // Chips wrap onto multiple lines on narrow screens
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter projects by category">
          {[ALL, ...categories].map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                aria-pressed={active}
                className={`min-h-11 rounded-2xl px-5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-brand text-white shadow-md shadow-brand/25'
                    : 'border border-slate-200/80 bg-white text-slate-700 hover:border-brand/50 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {cat === ALL ? 'All' : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile: 1 col, md: 2 cols, lg: 3 cols */}
      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        <AnimatePresence mode="popLayout">
          {visible.map((project, idx) => {
            const extraTech = (project.techStack?.length || 0) - MAX_TECH_BADGES;
            return (
              <motion.article
                layout
                key={project._id || project.slug || project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.05 }}
                className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10 dark:border-slate-800/80 dark:bg-slate-900"
              >
                {/* Thumbnail (16:9). Shows the title's initials if no image was uploaded */}
                <button
                  type="button"
                  onClick={() => setSelected(project)}
                  className="relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  aria-label={`View details of ${project.title}`}
                >
                  <SafeImage
                    src={project.thumbnail?.url}
                    alt={project.title}
                    width={800}
                    height={450}
                    aspect="aspect-video"
                    fallbackText={project.title}
                    initialsClassName="text-4xl"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  {project.featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow">
                      <FiStar className="h-3 w-3" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {project.category && (
                    <span className="mb-3 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:text-brand-light">
                      <FiLayers className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{project.category}</span>
                    </span>
                  )}

                  <h3 className="mb-2 break-words text-xl font-bold text-slate-900 transition-colors group-hover:text-brand dark:text-white dark:group-hover:text-brand-light">
                    {project.title}
                  </h3>

                  {(project.shortDescription || project.fullDescription) && (
                    <p className="mb-5 line-clamp-3 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {project.shortDescription || project.fullDescription}
                    </p>
                  )}

                  {project.techStack?.length > 0 && (
                    <ul className="mb-5 flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, MAX_TECH_BADGES).map((tech) => (
                        <li
                          key={tech}
                          className="rounded-lg border border-slate-200/60 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tech}
                        </li>
                      ))}
                      {extraTech > 0 && (
                        <li className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500">+{extraTech} more</li>
                      )}
                    </ul>
                  )}

                  {/* Actions pinned to the bottom of the card; wrap if space is tight */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelected(project)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-bold text-brand transition-colors hover:text-brand-dark dark:text-brand-light"
                    >
                      <FiEye className="h-4 w-4" aria-hidden="true" />
                      View Details
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Live demo of ${project.title}`}
                          className="bg-gradient-brand inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
                        >
                          <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          Live
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Source code of ${project.title}`}
                          title="Source code"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:text-brand dark:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-light"
                        >
                          <FiGithub className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selected && <ProjectModal key={selected._id || selected.slug} project={selected} onClose={closeModal} />}
      </AnimatePresence>
    </Section>
  );
};

export default ProjectsSection;
