# Portfolio Client (React + Vite + Tailwind)

Two apps in one bundle:

- **`/`**: the public portfolio. **100% data-driven**: every text, link, image, file,
  section order and SEO tag comes from the API. Nothing about the owner is hardcoded.
- **`/admin`**: a protected dashboard to create, edit, delete, hide and reorder everything
  shown on the landing page. It is lazy-loaded, so visitors never download it.

> **Files are stored in MongoDB GridFS. If using MongoDB Atlas free tier (512MB), keep images small. Images are auto-compressed to webp.**

---

## 1. Setup

```bash
cd client
npm install
cp .env.example .env       # set VITE_API_URL
npm run dev                # http://localhost:5173
```

Start the API first (`cd ../server && npm run dev`, or `npm run dev:memory` for a throw-away database).

| Variable | Example | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API. Uploaded files are loaded from the same origin (`http://localhost:5000/api/files/<id>`), so this one variable makes files work in dev and production. |

## 2. Logging in as admin

1. Seed the admin on the server (`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`, then `npm run seed`).
2. Open **http://localhost:5173/admin**. You'll be redirected to `/admin/login`.
3. After signing in you land on the overview. Change your e-mail/password at **/admin/account**.

The token is kept in `localStorage` (the API runs on another domain, so cookies would be blocked as
third-party cookies). It is cleared automatically on logout, on any `401` response and when it expires (7 days).

## 3. Admin pages

| Route | Purpose |
| --- | --- |
| `/admin` | Overview: stat cards, storage usage, recent messages, quick actions |
| `/admin/profile` | Name, headline, typing roles (chips), summary, About text, profile/About images, stats |
| `/admin/contact-social` | E-mail, phone (+ "show publicly"), WhatsApp, location, social links (add / edit / hide / reorder) |
| `/admin/resume` | Upload / replace / preview / download / delete the resume PDF (live immediately) |
| `/admin/projects` | Search, category filter, drag-to-reorder, visibility toggle, add/edit drawer with thumbnail + gallery |
| `/admin/experience`, `/education`, `/skills`, `/certifications`, `/achievements` | Same list / add / edit / delete / reorder / hide pattern |
| `/admin/sections` | Show/hide sections (navbar link hides too), reorder them, edit each section's headings |
| `/admin/seo` | Site title, description, keywords, OG image, favicon, theme colours, footer text |
| `/admin/messages` | Inbox: read/unread, delete, reply (mailto) |
| `/admin/account` | Change login e-mail and password |

Edits show up on the landing page after a refresh. No code change or redeploy needed.

## 4. How the landing page gets its data

`src/hooks/usePortfolioData.js` loads `/settings`, `/projects`, `/experience`, `/skills`, `/education`,
`/certifications` and `/achievements` in parallel.

- A request that **fails** uses the matching part of `src/data/fallback.js`.
- A request that succeeds with an **empty** list hides that section (e.g. no certificates → no section, no nav link).
- If the API is slow (Render free tier cold start), fallback content is shown after 8s and replaced by live data once it arrives.

## 5. Project structure

```
src/
├── main.jsx, router.jsx         providers + routes (admin routes lazy-loaded)
├── lib/apiClient.js             axios clients, fileUrl(), token storage, 401 auto-logout
├── services/                    publicApi.js (landing), adminApi.js (dashboard)
├── hooks/                       usePortfolioData, useActiveSection
├── utils/                       sections, format (dates/scores), icons (social + skill logos), color (theme)
├── data/fallback.js             offline fallback content
├── pages/                       LandingPage, NotFoundPage
├── sections/                    Hero, About, Skills, Experience, Projects, Education, Certifications, Achievements, Contact
├── components/                  Navbar, Footer, ProjectModal, SafeImage, Seo, ThemeColors, SocialLinks, ...
└── admin/
    ├── AdminRoot.jsx            auth + confirm-dialog providers
    ├── layout/                  AdminLayout (sidebar/drawer + header), ProtectedRoute, navItems
    ├── pages/                   one file per admin route
    ├── forms/                   resource forms (React Hook Form + Zod), shared fields
    ├── components/              DataTable, FormDrawer, Modal, ImageUploader, FileUploader, GalleryUploader,
    │                            TagInput, StringListInput, SortableList, ConfirmDialog, EmptyState, Skeletons, StatusBadge ...
    ├── context/                 AuthContext, ConfirmContext
    └── hooks/                   useResourceList, useAdminSettings, usePendingUploads, useUnsavedChanges, ...
```

## 6. Responsive design

Mobile-first Tailwind (`base → sm 640 → md 768 → lg 1024 → xl 1280`), tested at 320, 375, 768, 1024, 1440 and 1920px
with no horizontal scrolling. Breakpoint decisions are commented in the code (search for `Mobile:` or `lg+`).

- **Landing**: hamburger drawer below `lg`; hero stacks on mobile with fluid `clamp()` font sizes and full-width buttons;
  grids go 1 → 2 (`md`) → 3 (`lg`) columns; the timeline is a single left-aligned column below `lg`; contact form and
  details stack until `lg`; modals are full-screen on phones; touch targets ≥ 44px; `min-h-dvh` for mobile browser bars.
- **Admin**: sidebar fixed on `lg+`, off-canvas drawer with overlay below; tables become stacked cards below `md`
  (secondary columns appear from `xl`); forms are 1 column on mobile and 2 from `md`, with a sticky Save bar;
  drawers/modals are full-screen on phones; drag-and-drop uses a handle + TouchSensor (press and hold ~0.1s on touch).

## 7. Deploying to Vercel

1. Import the repo in Vercel and set **Root Directory** to `client` (framework preset: Vite).
2. Environment variable: `VITE_API_URL=https://<your-api>.onrender.com/api`.
3. Deploy. `vercel.json` rewrites every path to `index.html`, so `/admin/...` deep links work.
4. On the API (Render), set `CLIENT_URL=https://<your-app>.vercel.app` so CORS allows the site.

Note: search engines and most link-preview bots don't run JavaScript, so they see the generic tags in `index.html`
until they render the page. Google does render JavaScript, so it picks up the SEO tags set from `/admin/seo`.

## 8. Backups and file cleanup

Everything, including uploaded images and PDFs, lives in MongoDB, so back it up with `mongodump`:

```bash
mongodump --uri="<your MONGO_URI>" --archive=portfolio-backup.gz --gzip
mongorestore --uri="<your MONGO_URI>" --archive=portfolio-backup.gz --gzip --drop
```

To remove orphaned files from GridFS (e.g. uploads from forms that were never saved), run on the server:

```bash
cd server && npm run cleanup:files            # add -- --dry-run to preview
```

See `server/README.md` for details.
