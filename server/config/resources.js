/**
 * Registry of every orderable / hideable portfolio resource.
 * Routes (/api/<path> and /api/admin/<path>) and controllers are generated from this list,
 * so adding a new resource = add a model, a validator and one entry here.
 */
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const validators = require('../validators');
const { slugify, escapeRegex } = require('../utils/sanitizers');

/** Returns `base`, or `base-2`, `base-3`, ... so the slug is unique among projects. */
const uniqueProjectSlug = async (base, excludeId) => {
  const root = base || 'project';
  let candidate = root;
  for (let n = 2; ; n += 1) {
    const clash = await Project.exists({ slug: candidate, ...(excludeId && { _id: { $ne: excludeId } }) });
    if (!clash) return candidate;
    candidate = `${root}-${n}`;
  }
};

const resources = [
  {
    key: 'projects',
    path: 'projects',
    label: 'Project',
    Model: Project,
    rules: validators.project,
    /** Generates a unique slug from the title (or the admin-provided slug). */
    prepare: async (data, { existing }) => {
      const wantsNewSlug = data.slug !== undefined || !existing || !existing.slug;
      if (!wantsNewSlug) return;
      const base = slugify(data.slug || data.title || existing?.title || '');
      data.slug = await uniqueProjectSlug(base, existing?._id);
    },
    /** Public filters: ?featured=true&category=MERN */
    publicFilter: (query) => {
      const filter = {};
      if (query.featured === 'true' || query.featured === 'false') filter.featured = query.featured === 'true';
      if (query.category && query.category !== 'All') {
        filter.category = { $regex: `^${escapeRegex(String(query.category).slice(0, 60))}$`, $options: 'i' };
      }
      return filter;
    },
    /** Public detail lookup by id OR slug */
    findPublicOne: (idOrSlug) => {
      const byId = /^[a-f0-9]{24}$/i.test(idOrSlug);
      return Project.findOne({ ...(byId ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase() }), visible: { $ne: false } });
    },
  },
  { key: 'experience', path: 'experience', label: 'Experience', Model: Experience, rules: validators.experience },
  {
    key: 'skills',
    path: 'skills',
    label: 'Skill category',
    Model: Skill,
    rules: validators.skill,
    /** Friendly error instead of a raw duplicate-key error */
    prepare: async (data, { existing }) => {
      if (!data.category) return;
      const clash = await Skill.exists({
        category: { $regex: `^${escapeRegex(data.category)}$`, $options: 'i' },
        ...(existing && { _id: { $ne: existing._id } }),
      });
      if (clash) throw Object.assign(new Error(`A skill category named "${data.category}" already exists`), { statusCode: 409 });
    },
  },
  { key: 'education', path: 'education', label: 'Education entry', Model: Education, rules: validators.education },
  { key: 'certifications', path: 'certifications', label: 'Certification', Model: Certification, rules: validators.certification },
  { key: 'achievements', path: 'achievements', label: 'Achievement', Model: Achievement, rules: validators.achievement },
];

module.exports = resources;
