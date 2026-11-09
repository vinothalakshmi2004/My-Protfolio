/**
 * End-to-end API tests (node:test) against a throw-away in-memory MongoDB.
 * Run with: npm test
 *
 * Covers auth, settings, GridFS uploads/streaming, CRUD + reorder + visibility
 * for every resource, automatic file cleanup, messages, the cleanup script and
 * seed idempotency / legacy migration. Never touches the real database.
 */
// ---- Pin env BEFORE anything loads dotenv (dotenv never overrides existing vars) ----
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_only_secret_value_1234567890';
process.env.ADMIN_EMAIL = 'admin@test.dev';
process.env.ADMIN_PASSWORD = 'TestPass123';
process.env.EMAIL_USER = ''; // never send real e-mails from tests
process.env.EMAIL_PASS = '';
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/never-used'; // replaced below by the memory server

const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const sharp = require('sharp');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let server;
let base;
let token;

// ------------------------------------------------------------------ helpers
const api = async (path, { method = 'GET', body, auth = true, headers = {}, raw = false } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body !== undefined && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(auth && token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  if (raw) return res;
  const type = res.headers.get('content-type') || '';
  const json = type.includes('application/json') ? await res.json() : null;
  return { status: res.status, headers: res.headers, json, data: json?.data };
};

const makePng = (width = 2400, height = 1200) =>
  sharp({ create: { width, height, channels: 3, background: '#7c3aed' } }).png().toBuffer();

const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');

const upload = async (buffer, filename, type, query = '') => {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), filename);
  return api(`/api/upload${query}`, { method: 'POST', body: form });
};

const fileExists = async (fileId) => {
  const { findFileById } = require('../config/gridfs');
  return Boolean(await findFileById(fileId));
};

// ------------------------------------------------------------------ lifecycle
before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('portfolio_test');
  await mongoose.connect(process.env.MONGO_URI);

  const { seedDatabase } = require('../seed/seeder');
  await seedDatabase({ log: () => {} });

  const app = require('../app');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
});

// ------------------------------------------------------------------ tests
describe('health + public settings', () => {
  test('health check', async () => {
    const res = await api('/api/health', { auth: false });
    assert.equal(res.status, 200);
    assert.equal(res.json.success, true);
  });

  test('public settings hide the phone and expose seeded content', async () => {
    const res = await api('/api/settings', { auth: false });
    assert.equal(res.status, 200);
    assert.equal(res.data.fullName, 'Vinothalakshmi M');
    assert.equal(res.data.contact.phone, '', 'phone must be hidden when showPhonePublicly=false');
    assert.equal(res.data.singletonKey, undefined);
    assert.ok(res.data.resume.url.startsWith('/api/files/'), 'seed uploads the resume into GridFS');
    assert.deepEqual(res.data.sectionOrder.length, 8);
  });

  test('cross-origin resource policy allows the SPA to embed files', async () => {
    const res = await api('/api/settings', { auth: false });
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
  });
});

describe('auth', () => {
  test('protected routes require a token', async () => {
    const res = await api('/api/admin/projects', { auth: false });
    assert.equal(res.status, 401);
  });

  test('wrong password is rejected', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: 'admin@test.dev', password: 'nope-nope' },
    });
    assert.equal(res.status, 401);
  });

  test('NoSQL operator injection is rejected', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: { $gt: '' }, password: { $gt: '' } },
    });
    assert.equal(res.status, 400);
  });

  test('login returns a JWT and /me works', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: 'ADMIN@test.dev', password: 'TestPass123' },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.token);
    token = res.data.token;
    const me = await api('/api/auth/me');
    assert.equal(me.data.email, 'admin@test.dev');
  });
});

describe('settings', () => {
  test('admin settings include the private phone', async () => {
    const res = await api('/api/admin/settings');
    assert.equal(res.status, 200);
    assert.equal(res.data.contact.phone, '+91 8610257232');
  });

  test('partial update of contact.email keeps the other contact fields', async () => {
    const res = await api('/api/settings', { method: 'PUT', body: { contact: { email: 'New@Mail.dev' } } });
    assert.equal(res.status, 200);
    assert.equal(res.data.contact.email, 'new@mail.dev');
    assert.equal(res.data.contact.location, 'Madurai, Tamil Nadu');
    assert.equal(res.data.contact.phone, '+91 8610257232');
    assert.equal(res.data.fullName, 'Vinothalakshmi M');
  });

  test('social links: edit GitHub/LinkedIn, add hidden link, public hides it', async () => {
    const res = await api('/api/settings', {
      method: 'PUT',
      body: {
        socialLinks: [
          { platform: 'github', label: 'GitHub', url: 'github.com/new-user', visible: true },
          { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/new', visible: true },
          { platform: 'twitter', label: 'X', url: 'https://x.com/me', visible: false },
        ],
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.socialLinks[0].url, 'https://github.com/new-user', 'bare domains get https://');
    const pub = await api('/api/settings', { auth: false });
    assert.equal(pub.data.socialLinks.length, 2);
    assert.ok(!pub.data.socialLinks.some((l) => l.platform === 'twitter'));
  });

  test('unsafe URLs are rejected', async () => {
    const res = await api('/api/settings', {
      method: 'PUT',
      body: { socialLinks: [{ platform: 'github', url: 'javascript:alert(1)' }] },
    });
    assert.equal(res.status, 400);
  });

  test('section visibility + order (order is normalised to contain every key)', async () => {
    const res = await api('/api/settings', {
      method: 'PUT',
      body: { sectionVisibility: { education: false }, sectionOrder: ['projects', 'about'] },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.sectionVisibility.education, false);
    assert.equal(res.data.sectionVisibility.about, true, 'other flags untouched');
    assert.deepEqual(res.data.sectionOrder.slice(0, 2), ['projects', 'about']);
    assert.equal(res.data.sectionOrder.length, 8);
  });

  test('invalid theme colour is rejected', async () => {
    const res = await api('/api/settings', { method: 'PUT', body: { theme: { primaryColor: 'red' } } });
    assert.equal(res.status, 400);
  });
});

describe('uploads + file streaming (GridFS)', () => {
  test('rejects unsupported types, mismatched mime/extension, fake PDFs and wrong kinds', async () => {
    assert.equal((await upload(Buffer.from('hello'), 'notes.txt', 'text/plain')).status, 400);
    assert.equal((await upload(await makePng(), 'image.pdf', 'image/png')).status, 400);
    assert.equal((await upload(Buffer.from('<html>'), 'evil.pdf', 'application/pdf')).status, 400);
    assert.equal((await upload(await makePng(), 'photo.png', 'image/png', '?type=pdf')).status, 400);
    assert.equal((await upload(Buffer.from('not an image'), 'broken.jpg', 'image/jpeg')).status, 400);
  });

  test('rejects images over 5MB', async () => {
    const res = await upload(Buffer.alloc(6 * 1024 * 1024, 1), 'huge.png', 'image/png');
    assert.equal(res.status, 400);
    assert.match(res.json.message, /5MB/);
  });

  test('upload requires auth', async () => {
    const form = new FormData();
    form.append('file', new Blob([PDF_BYTES], { type: 'application/pdf' }), 'a.pdf');
    const res = await api('/api/upload', { method: 'POST', body: form, auth: false });
    assert.equal(res.status, 401);
  });

  test('images are resized to max 1600px and converted to WebP; ETag + caching work', async () => {
    const res = await upload(await makePng(2400, 1200), 'Big Photo.png', 'image/png');
    assert.equal(res.status, 201);
    assert.equal(res.data.contentType, 'image/webp');
    assert.equal(res.data.url, `/api/files/${res.data.fileId}`);

    const file = await api(res.data.url, { auth: false, raw: true });
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('content-type'), 'image/webp');
    assert.equal(file.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    assert.ok(file.headers.get('content-length'));
    const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 1600);

    // Conditional GET via node:http (fetch() adds "Cache-Control: no-cache" to manual
    // conditional requests, which correctly bypasses the 304 path)
    const etag = file.headers.get('etag');
    const cachedStatus = await new Promise((resolve, reject) => {
      require('node:http')
        .get(`${base}${res.data.url}`, { headers: { 'If-None-Match': etag } }, (r) => {
          r.resume();
          resolve(r.statusCode);
        })
        .on('error', reject);
    });
    assert.equal(cachedStatus, 304);

    const head = await api(res.data.url, { method: 'HEAD', auth: false, raw: true });
    assert.equal(head.status, 200);

    await api(`/api/upload/${res.data.fileId}`, { method: 'DELETE' });
    assert.equal(await fileExists(res.data.fileId), false);
  });

  test('PDFs are inline by default and download with the original name via ?download=1', async () => {
    const res = await upload(PDF_BYTES, 'My CV 2026.pdf', 'application/pdf', '?type=pdf');
    assert.equal(res.status, 201);
    const inline = await api(res.data.url, { auth: false, raw: true });
    assert.equal(inline.headers.get('content-type'), 'application/pdf');
    assert.match(inline.headers.get('content-disposition'), /^inline;/);
    const dl = await api(`${res.data.url}?download=1`, { auth: false, raw: true });
    assert.match(dl.headers.get('content-disposition'), /^attachment;.*My CV 2026\.pdf/);
    await api(`/api/upload/${res.data.fileId}`, { method: 'DELETE' });
  });

  test('unknown file id is a 404', async () => {
    const res = await api('/api/files/000000000000000000000000', { auth: false });
    assert.equal(res.status, 404);
  });
});

describe('projects: CRUD, files, visibility, reorder', () => {
  let project;
  let thumb;
  let g1;
  let g2;

  test('create project with thumbnail + gallery (slug auto-generated)', async () => {
    thumb = (await upload(await makePng(800, 600), 'thumb.png', 'image/png')).data;
    g1 = (await upload(await makePng(800, 600), 'g1.jpg', 'image/jpeg')).data;
    g2 = (await upload(await makePng(800, 600), 'g2.webp', 'image/webp')).data;

    const res = await api('/api/projects', {
      method: 'POST',
      body: {
        title: 'Test Project One',
        shortDescription: 'Short',
        category: 'MERN',
        techStack: ['React', ' Node ', ''],
        features: ['A', 'B'],
        githubUrl: 'github.com/x/y',
        thumbnail: { url: thumb.url, fileId: thumb.fileId },
        gallery: [g1, g2].map(({ url, fileId }) => ({ url, fileId })),
        hacker: 'ignored',
      },
    });
    assert.equal(res.status, 201);
    project = res.data;
    assert.equal(project.slug, 'test-project-one');
    assert.deepEqual(project.techStack, ['React', 'Node']);
    assert.equal(project.githubUrl, 'https://github.com/x/y');
    assert.equal(project.hacker, undefined, 'unknown fields are dropped');
    assert.equal(project.order, 4, 'appended after the 4 seeded projects');

    const pub = await api('/api/projects', { auth: false });
    assert.ok(pub.data.some((p) => p._id === project._id));
    const bySlug = await api('/api/projects/test-project-one', { auth: false });
    assert.equal(bySlug.data._id, project._id);
  });

  test('duplicate titles get a unique slug', async () => {
    const res = await api('/api/projects', { method: 'POST', body: { title: 'Test Project One' } });
    assert.equal(res.data.slug, 'test-project-one-2');
    await api(`/api/projects/${res.data._id}`, { method: 'DELETE' });
  });

  test('required fields and unsafe URLs are validated', async () => {
    assert.equal((await api('/api/projects', { method: 'POST', body: { title: '' } })).status, 400);
    const bad = await api(`/api/projects/${project._id}`, { method: 'PUT', body: { liveUrl: 'javascript:alert(1)' } });
    assert.equal(bad.status, 400);
  });

  test('replacing the thumbnail / removing a gallery image deletes the old files', async () => {
    const newThumb = (await upload(await makePng(500, 500), 'thumb2.png', 'image/png')).data;
    const res = await api(`/api/projects/${project._id}`, {
      method: 'PUT',
      body: { thumbnail: { url: newThumb.url, fileId: newThumb.fileId }, gallery: [{ url: g2.url, fileId: g2.fileId }] },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'Test Project One', 'partial update keeps other fields');
    assert.equal(await fileExists(thumb.fileId), false, 'old thumbnail removed');
    assert.equal(await fileExists(g1.fileId), false, 'removed gallery image deleted');
    assert.equal(await fileExists(g2.fileId), true, 'kept gallery image still there');
    thumb = newThumb;
  });

  test('toggle visibility hides it publicly but not in the admin list', async () => {
    const res = await api(`/api/projects/${project._id}/toggle-visibility`, { method: 'PATCH' });
    assert.equal(res.data.visible, false);
    const pub = await api('/api/projects', { auth: false });
    assert.ok(!pub.data.some((p) => p._id === project._id));
    assert.equal((await api(`/api/projects/${project._id}`, { auth: false })).status, 404);
    const admin = await api('/api/admin/projects');
    assert.ok(admin.data.some((p) => p._id === project._id));
    const explicit = await api(`/api/projects/${project._id}/toggle-visibility`, { method: 'PATCH', body: { visible: true } });
    assert.equal(explicit.data.visible, true);
  });

  test('reorder accepts a bare [{ id, order }] array', async () => {
    const admin = await api('/api/admin/projects');
    const reversed = [...admin.data].reverse().map((p, order) => ({ id: p._id, order }));
    const res = await api('/api/projects/reorder', { method: 'PATCH', body: reversed });
    assert.equal(res.status, 200);
    const pub = await api('/api/projects', { auth: false });
    assert.equal(pub.data[0]._id, project._id, 'last project is now first');
    assert.equal((await api('/api/projects/reorder', { method: 'PATCH', body: [{ id: 'x', order: 0 }] })).status, 400);
  });

  test('deleting a project removes all of its files from GridFS', async () => {
    const res = await api(`/api/projects/${project._id}`, { method: 'DELETE' });
    assert.equal(res.status, 200);
    assert.equal(res.data.filesDeleted, 2);
    assert.equal(await fileExists(thumb.fileId), false);
    assert.equal(await fileExists(g2.fileId), false);
    assert.equal((await api(`/api/projects/${project._id}`, { method: 'DELETE' })).status, 404);
  });
});

describe('other resources', () => {
  test('experience: isCurrent clears endDate; month format validated', async () => {
    const res = await api('/api/experience', {
      method: 'POST',
      body: { company: 'Acme', role: 'Dev', startDate: '2024-02', endDate: '2025-01', isCurrent: true, bullets: ['x', ' '] },
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.endDate, '');
    assert.deepEqual(res.data.bullets, ['x']);
    assert.equal((await api('/api/experience', { method: 'POST', body: { company: 'A', role: 'B', startDate: 'Jan 2024' } })).status, 400);
    assert.equal((await api(`/api/experience/${res.data._id}`, { method: 'DELETE' })).status, 200);
  });

  test('education: score type enum + year validation', async () => {
    const ok = await api('/api/education', {
      method: 'POST',
      body: { degree: 'BSc', institution: 'Uni', startYear: '2020', endYear: '2023', scoreType: 'Percentage', score: '88' },
    });
    assert.equal(ok.status, 201);
    assert.equal((await api('/api/education', { method: 'POST', body: { degree: 'X', institution: 'Y', scoreType: 'GPA' } })).status, 400);
    assert.equal((await api('/api/education', { method: 'POST', body: { degree: 'X', institution: 'Y', startYear: '20' } })).status, 400);
    await api(`/api/education/${ok.data._id}`, { method: 'DELETE' });
  });

  test('skills: string items are normalised; duplicate category is a 409', async () => {
    const res = await api('/api/skills', { method: 'POST', body: { category: 'Cloud', items: ['AWS', { name: 'GCP', level: 'Advanced' }] } });
    assert.equal(res.status, 201);
    assert.equal(res.data.items[0].name, 'AWS');
    assert.equal(res.data.items[1].level, 'Advanced');
    const dup = await api('/api/skills', { method: 'POST', body: { category: 'cloud' } });
    assert.equal(dup.status, 409);
    await api(`/api/skills/${res.data._id}`, { method: 'DELETE' });
  });

  test('certifications: PDF certificate file + replacement cleanup', async () => {
    const pdf = (await upload(PDF_BYTES, 'cert.pdf', 'application/pdf')).data;
    const res = await api('/api/certifications', {
      method: 'POST',
      body: { title: 'Cert', issuer: 'Org', credentialUrl: 'https://verify.me/1', file: { ...pdf, contentType: 'application/pdf' } },
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.file.contentType, 'application/pdf');
    const img = (await upload(await makePng(300, 200), 'cert.png', 'image/png')).data;
    await api(`/api/certifications/${res.data._id}`, {
      method: 'PUT',
      body: { file: { url: img.url, fileId: img.fileId, contentType: 'image/webp' } },
    });
    assert.equal(await fileExists(pdf.fileId), false);
    await api(`/api/certifications/${res.data._id}`, { method: 'DELETE' });
    assert.equal(await fileExists(img.fileId), false);
  });

  test('achievements: image removed on delete; public list sorted by order', async () => {
    const img = (await upload(await makePng(300, 200), 'award.png', 'image/png')).data;
    const res = await api('/api/achievements', { method: 'POST', body: { title: 'Award', image: img, date: '2025-05' } });
    assert.equal(res.status, 201);
    const pub = await api('/api/achievements', { auth: false });
    const orders = pub.data.map((a) => a.order);
    assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
    await api(`/api/achievements/${res.data._id}`, { method: 'DELETE' });
    assert.equal(await fileExists(img.fileId), false);
  });
});

describe('settings files (resume, profile image)', () => {
  test('replacing the resume deletes the old PDF; removing it deletes the file', async () => {
    const before = await api('/api/admin/settings');
    const oldId = before.data.resume.fileId;
    assert.ok(await fileExists(oldId));

    const pdf = (await upload(PDF_BYTES, 'New Resume.pdf', 'application/pdf', '?type=pdf')).data;
    const res = await api('/api/settings', {
      method: 'PUT',
      body: { resume: { url: pdf.url, fileId: pdf.fileId, fileName: 'New Resume.pdf' } },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.resume.fileId, pdf.fileId);
    assert.equal(res.data.resume.size, PDF_BYTES.length);
    assert.ok(res.data.resume.updatedAt);
    assert.equal(await fileExists(oldId), false, 'old resume deleted');

    const removed = await api('/api/settings', { method: 'PUT', body: { resume: { url: '', fileId: '' } } });
    assert.equal(removed.data.resume.url, '');
    assert.equal(await fileExists(pdf.fileId), false);
  });

  test('profile image replace + remove cleans up GridFS', async () => {
    const a = (await upload(await makePng(400, 400), 'me.png', 'image/png')).data;
    await api('/api/settings', { method: 'PUT', body: { profileImage: a } });
    const b = (await upload(await makePng(400, 400), 'me2.png', 'image/png')).data;
    const res = await api('/api/settings', { method: 'PUT', body: { profileImage: b } });
    assert.equal(res.data.profileImage.fileId, b.fileId);
    assert.equal(await fileExists(a.fileId), false);
    await api('/api/settings', { method: 'PUT', body: { profileImage: { url: '', fileId: '' } } });
    assert.equal(await fileExists(b.fileId), false);
  });
});

describe('messages', () => {
  let messageId;

  test('contact form validation + honeypot', async () => {
    const bad = await api('/api/contact', { method: 'POST', auth: false, body: { name: 'A', email: 'x', subject: '', message: '' } });
    assert.equal(bad.status, 400);
    const bot = await api('/api/contact', {
      method: 'POST',
      auth: false,
      body: { name: 'Bot', email: 'bot@spam.io', subject: 'Buy', message: 'Cheap stuff', website: 'http://spam' },
    });
    assert.equal(bot.status, 201);
    assert.equal(bot.data.id, null, 'honeypot submissions are not stored');
  });

  test('submit -> unread count -> read/unread -> delete', async () => {
    const sent = await api('/api/contact', {
      method: 'POST',
      auth: false,
      body: { name: 'Jane', email: 'jane@corp.com', subject: 'Hello', message: 'We would like to hire you' },
    });
    assert.equal(sent.status, 201);
    messageId = sent.data.id;

    assert.equal((await api('/api/messages/unread-count')).data.unread, 1);
    const list = await api('/api/messages');
    assert.equal(list.json.meta.unread, 1);
    assert.equal(list.data[0].name, 'Jane');

    assert.equal((await api(`/api/messages/${messageId}/read`, { method: 'PATCH' })).data.isRead, true);
    assert.equal((await api('/api/messages/unread-count')).data.unread, 0);
    assert.equal((await api(`/api/messages/${messageId}/read`, { method: 'PATCH', body: { isRead: false } })).data.isRead, false);
    assert.equal((await api('/api/messages?status=unread')).data.length, 1);

    assert.equal((await api(`/api/messages/${messageId}`, { method: 'DELETE' })).status, 200);
    assert.equal((await api('/api/messages/unread-count')).data.unread, 0);
  });

  test('inbox is admin-only', async () => {
    assert.equal((await api('/api/messages', { auth: false })).status, 401);
  });
});

describe('admin overview + maintenance', () => {
  test('stats endpoint', async () => {
    const res = await api('/api/admin/stats');
    assert.equal(res.status, 200);
    assert.equal(res.data.counts.projects.total, 4);
    assert.equal(res.data.counts.certifications.total, 7);
    assert.ok(res.data.lastUpdated);
    assert.ok(Array.isArray(res.data.recentMessages));
  });

  test('cleanup:files removes orphans but keeps referenced files', async () => {
    const { cleanupOrphanFiles } = require('../scripts/cleanupFiles');
    const keep = (await upload(await makePng(200, 200), 'keep.png', 'image/png')).data;
    await api('/api/settings', { method: 'PUT', body: { aboutImage: keep } });
    const orphan = (await upload(await makePng(200, 200), 'orphan.png', 'image/png')).data;

    const dry = await cleanupOrphanFiles({ dryRun: true, graceMinutes: 0 });
    assert.ok(dry.orphans.some((f) => f._id.toString() === orphan.fileId));
    assert.equal(await fileExists(orphan.fileId), true, 'dry run deletes nothing');

    const graced = await cleanupOrphanFiles({ graceMinutes: 30 });
    assert.equal(graced.deleted, 0, 'fresh uploads are protected by the grace period');

    const result = await cleanupOrphanFiles({ graceMinutes: 0 });
    assert.ok(result.deleted >= 1);
    assert.equal(await fileExists(orphan.fileId), false);
    assert.equal(await fileExists(keep.fileId), true);
  });

  test('seed is idempotent and migrates legacy documents', async () => {
    const { seedDatabase } = require('../seed/seeder');
    const Experience = require('../models/Experience');
    const Skill = require('../models/Skill');
    const Admin = require('../models/Admin');

    // Legacy-shaped docs exactly like the previous app version stored them
    await Experience.collection.insertOne({
      title: 'Legacy Role',
      company: 'Legacy Co',
      period: 'Mar 2024 – Present',
      current: true,
      description: ['Did things'],
      order: 99,
    });
    await Skill.collection.insertOne({ category: 'Legacy Skills', items: ['Perl', 'Cobol'], order: 99 });

    const counts = async () => ({
      projects: (await api('/api/admin/projects')).data.length,
      skills: (await api('/api/admin/skills')).data.length,
      experience: (await api('/api/admin/experience')).data.length,
      certifications: (await api('/api/admin/certifications')).data.length,
      achievements: (await api('/api/admin/achievements')).data.length,
      admins: await Admin.countDocuments(),
    });

    const settingsBefore = (await api('/api/admin/settings')).data;
    const before = await counts();
    await seedDatabase({ log: () => {} });
    await seedDatabase({ log: () => {} });
    assert.deepEqual(await counts(), before, 'no duplicates after running the seed twice');

    const settingsAfter = (await api('/api/admin/settings')).data;
    assert.equal(settingsAfter.contact.email, settingsBefore.contact.email, 'admin edits are not overwritten');

    const legacy = (await api('/api/admin/experience')).data.find((e) => e.company === 'Legacy Co');
    assert.equal(legacy.role, 'Legacy Role');
    assert.equal(legacy.startDate, '2024-03');
    assert.equal(legacy.isCurrent, true);
    assert.deepEqual(legacy.bullets, ['Did things']);
    const legacySkill = (await api('/api/admin/skills')).data.find((s) => s.category === 'Legacy Skills');
    assert.equal(legacySkill.items[0].name, 'Perl');
  });

  test('public GET /settings never writes; seed populates an empty auto-created settings doc', async () => {
    const SiteSettings = require('../models/SiteSettings');
    const { seedDatabase } = require('../seed/seeder');
    await SiteSettings.deleteMany({});

    const pub = await api('/api/settings', { auth: false });
    assert.equal(pub.status, 200);
    assert.equal(await SiteSettings.countDocuments(), 0, 'public read must not create a document');

    await SiteSettings.getSettings(); // simulates an empty doc created before seeding
    await seedDatabase({ log: () => {} });
    const after = await api('/api/settings', { auth: false });
    assert.equal(after.data.fullName, 'Vinothalakshmi M');
    assert.equal(await SiteSettings.countDocuments(), 1);
  });
});

describe('account security', () => {
  test('change e-mail requires the current password', async () => {
    const wrong = await api('/api/auth/change-email', { method: 'POST', body: { newEmail: 'owner@test.dev', currentPassword: 'bad' } });
    assert.equal(wrong.status, 400);
    const ok = await api('/api/auth/change-email', {
      method: 'POST',
      body: { newEmail: 'owner@test.dev', currentPassword: 'TestPass123' },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.admin.email, 'owner@test.dev');
    token = ok.data.token;
  });

  test('change password: weak rejected, old tokens invalidated, new login works', async () => {
    const weak = await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: 'TestPass123', newPassword: 'short' } });
    assert.equal(weak.status, 400);

    const oldToken = token;
    // JWT iat has 1s resolution: make sure the change happens in a later second than the old token
    await new Promise((r) => setTimeout(r, 1100));
    const ok = await api('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword: 'TestPass123', newPassword: 'BrandNew456' },
    });
    assert.equal(ok.status, 200);
    token = ok.data.token;

    const stale = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${oldToken}` } });
    assert.equal(stale.status, 401, 'tokens issued before the change are rejected');
    assert.equal((await api('/api/auth/me')).status, 200, 'fresh token works');

    const login = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: 'owner@test.dev', password: 'BrandNew456' },
    });
    assert.equal(login.status, 200);
  });
});
