/**
 * Express application (no DB connection / no listen) — imported by server.js and the tests.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const resources = require('./config/resources');
const { createCrudController } = require('./utils/crudFactory');
const { apiLimiter } = require('./middleware/rateLimiterMiddleware');
const { sanitizeRequest } = require('./middleware/sanitizeMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { buildResourceRouter } = require('./routes/resourceRoutes');
const { buildAdminRouter } = require('./routes/adminRoutes');

const app = express();

// Behind Render/Heroku/Nginx: trust the first proxy so rate limiting sees the real client IP
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers. CORP must be "cross-origin" so the SPA (different origin) can
// embed images served from /api/files/* — helmet's default "same-origin" would block them.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ---- CORS: CLIENT_URL may be "*" or a comma-separated list of origins ----
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'];
const allowAll = configuredOrigins.includes('*');
const allowedOrigins = new Set([...configuredOrigins, ...(process.env.NODE_ENV === 'production' ? [] : devOrigins)]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, server-to-server) send no Origin header
      if (!origin || allowAll || allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false); // browser will block the response; no error noise in logs
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
    exposedHeaders: ['ETag', 'Content-Disposition'],
    maxAge: 86400,
  })
);

// Body parsers (file uploads use multipart via multer, so JSON can stay small)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeRequest);

// General rate limit for /api (file downloads + authenticated admin calls are exempt)
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Portfolio API is healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Portfolio API', health: '/api/health' });
});

// ---- Routes ----
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Generated CRUD routers: /api/projects, /api/experience, /api/skills, ...
const resourceControllers = resources.map((resource) => ({ resource, controller: createCrudController(resource) }));
resourceControllers.forEach(({ resource, controller }) => {
  app.use(`/api/${resource.path}`, buildResourceRouter(resource, controller));
});
// Admin-only lists + stats: /api/admin/*
app.use('/api/admin', buildAdminRouter(resourceControllers));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
