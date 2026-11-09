const mongoose = require('mongoose');
const { FileRefSchema, emptyFileRef } = require('./schemas/fileRef');

/** Landing-page sections the owner can show/hide and reorder (hero + footer are fixed). */
const SECTION_KEYS = [
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
  'achievements',
  'contact',
];

/**
 * Generic, owner-agnostic defaults for section headings. The seed script
 * replaces these with the real copy; the admin edits them in /admin/sections.
 */
const DEFAULT_SECTION_CONTENT = {
  about: { navLabel: 'About', badge: 'About Me', title: 'About Me', subtitle: '' },
  skills: { navLabel: 'Skills', badge: 'Skills', title: 'Skills & Technologies', subtitle: '' },
  experience: { navLabel: 'Experience', badge: 'Experience', title: 'Work Experience', subtitle: '' },
  projects: { navLabel: 'Projects', badge: 'Portfolio', title: 'Projects', subtitle: '' },
  education: { navLabel: 'Education', badge: 'Education', title: 'Education', subtitle: '' },
  certifications: { navLabel: 'Certifications', badge: 'Credentials', title: 'Certifications', subtitle: '' },
  achievements: { navLabel: 'Achievements', badge: 'Recognition', title: 'Achievements', subtitle: '' },
  contact: { navLabel: 'Contact', badge: 'Get In Touch', title: 'Contact', subtitle: '' },
};

const ResumeSchema = new mongoose.Schema(
  {
    url: { type: String, default: '', trim: true },
    fileId: { type: String, default: '', trim: true },
    fileName: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
    updatedAt: { type: Date },
  },
  { _id: false }
);

const SocialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true, lowercase: true, maxlength: 40 },
    label: { type: String, default: '', trim: true, maxlength: 60 },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: '', trim: true, maxlength: 40 },
    visible: { type: Boolean, default: true },
  },
  { _id: true }
);

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 20 },
    subtext: { type: String, default: '', trim: true, maxlength: 80 },
  },
  { _id: true }
);

const SectionContentSchema = new mongoose.Schema(
  {
    navLabel: { type: String, default: '', trim: true, maxlength: 40 },
    badge: { type: String, default: '', trim: true, maxlength: 60 },
    title: { type: String, default: '', trim: true, maxlength: 120 },
    subtitle: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { _id: false }
);

// Build { about: Boolean, skills: Boolean, ... } and { about: SectionContent, ... } from SECTION_KEYS
const sectionVisibilityFields = {};
const sectionContentFields = {};
SECTION_KEYS.forEach((key) => {
  sectionVisibilityFields[key] = { type: Boolean, default: true };
  sectionContentFields[key] = { type: SectionContentSchema, default: () => ({ ...DEFAULT_SECTION_CONTENT[key] }) };
});

const SiteSettingsSchema = new mongoose.Schema(
  {
    // Guarantees a single settings document (unique index)
    singletonKey: { type: String, default: 'main', unique: true, select: false },

    // ----- Identity / hero -----
    fullName: { type: String, default: '', trim: true, maxlength: 80 },
    headline: { type: String, default: '', trim: true, maxlength: 150 },
    typingRoles: { type: [String], default: [] },
    summary: { type: String, default: '', trim: true, maxlength: 600 },
    aboutLongText: { type: String, default: '', trim: true, maxlength: 4000 },
    hero: {
      greeting: { type: String, default: "Hi, I'm", trim: true, maxlength: 60 },
      availabilityText: { type: String, default: '', trim: true, maxlength: 80 },
      showAvailability: { type: Boolean, default: false },
    },

    // ----- Images & files (GridFS references) -----
    profileImage: { type: FileRefSchema, default: emptyFileRef },
    aboutImage: { type: FileRefSchema, default: emptyFileRef },
    favicon: { type: FileRefSchema, default: emptyFileRef },
    resume: { type: ResumeSchema, default: () => ({}) },

    // ----- Contact -----
    contact: {
      email: { type: String, default: '', trim: true, lowercase: true },
      phone: { type: String, default: '', trim: true },
      showPhonePublicly: { type: Boolean, default: false },
      location: { type: String, default: '', trim: true },
      whatsapp: { type: String, default: '', trim: true },
      intro: { type: String, default: '', trim: true, maxlength: 600 },
      responseTime: { type: String, default: '', trim: true, maxlength: 60 },
    },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    stats: { type: [StatSchema], default: [] },

    // ----- Layout -----
    sectionVisibility: sectionVisibilityFields,
    sectionOrder: { type: [String], default: () => [...SECTION_KEYS] },
    sectionContent: sectionContentFields,

    // ----- SEO / branding -----
    seo: {
      title: { type: String, default: '', trim: true, maxlength: 120 },
      description: { type: String, default: '', trim: true, maxlength: 320 },
      keywords: { type: String, default: '', trim: true, maxlength: 300 },
      ogImage: { type: FileRefSchema, default: emptyFileRef },
    },
    theme: {
      primaryColor: { type: String, default: '#7c3aed', trim: true },
      secondaryColor: { type: String, default: '#ec4899', trim: true },
    },
    footerText: { type: String, default: '', trim: true, maxlength: 200 },
  },
  { timestamps: true, minimize: false }
);

/**
 * Normalises sectionOrder so it always contains every known key exactly once
 * (unknown keys dropped, missing keys appended in default order).
 */
const normaliseSectionOrder = (order = []) => {
  const seen = new Set();
  const clean = order.filter((key) => SECTION_KEYS.includes(key) && !seen.has(key) && seen.add(key));
  return [...clean, ...SECTION_KEYS.filter((key) => !seen.has(key))];
};

SiteSettingsSchema.pre('save', function fixSectionOrder(next) {
  this.sectionOrder = normaliseSectionOrder(this.sectionOrder);
  next();
});

/**
 * Read-only fetch for public pages: never writes to the database.
 * Returns an unsaved document with defaults when settings don't exist yet.
 */
SiteSettingsSchema.statics.findSettings = async function findSettings() {
  return (await this.findOne({ singletonKey: 'main' })) || new this({ singletonKey: 'main' });
};

/** Fetches the singleton settings document, creating it atomically if missing (admin use). */
SiteSettingsSchema.statics.getSettings = async function getSettings() {
  return this.findOneAndUpdate(
    { singletonKey: 'main' },
    { $setOnInsert: { singletonKey: 'main' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
module.exports.SECTION_KEYS = SECTION_KEYS;
module.exports.DEFAULT_SECTION_CONTENT = DEFAULT_SECTION_CONTENT;
module.exports.normaliseSectionOrder = normaliseSectionOrder;
