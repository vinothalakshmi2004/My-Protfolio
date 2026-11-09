/**
 * Idempotent seeder — safe to run any number of times.
 *
 *   npm run seed                 -> migrate legacy docs + insert MISSING seed items only
 *                                   (never overwrites edits made in the admin dashboard)
 *   npm run seed -- --reset      -> replace ALL content (settings, projects, ...) with the seed
 *                                   data. Keeps the admin account and inbox messages.
 *   npm run seed:destroy -- --yes -> delete EVERYTHING (content, files, admin, messages)
 *
 * Matching uses natural keys (project slug/title, skill category, company + role, ...),
 * so running it twice never creates duplicates.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { closeDB } = require('../config/db');
const SiteSettings = require('../models/SiteSettings');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const Message = require('../models/Message');
const Admin = require('../models/Admin');
const { uploadToGridFS, findFileById, getGridFSBucket, listAllFiles } = require('../config/gridfs');
const { slugify, escapeRegex } = require('../utils/sanitizers');
const data = require('./seedData');

const RESUME_ASSET = path.join(__dirname, 'assets', 'resume.pdf');
const RESUME_FILE_NAME = 'Vinothalakshmi_M_Resume.pdf';
const CONTENT_MODELS = [SiteSettings, Project, Experience, Skill, Education, Certification, Achievement];

const ci = (value) => ({ $regex: `^${escapeRegex(String(value).trim())}$`, $options: 'i' });

// ------------------------------------------------------------------ legacy parsing helpers
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Jan 2026" -> "2026-01", "2026" -> "2026-01", anything else -> '' */
const parseMonth = (text = '') => {
  const t = String(text).trim().toLowerCase();
  const m = t.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (m && MONTHS.includes(m[1])) return `${m[2]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}`;
  const y = t.match(/^(\d{4})$/);
  return y ? `${y[1]}-01` : '';
};

/** "Jan 2026 – Present" -> { startDate: '2026-01', endDate: '', isCurrent: true } */
const parsePeriod = (period = '') => {
  // Separators: en/em dash, spaced hyphen, or the word "to" (not the "to" inside "October")
  const [start = '', end = ''] = String(period).split(/\s*[–—]\s*|\s+-\s+|\s+to\s+/i);
  const isCurrent = /present|current|now/i.test(end);
  return { startDate: parseMonth(start), endDate: isCurrent ? '' : parseMonth(end), isCurrent };
};

/** "2024–2026" -> { startYear: '2024', endYear: '2026' } */
const parseYears = (period = '') => {
  const years = String(period).match(/\d{4}/g) || [];
  return { startYear: years[0] || '', endYear: years[1] || '' };
};

/** "CGPA 9.0" -> CGPA/9.0, "90%" -> Percentage/90 */
const parseScore = (score = '') => {
  const s = String(score).trim();
  if (!s) return { scoreType: 'CGPA', score: '' };
  if (/%|percent/i.test(s)) return { scoreType: 'Percentage', score: (s.match(/[\d.]+/) || [''])[0] };
  if (/grade/i.test(s)) return { scoreType: 'Grade', score: s.replace(/grade/i, '').trim() };
  return { scoreType: 'CGPA', score: (s.match(/[\d.]+/) || [s])[0] };
};

// ------------------------------------------------------------------ steps
/**
 * Upgrades documents created by the previous version of the app to the new
 * shapes (additive: old fields are left in place, new fields are filled in).
 */
const migrateLegacy = async (log) => {
  let changed = 0;
  const each = async (Model, fn) => {
    const docs = await Model.collection.find({}).toArray();
    for (const doc of docs) {
      const set = fn(doc);
      if (doc.visible === undefined) set.visible = true;
      if (Object.keys(set).length) {
        await Model.collection.updateOne({ _id: doc._id }, { $set: set });
        changed += 1;
      }
    }
  };

  await each(Skill, (doc) => {
    const set = {};
    if (Array.isArray(doc.items) && doc.items.some((i) => typeof i === 'string')) {
      set.items = doc.items.map((i) =>
        typeof i === 'string' ? { _id: new mongoose.Types.ObjectId(), name: i, icon: '', level: '' } : i
      );
    }
    return set;
  });

  await each(Experience, (doc) => {
    const set = {};
    if (!doc.role && doc.title) set.role = doc.title;
    if ((!doc.bullets || !doc.bullets.length) && Array.isArray(doc.description)) set.bullets = doc.description;
    if (doc.isCurrent === undefined && doc.current !== undefined) set.isCurrent = Boolean(doc.current);
    if (doc.startDate === undefined && doc.period) {
      const p = parsePeriod(doc.period);
      set.startDate = p.startDate;
      set.endDate = p.endDate;
      if (set.isCurrent === undefined && doc.isCurrent === undefined) set.isCurrent = p.isCurrent;
    }
    if (!doc.companyLogo) set.companyLogo = { url: '', fileId: '' };
    return set;
  });

  const usedSlugs = new Set((await Project.collection.distinct('slug')).filter(Boolean));
  await each(Project, (doc) => {
    const set = {};
    const seed = data.projectsData.find((p) => p.title.toLowerCase() === String(doc.title || '').toLowerCase());
    if (doc.shortDescription === undefined && doc.description) set.shortDescription = doc.description;
    if (doc.fullDescription === undefined && doc.description) set.fullDescription = doc.description;
    if (!doc.category) set.category = seed?.category || 'MERN';
    if (!doc.slug) {
      let slug = slugify(doc.title) || 'project';
      for (let n = 2; usedSlugs.has(slug); n += 1) slug = `${slugify(doc.title)}-${n}`;
      usedSlugs.add(slug);
      set.slug = slug;
    }
    if (!doc.thumbnail) set.thumbnail = { url: '', fileId: '' };
    if (!doc.gallery) set.gallery = [];
    return set;
  });

  await each(Education, (doc) => {
    const set = {};
    if (doc.startYear === undefined && doc.period) Object.assign(set, parseYears(doc.period));
    if (doc.scoreType === undefined && doc.score !== undefined) Object.assign(set, parseScore(doc.score));
    if (doc.notes === undefined && doc.award) set.notes = doc.award;
    return set;
  });

  await each(Certification, (doc) => {
    const set = {};
    if (doc.credentialUrl === undefined && /^https?:\/\//i.test(doc.url || '')) set.credentialUrl = doc.url;
    if (!doc.file) set.file = { url: '', fileId: '', contentType: '' };
    return set;
  });

  await each(Achievement, () => ({}));
  log(`[Seeder] Legacy migration: ${changed} document(s) upgraded`);
};

/** Creates the settings singleton (or fills in fields that are missing). */
const seedSettings = async (log) => {
  const raw = (await SiteSettings.collection.findOne({ singletonKey: 'main' })) || (await SiteSettings.collection.findOne({}));

  // A settings doc that exists but was never configured (e.g. auto-created with empty
  // defaults) is treated like a missing one, so the seed can still populate it.
  if (raw && !raw.fullName) {
    await SiteSettings.collection.deleteOne({ _id: raw._id });
    log('[Seeder] Found an unconfigured (empty) settings document — re-creating it from seed data');
  }

  if (!raw || !raw.fullName) {
    const seed = JSON.parse(JSON.stringify(data.settingsData));
    // Prefer values from the old "profiles" document if the owner had edited them
    const legacy = await mongoose.connection.db.collection('profiles').findOne({});
    if (legacy) {
      if (legacy.name) seed.fullName = legacy.name;
      if (legacy.title) seed.headline = legacy.title;
      if (legacy.summary) seed.aboutLongText = legacy.summary;
      if (legacy.email) seed.contact.email = legacy.email;
      if (legacy.location) seed.contact.location = legacy.location;
      seed.socialLinks.forEach((link) => {
        if (link.platform === 'github' && legacy.github) link.url = legacy.github;
        if (link.platform === 'linkedin' && legacy.linkedin) link.url = legacy.linkedin;
      });
    }
    await SiteSettings.create({ ...seed, singletonKey: 'main' });
    log(`[Seeder] Settings created${legacy ? ' (merged with legacy profile)' : ''}`);
    return;
  }

  const fill = {};
  if (!raw.singletonKey) fill.singletonKey = 'main';
  Object.entries(data.settingsData).forEach(([key, value]) => {
    if (raw[key] === undefined) fill[key] = value;
  });
  if (Object.keys(fill).length) {
    await SiteSettings.collection.updateOne({ _id: raw._id }, { $set: fill });
  }
  log(`[Seeder] Settings exist — ${Object.keys(fill).length} missing field(s) filled, nothing overwritten`);
};

/** Inserts seed items whose natural key doesn't exist yet. */
const seedCollection = async (Model, items, keyOf, label, log) => {
  let inserted = 0;
  let nextOrder = ((await Model.findOne({}).sort({ order: -1 }).lean())?.order ?? -1) + 1;
  const isEmpty = (await Model.estimatedDocumentCount()) === 0;

  for (const item of items) {
    if (await Model.exists(keyOf(item))) continue;
    await Model.create({ ...item, order: isEmpty ? item.order : nextOrder++ });
    inserted += 1;
  }
  log(`[Seeder] ${label}: ${inserted} inserted, ${items.length - inserted} already present`);
};

/** Creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists (never resets a password). */
const ensureAdmin = async (log) => {
  if (await Admin.estimatedDocumentCount()) {
    log('[Seeder] Admin account exists — left unchanged (password/e-mail preserved)');
    return;
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'ChangeMe123');
  if (!password || password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD (8+ characters) in .env before seeding the admin account');
  }
  await Admin.create({ name: data.settingsData.fullName, email, password, role: 'admin' });
  log(`[Seeder] Admin created: ${email}${process.env.NODE_ENV === 'production' ? '' : ` / ${password}`}`);
};

/** Uploads the bundled resume PDF into GridFS when no (valid) resume is stored yet. */
const ensureResume = async (log) => {
  const settings = await SiteSettings.getSettings();
  const current = settings.resume?.fileId ? await findFileById(settings.resume.fileId) : null;
  if (current) {
    log('[Seeder] Resume already stored in GridFS');
    return;
  }
  if (!fs.existsSync(RESUME_ASSET)) {
    log('[Seeder] No seed/assets/resume.pdf found — upload the resume from /admin/resume');
    return;
  }
  const buffer = fs.readFileSync(RESUME_ASSET);
  const file = await uploadToGridFS(buffer, {
    filename: RESUME_FILE_NAME,
    originalName: RESUME_FILE_NAME,
    contentType: 'application/pdf',
    metadata: { kind: 'pdf', source: 'seed' },
  });
  settings.resume = { url: file.url, fileId: file.fileId, fileName: RESUME_FILE_NAME, size: file.size, updatedAt: new Date() };
  await settings.save();
  log(`[Seeder] Resume uploaded to GridFS (${(file.size / 1024).toFixed(1)} KB)`);
};

/** Removes every stored GridFS file. */
const dropAllFiles = async () => {
  const files = await listAllFiles();
  const bucket = getGridFSBucket();
  await Promise.all(files.map((f) => bucket.delete(f._id).catch(() => {})));
  return files.length;
};

// ------------------------------------------------------------------ public API
/**
 * Seeds the database. Expects mongoose to be connected (or connects itself when `connect` is true).
 * @param {{ reset?: boolean, log?: Function }} options
 */
const seedDatabase = async ({ reset = false, log = console.log } = {}) => {
  if (reset) {
    for (const Model of CONTENT_MODELS) await Model.deleteMany({});
    const removed = await dropAllFiles();
    log(`[Seeder] --reset: content cleared and ${removed} file(s) removed (admin + messages kept)`);
  }

  await migrateLegacy(log);
  await seedSettings(log);
  await seedCollection(Skill, data.skillsData, (d) => ({ category: ci(d.category) }), 'Skills', log);
  await seedCollection(
    Experience,
    data.experienceData,
    (d) => ({ company: ci(d.company), role: ci(d.role) }),
    'Experience',
    log
  );
  await seedCollection(Project, data.projectsData, (d) => ({ $or: [{ slug: d.slug }, { title: ci(d.title) }] }), 'Projects', log);
  await seedCollection(
    Education,
    data.educationData,
    (d) => ({ degree: ci(d.degree), institution: ci(d.institution) }),
    'Education',
    log
  );
  await seedCollection(
    Certification,
    data.certificationsData,
    (d) => ({ title: ci(d.title), issuer: ci(d.issuer) }),
    'Certifications',
    log
  );
  await seedCollection(Achievement, data.achievementsData, (d) => ({ title: ci(d.title) }), 'Achievements', log);
  await ensureAdmin(log);
  await ensureResume(log);
};

/** Deletes absolutely everything (content, files, admin, messages). */
const destroyDatabase = async ({ log = console.log } = {}) => {
  for (const Model of [...CONTENT_MODELS, Message, Admin]) await Model.deleteMany({});
  const removed = await dropAllFiles();
  log(`[Seeder] All collections emptied and ${removed} file(s) deleted`);
};

// ------------------------------------------------------------------ CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const destroy = args.includes('-d') || args.includes('--destroy');
  const reset = args.includes('--reset');

  (async () => {
    try {
      if (destroy && !args.includes('--yes')) {
        console.error('✖ Refusing to destroy data without confirmation. Run: npm run seed:destroy -- --yes');
        process.exit(1);
      }
      await connectDB();
      if (destroy) await destroyDatabase();
      else await seedDatabase({ reset });
      console.log('✔ Done.');
      await closeDB();
      process.exit(0);
    } catch (error) {
      console.error(`✖ Seeding error: ${error.message}`);
      await closeDB();
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase, destroyDatabase, parsePeriod, parseYears, parseScore };
