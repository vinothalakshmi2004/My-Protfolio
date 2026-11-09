# Vinothalakshmi M — Developer Portfolio + Admin Dashboard

A MERN portfolio whose landing page is **100% driven by the database**, plus a secure,
fully responsive admin dashboard at `/admin` to create, edit, delete, hide and reorder everything on it.

> **Files are stored in MongoDB GridFS. If using MongoDB Atlas free tier (512MB), keep images small. Images are auto-compressed to webp.**

```
vino-protfolio/
├── server/   Express + MongoDB API, GridFS uploads, JWT admin auth, seed + tests   → server/README.md
├── client/   React 18 + Vite + Tailwind: landing page (/) and admin dashboard (/admin) → client/README.md
└── render.yaml   Render blueprint for the API
```

## Quick start

```bash
# 1. API
cd server
npm install
cp .env.example .env        # set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD ...
npm run seed                # idempotent — safe to run again
npm run dev                 # http://localhost:5000

# 2. Website + dashboard (new terminal)
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173  ·  admin: http://localhost:5173/admin
```

No database handy? `cd server && npm run dev:memory` runs the API on a pre-seeded in-memory MongoDB.

## Useful commands

| Command | |
| --- | --- |
| `npm --prefix server test` | 42 end-to-end API tests (in-memory DB) |
| `npm --prefix server run cleanup:files` | Delete orphaned GridFS files (`-- --dry-run` to preview) |
| `mongodump --uri="$MONGO_URI" --archive=backup.gz --gzip` | Full backup — includes all uploaded images and PDFs |

## Deploy

- **Database**: MongoDB Atlas (free tier is fine — images are compressed to WebP).
- **API**: Render, root `server`, `npm install` / `npm start` (see `render.yaml`). Run `npm run seed` once from the Render shell.
- **Website**: Vercel, root `client`, env `VITE_API_URL=https://<api>.onrender.com/api`. Then set `CLIENT_URL` on Render to the Vercel URL.

Full details: [server/README.md](server/README.md) · [client/README.md](client/README.md)
