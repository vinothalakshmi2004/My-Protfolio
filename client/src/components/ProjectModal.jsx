/**
 * ProjectModal — project details dialog.
 *  - Full-screen sheet on phones, centred card (max-w-3xl) on md+, scrollable inside
 *  - Main image + clickable gallery thumbnails (thumbnail first, then gallery)
 *  - Full description, features, tech stack, GitHub / live links
 *  - Closes on ESC, backdrop click or the close button; locks body scroll;
 *    focuses the close button on open and keeps Tab focus inside the dialog
 *
 * Mount it inside <AnimatePresence> so the exit animation plays.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiExternalLink, FiGithub, FiLayers, FiStar, FiX } from 'react-icons/fi';
import SafeImage from './SafeImage';

export const ProjectModal = ({ project, onClose }) => {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const images = [project.thumbnail, ...(project.gallery || [])].filter((img) => img?.url);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      // Minimal focus trap: wrap Tab / Shift+Tab inside the panel
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll('a[href], button:not([disabled])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const description = project.fullDescription || project.shortDescription;

  return (
    // Mobile: sheet fills the screen; md+: centred with padding around the card
    <div className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-6" role="presentation">
      <motion.div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        // Mobile: full width + full dynamic viewport height; md+: max-w-3xl, max 90vh, rounded
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-3xl md:border md:border-slate-200 md:dark:border-slate-800"
      >
        {/* Sticky header with title + close */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {project.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand dark:text-brand-light">
                  <FiLayers className="h-3 w-3" aria-hidden="true" />
                  {project.category}
                </span>
              )}
              {project.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <FiStar className="h-3 w-3" aria-hidden="true" />
                  Featured
                </span>
              )}
            </div>
            <h3 id="project-modal-title" className="break-words text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              {project.title}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {images.length > 0 && (
            <div className="mb-6">
              <SafeImage
                src={activeImage?.url}
                alt={`${project.title} screenshot ${activeIndex + 1}`}
                width={1600}
                height={900}
                aspect="aspect-video"
                fit="contain"
                fallbackText={project.title}
                className="rounded-2xl bg-slate-100 dark:bg-slate-800"
                eager
              />
              {images.length > 1 && (
                // Thumbnail strip scrolls horizontally on narrow screens instead of wrapping
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Project images">
                  {images.map((img, i) => (
                    <button
                      key={img.fileId || img.url}
                      type="button"
                      role="listitem"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === activeIndex ? 'true' : undefined}
                      className={`shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                        i === activeIndex ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={img.url} alt="" width={160} height={90} className="h-12 w-20 sm:h-14 sm:w-24" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {description && (
            <p className="mb-6 whitespace-pre-line break-words leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
          )}

          {project.features?.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Key Features</h4>
              <ul className="space-y-2.5">
                {project.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    <span className="min-w-0 break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.techStack?.length > 0 && (
            <div className="mb-2">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions: full-width stacked buttons on phones, inline on sm+ */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <FiGithub className="h-4 w-4" aria-hidden="true" />
                Source Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-brand inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition-opacity hover:opacity-95"
              >
                <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                Live Demo
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectModal;
