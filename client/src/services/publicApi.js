/**
 * Public (no auth) API calls used by the landing page.
 * Every list endpoint returns only VISIBLE items, already sorted by `order`.
 */
import { publicClient, unwrap } from '../lib/apiClient';

export const publicApi = {
  /** GET /api/settings — site-wide content (name, hero, contact, socials, sections, SEO, theme...) */
  getSettings: () => publicClient.get('/settings').then(unwrap),
  /** GET /api/projects */
  getProjects: () => publicClient.get('/projects').then(unwrap),
  /** GET /api/experience */
  getExperience: () => publicClient.get('/experience').then(unwrap),
  /** GET /api/skills */
  getSkills: () => publicClient.get('/skills').then(unwrap),
  /** GET /api/education */
  getEducation: () => publicClient.get('/education').then(unwrap),
  /** GET /api/certifications */
  getCertifications: () => publicClient.get('/certifications').then(unwrap),
  /** GET /api/achievements */
  getAchievements: () => publicClient.get('/achievements').then(unwrap),
  /** POST /api/contact — returns the full { success, message } envelope */
  submitContact: (payload) => publicClient.post('/contact', payload, { timeout: 20000 }).then((res) => res.data),
};

export default publicApi;
