# Portfolio API (Express + MongoDB + GridFS)

REST API behind the portfolio website and its admin dashboard. Every piece of content
on the landing page (text, links, images, files, section order/visibility, SEO) lives in
MongoDB and is edited from `/admin`.

> **Files are stored in MongoDB GridFS. If using MongoDB Atlas free tier (512MB), keep images small. Images are auto-compressed to webp.**

No Cloudinary, S3, Firebase or local disk storage is used. Uploads go
`multer (memory) → validation → sharp (images → WebP, max 1600px wide, quality 80) → GridFS bucket "uploads"`.

---

## 1. Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed              # idempotent: safe to run any time
npm run dev               # http://localhost:5000  (auto-restarts on file changes)
```

Want to try everything without touching your real database?

```bash
npm run dev:memory        # in-memory MongoDB, pre-seeded, wiped on exit
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string (Atlas or local). Files are stored in the same database. |
| `JWT_SECRET` | yes (prod) | Long random string (16+ chars). The server refuses to start in production without it. |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d`. |
| `PORT` | no | Default `5000` (Render sets it automatically). |
| `CLIENT_URL` | yes (prod) | Allowed CORS origin(s) — e.g. `https://your-site.vercel.app`. Comma-separate several, or `*` for any. |
| `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` | no | Contact-form e-mail notifications (Gmail needs an App Password). Messages are always saved in the DB. |
| `NOTIFICATION_RECEIVER_EMAIL` | no | Where notifications go (defaults to `ADMIN_EMAIL`). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes (first seed) | Creates the admin account when none exists. Never overwrites an existing admin. |
| `MAX_IMAGE_MB` | no | Max image upload size, default `5`. |
| `MAX_PDF_MB` | no | Max PDF upload size, default `10`. |

---

## 2. Logging in as admin

1. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (password: 8+ characters with a letter and a number).
2. Run `npm run seed` — it creates the admin **only if no admin exists yet**.
3. Open the client at `/admin/login` and sign in.
4. Change the e-mail or password any time from **/admin/account** (old sessions are signed out automatically).

Forgot the password? Delete the admin document (`db.admins.deleteOne({})` in `mongosh`) and run `npm run seed` again.

Security: bcrypt (12 rounds) password hashes, 7-day JWTs, tokens invalidated on password change,
login limited to **5 failed attempts per 15 minutes** per IP, helmet headers, NoSQL-operator stripping,
express-validator on every input (whitelisted fields only), URL sanitising (`javascript:` etc. rejected).

---

## 3. Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API with auto-reload (`node --watch`) |
| `npm start` | Production start |
| `npm run dev:memory` | API on a throw-away in-memory MongoDB, pre-seeded |
| `npm run seed` | **Idempotent** seed: upgrades documents from the old app version, inserts missing resume data, creates the admin if missing, uploads `seed/assets/resume.pdf` to GridFS if no resume exists. Never overwrites admin edits; safe to run twice. |
| `npm run seed:reset` | Replaces all **content** with the seed data (keeps admin + messages). |
| `npm run seed:destroy -- --yes` | Deletes everything, including files, admin and messages. |
| `npm run cleanup:files` | Removes orphaned GridFS files (see below). |
| `npm test` | 42 end-to-end API tests on an in-memory MongoDB (never touches your DB). |

### `npm run cleanup:files`

Deletes GridFS files that no document references any more — for example an image
uploaded in a form that was closed without saving, or left behind after a crash.

```bash
npm run cleanup:files                          # delete orphans older than 30 minutes
npm run cleanup:files -- --dry-run             # only list what would be deleted
npm run cleanup:files -- --grace-minutes=0     # delete every orphan immediately
```

The 30-minute grace period protects uploads that are sitting in an admin form that hasn't been saved yet.
Normal use creates no orphans: replacing or deleting a file, project, certificate, resume, profile image,
etc. deletes the old file from GridFS automatically, and the dashboard deletes unsaved uploads on Cancel.

---

## 4. Backing up the database (it contains your files too)

Because images and PDFs live **inside** MongoDB (`uploads.files` + `uploads.chunks`), a database
backup is a complete backup of the site. Use the MongoDB Database Tools
([download](https://www.mongodb.com/try/download/database-tools)):

```bash
# Backup (creates ./dump/<db-name>/...)
mongodump --uri="mongodb+srv://USER:PASS@cluster.mongodb.net/portfolio" --out=./dump

# Compressed single-file archive
mongodump --uri="$MONGO_URI" --archive=portfolio-$(date +%F).gz --gzip

# Restore (--drop replaces existing collections)
mongorestore --uri="$MONGO_URI" --archive=portfolio-2026-01-31.gz --gzip --drop
```

Keep backups out of git (`dump/` and `backups/` are already in `.gitignore`).
On Atlas paid tiers you can also enable automatic cloud backups.

---

## 5. Deploying

### MongoDB Atlas
1. Create a free cluster → **Database Access**: add a user → **Network Access**: allow `0.0.0.0/0`
   (Render uses changing IPs) → copy the connection string into `MONGO_URI`.
2. Free tier = 512MB shared between data **and files**. Images are compressed to WebP automatically;
   the dashboard overview shows how much GridFS storage you use.

### Render (API)
1. New → **Web Service** → connect the repo (or use `render.yaml` at the repo root as a Blueprint).
2. Root directory `server`, build `npm install`, start `npm start`, health check `/api/health`.
3. Environment: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=https://<your-vercel-app>.vercel.app`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, optional e-mail vars, `MAX_IMAGE_MB=5`, `MAX_PDF_MB=10`.
4. After the first deploy open the Render **Shell** and run `npm run seed` once.

Free Render instances sleep when idle; the first request can take ~30s. The website shows its
built-in fallback content after 8 seconds and swaps to live data when the API wakes up.

---

## 6. API reference

All responses use `{ success, message, data, meta? }` or `{ success: false, message, errors? }`.
🔒 = requires `Authorization: Bearer <token>`.

### Auth
| Method | Path | |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, admin }` (5 failed attempts / 15 min) |
| GET | `/api/auth/me` 🔒 | Current admin |
| POST | `/api/auth/change-password` 🔒 | `{ currentPassword, newPassword }` → new `{ token, admin }` |
| POST | `/api/auth/change-email` 🔒 | `{ newEmail, currentPassword }` → new `{ token, admin }` |

### Settings (singleton)
| Method | Path | |
| --- | --- | --- |
| GET | `/api/settings` | Public settings (phone hidden unless `showPhonePublicly`; hidden social links removed) |
| GET | `/api/admin/settings` 🔒 | Full settings |
| PUT | `/api/settings` 🔒 | Partial update, e.g. `{ contact: { email } }` only changes that field. Replaced files are deleted from GridFS. |

Fields: `fullName, headline, typingRoles[], summary, aboutLongText, hero{greeting, availabilityText, showAvailability},
profileImage, aboutImage, favicon, resume{url, fileId, fileName, size, updatedAt}, contact{email, phone, showPhonePublicly,
location, whatsapp, intro, responseTime}, socialLinks[{platform, label, url, icon, visible}], stats[{label, value, subtext}],
sectionVisibility{about, skills, experience, projects, education, certifications, achievements, contact}, sectionOrder[],
sectionContent{<section>: {navLabel, badge, title, subtitle}}, seo{title, description, keywords, ogImage}, theme{primaryColor, secondaryColor}, footerText`.

### Files (GridFS)
| Method | Path | |
| --- | --- | --- |
| POST | `/api/upload` 🔒 | multipart field `file`; optional `?type=image\|pdf`. Images (.jpg .jpeg .png .webp ≤5MB) → WebP; PDF (≤10MB) as-is. MIME **and** extension must match. → `{ fileId, url: "/api/files/<id>", filename, contentType, size }` |
| DELETE | `/api/upload/:id` 🔒 | Delete a file |
| GET/HEAD | `/api/files/:id` | Stream a file. ETag/304 support. Images: `Cache-Control: public, max-age=31536000, immutable`. PDFs inline; `?download=1` → attachment with the original filename. |

### Content resources
`projects`, `experience`, `skills`, `education`, `certifications`, `achievements` all share:

| Method | Path | |
| --- | --- | --- |
| GET | `/api/<resource>` | Visible items sorted by `order` (projects: `?featured=true&category=MERN`) |
| GET | `/api/<resource>/:id` | One visible item (projects also accept the slug) |
| GET | `/api/admin/<resource>` 🔒 | All items, including hidden |
| POST | `/api/<resource>` 🔒 | Create (appended at the end) |
| PUT | `/api/<resource>/:id` 🔒 | Partial update; removed/replaced files deleted from GridFS |
| DELETE | `/api/<resource>/:id` 🔒 | Delete + delete its files → `{ id, filesDeleted }` |
| PATCH | `/api/<resource>/reorder` 🔒 | Body `[{ id, order }]` (or `{ items: [...] }`) |
| PATCH | `/api/<resource>/:id/toggle-visibility` 🔒 | Flip `visible`, or set it with `{ visible: true\|false }` |

Every item has `order`, `visible`, `createdAt`, `updatedAt`. Shapes:
- **Project**: `title, slug, shortDescription, fullDescription, category, techStack[], features[], thumbnail{url,fileId}, gallery[{url,fileId}], githubUrl, liveUrl, featured`
- **Experience**: `company, role, location, startDate "YYYY-MM", endDate, isCurrent, bullets[], companyLogo{url,fileId}`
- **Education**: `degree, institution, location, startYear, endYear, scoreType (CGPA|Percentage|Grade), score, notes`
- **Skill**: `category, items[{name, icon, level}]`
- **Certification**: `title, issuer, issueDate "YYYY-MM", credentialUrl, file{url, fileId, contentType}` (image or PDF)
- **Achievement**: `title, description, date "YYYY-MM", image{url,fileId}`

### Messages & misc
| Method | Path | |
| --- | --- | --- |
| POST | `/api/contact` | Public contact form (5 / 15 min per IP, honeypot field `website`) |
| GET | `/api/messages` 🔒 | Inbox, newest first; `?status=unread\|read`; `meta: { total, unread }` |
| GET | `/api/messages/unread-count` 🔒 | `{ unread }` |
| GET | `/api/messages/:id` 🔒 | One message |
| PATCH | `/api/messages/:id/read` 🔒 | Mark read; `{ isRead: false }` marks unread |
| DELETE | `/api/messages/:id` 🔒 | Delete |
| GET | `/api/admin/stats` 🔒 | Overview counts, unread messages, last update, storage usage, recent messages |
| GET | `/api/health` | Health check |

---

## 7. Project structure

```
server/
├── app.js                 Express app (security, CORS, routes)
├── server.js              Entry: connect MongoDB → listen
├── config/                db.js, gridfs.js (bucket "uploads"), resources.js (CRUD registry)
├── controllers/           auth, settings, messages, files, admin stats
├── middleware/            auth (JWT), uploads (multer + sharp), rate limits, validation, sanitising, errors
├── models/                SiteSettings, Project, Experience, Skill, Education, Certification, Achievement, Message, Admin
├── routes/                route modules; resourceRoutes.js generates the 6 CRUD routers
├── validators/            express-validator rules (whitelist every field)
├── utils/                 crudFactory, fileRefs (orphan-proof file cleanup), sanitizers, jwt, e-mail
├── seed/                  seeder.js (idempotent + legacy migration), seedData.js, assets/resume.pdf
├── scripts/               cleanupFiles.js, devMemory.js
└── test/api.test.js       end-to-end API tests (node:test + mongodb-memory-server)
```
