/**
 * Generic CRUD controller factory used by every orderable resource
 * (projects, experience, skills, education, certifications, achievements).
 *
 * Each handler:
 *  - reads input only via matchedData() (validated + whitelisted fields)
 *  - keeps GridFS clean: files dropped by an update, or owned by a deleted
 *    record, are removed AFTER the database write succeeds
 */
const { matchedData } = require('express-validator');
const asyncHandler = require('./asyncHandler');
const { successResponse, errorResponse } = require('./apiResponse');
const { collectFileIds, cleanupReplacedFiles, deleteFilesIfUnreferenced } = require('./fileRefs');

const SORT = { order: 1, createdAt: 1 };

const createCrudController = (resource) => {
  const { Model, label, prepare, publicFilter, findPublicOne } = resource;
  const notFound = (res) => errorResponse(res, `${label} not found`, 404);
  const bodyData = (req) => matchedData(req, { locations: ['body'], includeOptionals: false });

  /** GET /api/<resource> — public: visible items only, sorted by order */
  const listPublic = asyncHandler(async (req, res) => {
    const filter = { visible: { $ne: false }, ...(publicFilter ? publicFilter(req.query) : {}) };
    const items = await Model.find(filter).sort(SORT);
    return successResponse(res, items, `${label} list retrieved`, 200, { count: items.length });
  });

  /** GET /api/admin/<resource> — admin: everything, including hidden items */
  const listAdmin = asyncHandler(async (req, res) => {
    const items = await Model.find({}).sort(SORT);
    return successResponse(res, items, `All ${label.toLowerCase()} items retrieved`, 200, { count: items.length });
  });

  /** GET /api/<resource>/:id — public single item (hidden items are 404) */
  const getPublicOne = asyncHandler(async (req, res) => {
    const item = findPublicOne
      ? await findPublicOne(req.params.id)
      : await Model.findOne({ _id: req.params.id, visible: { $ne: false } });
    if (!item) return notFound(res);
    return successResponse(res, item, `${label} retrieved`);
  });

  /** POST /api/<resource> — create (appended to the end unless order is given) */
  const create = asyncHandler(async (req, res) => {
    const data = bodyData(req);
    if (data.order === undefined) {
      const last = await Model.findOne({}).sort({ order: -1 }).select('order').lean();
      data.order = last ? (last.order || 0) + 1 : 0;
    }
    if (prepare) await prepare(data, { Model, existing: null });
    const item = await Model.create(data);
    return successResponse(res, item, `${label} created successfully`, 201);
  });

  /** PUT /api/<resource>/:id — partial update; replaced/removed files are deleted from GridFS */
  const update = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return notFound(res);

    const before = item.toObject();
    const data = bodyData(req);
    if (prepare) await prepare(data, { Model, existing: item });

    item.set(data);
    await item.save(); // full schema validation + hooks

    await cleanupReplacedFiles(before, item.toObject());
    return successResponse(res, item, `${label} updated successfully`);
  });

  /** DELETE /api/<resource>/:id — deletes the record and every file it owned */
  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return notFound(res);

    const ownedFiles = collectFileIds(item);
    await item.deleteOne();
    const filesDeleted = await deleteFilesIfUnreferenced(ownedFiles);

    return successResponse(res, { id: req.params.id, filesDeleted }, `${label} deleted successfully`);
  });

  /** PATCH /api/<resource>/reorder — body: [{ id, order }] (or { items: [...] }) */
  const reorder = asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    await Model.bulkWrite(
      items.map((entry) => ({
        updateOne: { filter: { _id: entry.id || entry._id }, update: { $set: { order: entry.order } } },
      }))
    );
    const all = await Model.find({}).sort(SORT);
    return successResponse(res, all, `${label} order saved`);
  });

  /**
   * PATCH /api/<resource>/:id/toggle-visibility
   * Flips `visible`, or sets it explicitly when the body contains { visible: true|false }.
   */
  const toggleVisibility = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return notFound(res);
    item.visible = typeof req.body?.visible === 'boolean' ? req.body.visible : item.visible === false;
    await item.save();
    return successResponse(res, item, `${label} is now ${item.visible ? 'visible' : 'hidden'}`);
  });

  return { listPublic, listAdmin, getPublicOne, create, update, remove, reorder, toggleVisibility };
};

module.exports = { createCrudController };
