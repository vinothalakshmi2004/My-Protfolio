/**
 * Scroll helpers for the single-page landing layout.
 *
 *  useActiveSection(ids) -> id of the section currently in the middle of the viewport
 *                           (drives the highlighted navbar link)
 *  scrollToSection(id)   -> smooth-scrolls to a section; the fixed navbar offset is
 *                           handled by `scroll-padding-top` on <html> (index.css)
 */
import { useEffect, useState } from 'react';

export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

export const useActiveSection = (ids = []) => {
  const [active, setActive] = useState(ids[0] || '');
  const key = ids.join('|');

  useEffect(() => {
    if (!ids.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      // A thin band around 40% of the viewport height = "the section being read"
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
};

export default useActiveSection;
