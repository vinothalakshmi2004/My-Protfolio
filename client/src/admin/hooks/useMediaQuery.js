/**
 * useMediaQuery('(min-width: 1024px)') — true while the query matches (updates live on resize).
 * Used where layout changes structure, not just style (e.g. Messages: split view vs. modal).
 */
import { useEffect, useState } from 'react';

export const useMediaQuery = (query) => {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
