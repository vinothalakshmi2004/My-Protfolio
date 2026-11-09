/**
 * File-reference bookkeeping so GridFS never keeps orphan files.
 *
 * Every schema stores files as { url, fileId }. Instead of hard-coding which
 * fields hold files, we walk documents and collect every `fileId` value. That
 * makes cleanup automatic for thumbnails, galleries, logos, resumes, etc.
 */
const { isValidFileId, deleteMultipleFilesFromGridFS } = require('../config/gridfs');

const toPlain = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);

/** Recursively collects every non-empty `fileId` string inside a value. */
const collectFileIds = (value, out = new Set()) => {
  const plain = toPlain(value);
  if (Array.isArray(plain)) {
    plain.forEach((item) => collectFileIds(item, out));
  } else if (plain && typeof plain === 'object' && !(plain instanceof Date)) {
    Object.entries(plain).forEach(([key, val]) => {
      if (key === 'fileId' && isValidFileId(val)) {
        out.add(String(val));
      } else if (val && typeof val === 'object') {
        collectFileIds(val, out);
      }
    });
  }
  return out;
};

/** Models whose documents can reference GridFS files (lazy-required to avoid cycles). */
const fileOwningModels = () => [
  require('../models/SiteSettings'),
  require('../models/Project'),
  require('../models/Experience'),
  require('../models/Certification'),
  require('../models/Achievement'),
];

/** Set of every fileId referenced anywhere in the database. */
const getAllReferencedFileIds = async () => {
  const ids = new Set();
  for (const Model of fileOwningModels()) {
    const docs = await Model.find({}).lean();
    docs.forEach((doc) => collectFileIds(doc, ids));
  }
  return ids;
};

/**
 * Deletes the given files from GridFS unless some document still references
 * them (protects against accidental shared references).
 * @returns {Promise<number>} number of files deleted
 */
const deleteFilesIfUnreferenced = async (ids) => {
  const candidates = [...new Set([...(ids || [])].filter(isValidFileId))];
  if (candidates.length === 0) return 0;
  const referenced = await getAllReferencedFileIds();
  return deleteMultipleFilesFromGridFS(candidates.filter((id) => !referenced.has(id)));
};

/** Deletes files that were referenced by `before` but are no longer referenced by `after`. */
const cleanupReplacedFiles = async (before, after) => {
  const beforeIds = collectFileIds(before);
  const afterIds = collectFileIds(after);
  const removed = [...beforeIds].filter((id) => !afterIds.has(id));
  return deleteFilesIfUnreferenced(removed);
};

module.exports = {
  collectFileIds,
  getAllReferencedFileIds,
  deleteFilesIfUnreferenced,
  cleanupReplacedFiles,
};
