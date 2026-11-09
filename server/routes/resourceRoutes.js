/**
 * Builds the router for one portfolio resource:
 *
 *   GET    /api/<path>                       public  – visible items, sorted by order
 *   GET    /api/<path>/:id                   public  – one visible item (projects: id or slug)
 *   POST   /api/<path>                       admin   – create
 *   PATCH  /api/<path>/reorder               admin   – body [{ id, order }]
 *   PATCH  /api/<path>/:id/toggle-visibility admin   – flip (or set { visible })
 *   PUT    /api/<path>/:id                   admin   – partial update
 *   DELETE /api/<path>/:id                   admin   – delete record + its GridFS files
 *
 * The admin list (including hidden items) lives at GET /api/admin/<path> (see adminRoutes).
 */
const express = require('express');
const { param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const validators = require('../validators');

const buildResourceRouter = (resource, controller) => {
  const router = express.Router();
  const idRule = resource.findPublicOne
    ? [param('id').isString().isLength({ min: 1, max: 100 })] // projects accept id OR slug
    : validators.idParam();

  // Public
  router.get('/', controller.listPublic);
  router.get('/:id', rules(idRule), controller.getPublicOne);

  // Admin (JWT protected). /reorder is declared before /:id routes.
  router.post('/', protect, rules(resource.rules(false)), controller.create);
  router.patch('/reorder', protect, rules(validators.reorder()), controller.reorder);
  router.patch('/:id/toggle-visibility', protect, rules(validators.idParam()), controller.toggleVisibility);
  router.put('/:id', protect, rules([...validators.idParam(), ...resource.rules(true)]), controller.update);
  router.delete('/:id', protect, rules(validators.idParam()), controller.remove);

  return router;
};

module.exports = { buildResourceRouter };
