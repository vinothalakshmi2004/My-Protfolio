/**
 * Landing-page section registry (must match SECTION_KEYS on the server).
 * Hero and footer are always shown; these 8 can be hidden/reordered from /admin/sections.
 */
export const SECTION_KEYS = [
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
  'achievements',
  'contact',
];

/** Generic fallbacks used only if a heading is missing from settings.sectionContent. */
export const DEFAULT_SECTION_CONTENT = {
  about: { navLabel: 'About', badge: 'About Me', title: 'About Me', subtitle: '' },
  skills: { navLabel: 'Skills', badge: 'Skills', title: 'Skills & Technologies', subtitle: '' },
  experience: { navLabel: 'Experience', badge: 'Experience', title: 'Work Experience', subtitle: '' },
  projects: { navLabel: 'Projects', badge: 'Portfolio', title: 'Projects', subtitle: '' },
  education: { navLabel: 'Education', badge: 'Education', title: 'Education', subtitle: '' },
  certifications: { navLabel: 'Certifications', badge: 'Credentials', title: 'Certifications', subtitle: '' },
  achievements: { navLabel: 'Achievements', badge: 'Recognition', title: 'Achievements', subtitle: '' },
  contact: { navLabel: 'Contact', badge: 'Get In Touch', title: 'Contact', subtitle: '' },
};

/** Heading copy for a section (settings value, falling back to the generic default per field). */
export const getSectionContent = (settings, key) => {
  const custom = settings?.sectionContent?.[key] || {};
  const defaults = DEFAULT_SECTION_CONTENT[key] || {};
  return {
    navLabel: custom.navLabel || defaults.navLabel,
    badge: custom.badge ?? defaults.badge,
    title: custom.title || defaults.title,
    subtitle: custom.subtitle ?? defaults.subtitle,
  };
};

/** Normalises an order array: known keys only, no duplicates, missing keys appended. */
export const normaliseSectionOrder = (order = []) => {
  const seen = new Set();
  const clean = (Array.isArray(order) ? order : []).filter(
    (key) => SECTION_KEYS.includes(key) && !seen.has(key) && seen.add(key)
  );
  return [...clean, ...SECTION_KEYS.filter((key) => !seen.has(key))];
};

/**
 * Decides which sections render, in which order. A section is shown when the
 * owner enabled it AND it has something to show (empty lists are hidden).
 * The navbar uses the same list, so hidden sections also disappear from the menu.
 */
export const getVisibleSections = (settings, data) => {
  const hasContent = {
    about: Boolean(settings?.aboutLongText || settings?.summary || settings?.stats?.length),
    skills: data.skills?.length > 0,
    experience: data.experience?.length > 0,
    projects: data.projects?.length > 0,
    education: data.education?.length > 0,
    certifications: data.certifications?.length > 0,
    achievements: data.achievements?.length > 0,
    contact: true, // the form always works, even without public contact details
  };
  return normaliseSectionOrder(settings?.sectionOrder).filter(
    (key) => settings?.sectionVisibility?.[key] !== false && hasContent[key]
  );
};
