/**
 * usePortfolioData — loads everything the landing page shows, in parallel:
 *   /settings + /projects + /experience + /skills + /education + /certifications + /achievements
 *
 * Fallback rules:
 *  - A request that FAILS uses the matching piece of src/data/fallback.js.
 *  - A request that succeeds with an EMPTY list stays empty (the section is
 *    hidden) — deleting everything in the admin must not resurrect old data.
 *  - Free hosting can cold-start for 30s+. After SOFT_TIMEOUT_MS we render the
 *    fallback so visitors aren't stuck on a skeleton, then swap in live data
 *    as soon as it arrives.
 */
import { useEffect, useState } from 'react';
import { publicApi } from '../services/publicApi';
import { fallbackData } from '../data/fallback';
import { SECTION_KEYS, normaliseSectionOrder } from '../utils/sections';

const SOFT_TIMEOUT_MS = 8000;

const REQUESTS = {
  settings: publicApi.getSettings,
  skills: publicApi.getSkills,
  experience: publicApi.getExperience,
  projects: publicApi.getProjects,
  education: publicApi.getEducation,
  certifications: publicApi.getCertifications,
  achievements: publicApi.getAchievements,
};

/** Guarantees the settings object has every nested structure the UI reads. */
export const normaliseSettings = (s = {}) => ({
  ...s,
  typingRoles: Array.isArray(s.typingRoles) ? s.typingRoles.filter(Boolean) : [],
  hero: { greeting: '', availabilityText: '', showAvailability: false, ...(s.hero || {}) },
  contact: { email: '', phone: '', location: '', whatsapp: '', intro: '', responseTime: '', ...(s.contact || {}) },
  socialLinks: Array.isArray(s.socialLinks) ? s.socialLinks.filter((l) => l?.url && l.visible !== false) : [],
  stats: Array.isArray(s.stats) ? s.stats : [],
  sectionVisibility: { ...Object.fromEntries(SECTION_KEYS.map((k) => [k, true])), ...(s.sectionVisibility || {}) },
  sectionOrder: normaliseSectionOrder(s.sectionOrder),
  sectionContent: s.sectionContent || {},
  seo: { title: '', description: '', keywords: '', ...(s.seo || {}) },
  theme: s.theme || {},
  resume: s.resume || {},
  profileImage: s.profileImage || {},
  aboutImage: s.aboutImage || {},
  favicon: s.favicon || {},
});

const fromResults = (results) => {
  const data = {};
  let usedFallback = false;
  Object.keys(REQUESTS).forEach((key, i) => {
    const result = results[i];
    const ok = result.status === 'fulfilled' && (key === 'settings' ? Boolean(result.value) : Array.isArray(result.value));
    if (!ok) usedFallback = true;
    data[key] = ok ? result.value : fallbackData[key];
  });
  data.settings = normaliseSettings(data.settings);
  return { data, usedFallback };
};

export const usePortfolioData = () => {
  const [state, setState] = useState({ loading: true, isFallback: false, data: null });

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    // Show fallback content if the API is slow (cold start); live data replaces it later
    const softTimer = setTimeout(() => {
      if (!cancelled && !settled) {
        setState({ loading: false, isFallback: true, data: { ...fallbackData, settings: normaliseSettings(fallbackData.settings) } });
      }
    }, SOFT_TIMEOUT_MS);

    Promise.allSettled(Object.values(REQUESTS).map((request) => request())).then((results) => {
      settled = true;
      clearTimeout(softTimer);
      if (cancelled) return;
      const { data, usedFallback } = fromResults(results);
      if (usedFallback) console.warn('[Portfolio] Some API calls failed — using fallback data for those sections.');
      setState({ loading: false, isFallback: usedFallback, data });
    });

    return () => {
      cancelled = true;
      clearTimeout(softTimer);
    };
  }, []);

  return state;
};

export default usePortfolioData;
