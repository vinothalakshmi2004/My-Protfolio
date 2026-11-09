/**
 * Admin-only read endpoints (everything here requires a valid JWT):
 *   GET /api/admin/stats        dashboard overview numbers
 *   GET /api/admin/settings     full settings (incl. private phone + hidden social links)
 *   GET /api/admin/<resource>   every item incl. hidden ones (projects, experience, skills, ...)
 */
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/adminController');
const { getAdminSettings } = require('../controllers/settingsController');

const buildAdminRouter = (resourceControllers) => {
  const router = express.Router();
  router.use(protect);

  router.get('/stats', getStats);
  router.get('/settings', getAdminSettings);
  resourceControllers.forEach(({ resource, controller }) => {
    router.get(`/${resource.path}`, controller.listAdmin);
  });

  return router;
};

module.exports = { buildAdminRouter };
