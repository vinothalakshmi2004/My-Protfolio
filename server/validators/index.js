/**
 * Validation rule sets for every endpoint. Each resource exports a function
 * (isUpdate) => [chains] so create requires mandatory fields while update
 * (partial PUT) only validates what is sent.
 */
const { body, param } = require('express-validator');
const c = require('./common');
const { isValidFileId } = require('../config/gridfs');
const { SECTION_KEYS } = require('../models/SiteSettings');
const { SCORE_TYPES } = require('../models/Education');
const { SKILL_LEVELS } = require('../models/Skill');
const { normalizeUrl, isSafeUrl } = require('../utils/sanitizers');

// Fields shared by every orderable/hideable resource
const common = () => [c.int('order', { label: 'Order' }), c.bool('visible', { label: 'Visible' })];

// ---------------------------------------------------------------- resources
const project = (isUpdate) => [
  c.text('title', { required: true, isUpdate, max: 150, label: 'Title' }),
  c.text('slug', { max: 80, label: 'Slug' }),
  c.text('shortDescription', { max: 400, label: 'Short description' }),
  c.text('fullDescription', { max: 6000, label: 'Full description' }),
  c.text('category', { max: 60, label: 'Category' }),
  c.stringArray('techStack', { label: 'Tech stack', maxItems: 40, maxLen: 60 }),
  c.stringArray('features', { label: 'Features', maxItems: 40, maxLen: 300 }),
  c.fileRef('thumbnail', { label: 'Thumbnail' }),
  c.fileRefArray('gallery', { label: 'Gallery', maxItems: 20 }),
  c.url('githubUrl', { label: 'GitHub URL' }),
  c.url('liveUrl', { label: 'Live URL' }),
  c.bool('featured', { label: 'Featured' }),
  ...common(),
];

const experience = (isUpdate) => [
  c.text('company', { required: true, isUpdate, max: 120, label: 'Company' }),
  c.text('role', { required: true, isUpdate, max: 120, label: 'Role' }),
  c.text('location', { max: 120, label: 'Location' }),
  c.month('startDate', { label: 'Start date' }),
  c.month('endDate', { label: 'End date' }),
  c.bool('isCurrent', { label: 'Currently working here' }),
  c.stringArray('bullets', { label: 'Bullet points', maxItems: 20, maxLen: 600 }),
  c.fileRef('companyLogo', { label: 'Company logo' }),
  ...common(),
];

const education = (isUpdate) => [
  c.text('degree', { required: true, isUpdate, max: 150, label: 'Degree' }),
  c.text('institution', { required: true, isUpdate, max: 150, label: 'Institution' }),
  c.text('location', { max: 120, label: 'Location' }),
  c.year('startYear', { label: 'Start year' }),
  c.year('endYear', { label: 'End year' }),
  c.oneOf('scoreType', SCORE_TYPES, { label: 'Score type' }),
  c.text('score', { max: 20, label: 'Score' }),
  c.text('notes', { max: 500, label: 'Notes' }),
  ...common(),
];

/** Skill items accept ["React", ...] or [{ name, icon, level }, ...]. */
const cleanSkillItems = (items) =>
  items
    .map((item) => (typeof item === 'string' ? { name: item } : item))
    .map((item) => ({
      ...(item._id && isValidFileId(String(item._id)) ? { _id: String(item._id) } : {}),
      name: String(item.name || '').trim(),
      icon: String(item.icon || '').trim().toLowerCase(),
      level: SKILL_LEVELS.includes(item.level) ? item.level : '',
    }))
    .filter((item) => item.name);

const skill = (isUpdate) => [
  c.text('category', { required: true, isUpdate, max: 60, label: 'Category' }),
  body('items')
    .optional({ values: 'null' })
    .isArray({ max: 80 })
    .withMessage('Items must be a list of at most 80 skills')
    .bail()
    .custom((items) =>
      items.every(
        (item) =>
          (typeof item === 'string' && item.length <= 60) ||
          (c.isPlainObject(item) &&
            typeof item.name === 'string' &&
            item.name.trim().length <= 60 &&
            (item.icon === undefined || (typeof item.icon === 'string' && item.icon.length <= 40)) &&
            (item.level === undefined || SKILL_LEVELS.includes(item.level)))
      )
    )
    .withMessage(`Each skill needs a name (max 60 chars); level must be one of ${SKILL_LEVELS.filter(Boolean).join(', ')}`)
    .bail()
    .customSanitizer(cleanSkillItems),
  ...common(),
];

const certification = (isUpdate) => [
  c.text('title', { required: true, isUpdate, max: 150, label: 'Title' }),
  c.text('issuer', { required: true, isUpdate, max: 120, label: 'Issuer' }),
  c.month('issueDate', { label: 'Issue date' }),
  c.url('credentialUrl', { label: 'Credential URL' }),
  c.fileRef('file', { label: 'Certificate file', withContentType: true }),
  ...common(),
];

const achievement = (isUpdate) => [
  c.text('title', { required: true, isUpdate, max: 150, label: 'Title' }),
  c.text('description', { max: 1000, label: 'Description' }),
  c.month('date', { label: 'Date' }),
  c.fileRef('image', { label: 'Image' }),
  ...common(),
];

// ---------------------------------------------------------------- settings
const SOCIAL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const cleanSocialLinks = (links) =>
  links.map((link) => {
    const urlValue = normalizeUrl(String(link.url || ''));
    return {
      ...(link._id && isValidFileId(String(link._id)) ? { _id: String(link._id) } : {}),
      platform: String(link.platform || '').trim().toLowerCase(),
      label: String(link.label || '').trim(),
      url: urlValue,
      icon: String(link.icon || '').trim().toLowerCase(),
      visible: link.visible === undefined ? true : link.visible === true || link.visible === 'true',
    };
  });

const cleanStats = (stats) =>
  stats.map((s) => ({
    ...(s._id && isValidFileId(String(s._id)) ? { _id: String(s._id) } : {}),
    label: String(s.label || '').trim(),
    value: String(s.value ?? '').trim(),
    subtext: String(s.subtext || '').trim(),
  }));

/** Resume = file ref + display file name (size/updatedAt are set by the server). */
const cleanResume = (value) => {
  const ref = c.cleanFileRef(value, 'Resume', false);
  const fileName = typeof value.fileName === 'string' ? value.fileName.trim().slice(0, 150) : '';
  return { ...ref, fileName: ref.fileId ? fileName || 'Resume.pdf' : '' };
};

const settings = () => [
  c.text('fullName', { required: true, isUpdate: true, max: 80, label: 'Full name' }),
  c.text('headline', { max: 150, label: 'Headline' }),
  c.stringArray('typingRoles', { label: 'Typing roles', maxItems: 10, maxLen: 60 }),
  c.text('summary', { max: 600, label: 'Summary' }),
  c.text('aboutLongText', { max: 4000, label: 'About text' }),
  c.text('hero.greeting', { max: 60, label: 'Greeting' }),
  c.text('hero.availabilityText', { max: 80, label: 'Availability text' }),
  c.bool('hero.showAvailability', { label: 'Show availability' }),

  c.fileRef('profileImage', { label: 'Profile image' }),
  c.fileRef('aboutImage', { label: 'About image' }),
  c.fileRef('favicon', { label: 'Favicon' }),
  c.fileRef('seo.ogImage', { label: 'OG image' }),
  body('resume')
    .optional({ values: 'null' })
    .custom((value) => Boolean(cleanResume(value)))
    .bail()
    .customSanitizer(cleanResume),

  c.email('contact.email', { label: 'Contact e-mail' }),
  c.phone('contact.phone', { label: 'Phone' }),
  c.bool('contact.showPhonePublicly', { label: 'Show phone publicly' }),
  c.text('contact.location', { max: 120, label: 'Location' }),
  c.phone('contact.whatsapp', { label: 'WhatsApp number' }),
  c.text('contact.intro', { max: 600, label: 'Contact intro' }),
  c.text('contact.responseTime', { max: 60, label: 'Response time' }),

  body('socialLinks')
    .optional({ values: 'null' })
    .isArray({ max: 20 })
    .withMessage('Social links must be a list of at most 20 links')
    .bail()
    .custom((links) =>
      links.every((link, i) => {
        if (!c.isPlainObject(link)) throw new Error(`Social link #${i + 1} is invalid`);
        if (typeof link.platform !== 'string' || !/^[a-z0-9-]{1,40}$/i.test(link.platform.trim())) {
          throw new Error(`Social link #${i + 1}: platform is required (letters, numbers, dashes)`);
        }
        if (link.label !== undefined && (typeof link.label !== 'string' || link.label.length > 60)) {
          throw new Error(`Social link #${i + 1}: label must be text up to 60 characters`);
        }
        const normalized = normalizeUrl(typeof link.url === 'string' ? link.url : '');
        if (!normalized || !isSafeUrl(normalized, SOCIAL_PROTOCOLS)) {
          throw new Error(`Social link #${i + 1}: URL must start with http(s)://, mailto: or tel:`);
        }
        return true;
      })
    )
    .bail()
    .customSanitizer(cleanSocialLinks),

  body('stats')
    .optional({ values: 'null' })
    .isArray({ max: 8 })
    .withMessage('Stats must be a list of at most 8 items')
    .bail()
    .custom((stats) =>
      stats.every((s, i) => {
        if (!c.isPlainObject(s)) throw new Error(`Stat #${i + 1} is invalid`);
        if (typeof s.label !== 'string' || !s.label.trim() || s.label.length > 60) {
          throw new Error(`Stat #${i + 1}: label is required (max 60 characters)`);
        }
        if (s.value === undefined || String(s.value).trim() === '' || String(s.value).length > 20) {
          throw new Error(`Stat #${i + 1}: value is required (max 20 characters)`);
        }
        return true;
      })
    )
    .bail()
    .customSanitizer(cleanStats),

  ...SECTION_KEYS.map((key) => c.bool(`sectionVisibility.${key}`, { label: `Visibility of ${key}` })),
  body('sectionOrder')
    .optional({ values: 'null' })
    .isArray({ max: SECTION_KEYS.length })
    .withMessage('Section order must be a list of section keys')
    .bail()
    .custom((keys) => keys.every((key) => SECTION_KEYS.includes(key)))
    .withMessage(`Section order may only contain: ${SECTION_KEYS.join(', ')}`),
  ...SECTION_KEYS.flatMap((key) => [
    c.text(`sectionContent.${key}.navLabel`, { max: 40, label: `${key} nav label` }),
    c.text(`sectionContent.${key}.badge`, { max: 60, label: `${key} badge` }),
    c.text(`sectionContent.${key}.title`, { max: 120, label: `${key} title` }),
    c.text(`sectionContent.${key}.subtitle`, { max: 300, label: `${key} subtitle` }),
  ]),

  c.text('seo.title', { max: 120, label: 'SEO title' }),
  c.text('seo.description', { max: 320, label: 'SEO description' }),
  c.text('seo.keywords', { max: 300, label: 'SEO keywords' }),
  c.hexColor('theme.primaryColor', { label: 'Primary colour' }),
  c.hexColor('theme.secondaryColor', { label: 'Secondary colour' }),
  c.text('footerText', { max: 200, label: 'Footer text' }),
];

// ---------------------------------------------------------------- auth / contact / misc
const login = () => [
  c.email('email', { label: 'E-mail', required: true }),
  body('password').isString().withMessage('Password is required').bail().notEmpty().withMessage('Password is required'),
];

const strongPassword = (field) =>
  body(field)
    .isString()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be 8–128 characters')
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage('New password must contain a letter')
    .matches(/\d/)
    .withMessage('New password must contain a number');

const changePassword = () => [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  strongPassword('newPassword'),
  body('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from the current one'),
];

const changeEmail = () => [
  c.email('newEmail', { label: 'New e-mail', required: true }),
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
];

const contact = () => [
  c.text('name', { required: true, max: 100, label: 'Name' }).isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  c.email('email', { label: 'E-mail', required: true }),
  c.text('subject', { required: true, max: 150, label: 'Subject' }).isLength({ min: 2 }).withMessage('Subject must be at least 2 characters'),
  c.text('message', { required: true, max: 3000, label: 'Message' }).isLength({ min: 5 }).withMessage('Message must be at least 5 characters'),
  // Honeypot: real users never fill this hidden field
  body('website').optional({ values: 'null' }).isString(),
];

/** Accepts either [{ id, order }] or { items: [{ id, order }] }. */
const reorder = () => [
  body()
    .custom((value) => {
      const items = Array.isArray(value) ? value : value?.items;
      if (!Array.isArray(items) || items.length === 0) throw new Error('Send a non-empty array of { id, order }');
      if (items.length > 500) throw new Error('Too many items');
      items.forEach((item, i) => {
        const id = String(item?.id || item?._id || '');
        if (!isValidFileId(id)) throw new Error(`Item #${i + 1} has an invalid id`);
        if (!Number.isInteger(item.order) || item.order < 0) throw new Error(`Item #${i + 1} needs a non-negative integer order`);
      });
      return true;
    }),
];

const idParam = () => [param('id').isMongoId().withMessage('Invalid id')];

module.exports = {
  project,
  experience,
  education,
  skill,
  certification,
  achievement,
  settings,
  login,
  changePassword,
  changeEmail,
  contact,
  reorder,
  idParam,
};
